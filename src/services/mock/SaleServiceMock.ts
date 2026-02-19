import type {
  SaleService,
  SaleWithDetails,
  CreateSaleRequest,
  UpdateSaleRequest
} from "../interfaces/SaleService";
import { mockStore, type Sale, type SaleItem, type Customer, type Product } from "./store";
import { authService, productService } from "../index";

/**
 * Mock implementation of SaleService.
 * Uses in-memory store. Stock and customer ledger are automatically updated when sales are created/updated/deleted.
 */
export class SaleServiceMock implements SaleService {
  /**
   * Get current session tenant ID
   */
  private getTenantId(): string {
    const session = authService.getSession();
    if (!session) {
      throw new Error("UNAUTHORIZED");
    }
    return session.tenant.id;
  }

  /**
   * Convert Sale to SaleWithDetails
   */
  private saleWithDetails(sale: Sale): SaleWithDetails {
    const customer = mockStore.getCustomerById(sale.customerId);
    const customerName = customer?.name || "Unknown Customer";

    const itemDetails = sale.items.map((item) => {
      const product = mockStore.getProductById(item.productId);
      return {
        ...item,
        productName: product?.name || "Unknown Product",
        productUnit: product?.unit || ""
      };
    });

    return {
      ...sale,
      customerName,
      itemDetails
    };
  }

  /**
   * Check if sufficient stock is available for sale items
   */
  private async checkStockAvailability(items: SaleItem[], tenantId: string): Promise<void> {
    const products = await productService.getProducts();

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`PRODUCT_NOT_FOUND: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`INSUFFICIENT_STOCK: ${product.name} has only ${product.stock} ${product.unit} available, but ${item.quantity} ${product.unit} requested`);
      }
    }
  }

  async getSales(): Promise<SaleWithDetails[]> {
    const tenantId = this.getTenantId();
    const sales = mockStore.getSalesByTenant(tenantId);
    return sales.map((s) => this.saleWithDetails(s));
  }

  async getSaleById(id: string): Promise<SaleWithDetails | null> {
    const tenantId = this.getTenantId();
    const sale = mockStore.getSaleById(id);

    if (!sale) {
      return null;
    }

    // Ensure sale belongs to current tenant
    if (sale.tenantId !== tenantId) {
      return null;
    }

    return this.saleWithDetails(sale);
  }

  async createSale(request: CreateSaleRequest): Promise<Sale> {
    const tenantId = this.getTenantId();

    // Validate required fields
    if (!request.customerId?.trim()) {
      throw new Error("CUSTOMER_ID_REQUIRED");
    }
    if (!request.date?.trim()) {
      throw new Error("SALE_DATE_REQUIRED");
    }
    if (!request.items || request.items.length === 0) {
      throw new Error("SALE_ITEMS_REQUIRED");
    }

    // Validate customer exists and belongs to tenant
    const customer = mockStore.getCustomerById(request.customerId);
    if (!customer) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }
    if (customer.tenantId !== tenantId) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    // Validate items
    for (const item of request.items) {
      if (!item.productId?.trim()) {
        throw new Error("PRODUCT_ID_REQUIRED");
      }
      if (item.quantity <= 0) {
        throw new Error("INVALID_QUANTITY");
      }
      if (item.price < 0) {
        throw new Error("INVALID_PRICE");
      }

      // Validate product exists and belongs to tenant
      const product = mockStore.getProductById(item.productId);
      if (!product) {
        throw new Error(`PRODUCT_NOT_FOUND: ${item.productId}`);
      }
      if (product.tenantId !== tenantId) {
        throw new Error(`PRODUCT_NOT_FOUND: ${item.productId}`);
      }
    }

    // Check stock availability
    await this.checkStockAvailability(request.items, tenantId);

    // Validate received amount
    const totalAmount = request.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    if (request.receivedAmount < 0 || request.receivedAmount > totalAmount) {
      throw new Error("INVALID_RECEIVED_AMOUNT");
    }

    // Validate date format (should be ISO string)
    const dateObj = new Date(request.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error("INVALID_DATE");
    }

    // Create sale (stock and ledger will be automatically updated via ProductService and LedgerService)
    return mockStore.addSale(
      tenantId,
      request.customerId,
      request.date,
      request.items,
      request.receivedAmount || 0
    );
  }

  async updateSale(id: string, request: UpdateSaleRequest): Promise<Sale> {
    const tenantId = this.getTenantId();
    const sale = mockStore.getSaleById(id);

    if (!sale) {
      throw new Error("SALE_NOT_FOUND");
    }

    // Ensure sale belongs to current tenant
    if (sale.tenantId !== tenantId) {
      throw new Error("SALE_NOT_FOUND");
    }

    // Validate customer if provided
    if (request.customerId) {
      const customer = mockStore.getCustomerById(request.customerId);
      if (!customer) {
        throw new Error("CUSTOMER_NOT_FOUND");
      }
      if (customer.tenantId !== tenantId) {
        throw new Error("CUSTOMER_NOT_FOUND");
      }
    }

    // Validate items if provided
    if (request.items) {
      if (request.items.length === 0) {
        throw new Error("SALE_ITEMS_REQUIRED");
      }

      for (const item of request.items) {
        if (!item.productId?.trim()) {
          throw new Error("PRODUCT_ID_REQUIRED");
        }
        if (item.quantity <= 0) {
          throw new Error("INVALID_QUANTITY");
        }
        if (item.price < 0) {
          throw new Error("INVALID_PRICE");
        }

        // Validate product exists and belongs to tenant
        const product = mockStore.getProductById(item.productId);
        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND: ${item.productId}`);
        }
        if (product.tenantId !== tenantId) {
          throw new Error(`PRODUCT_NOT_FOUND: ${item.productId}`);
        }
      }

      // Check stock availability (considering current sale quantities that will be restored)
      // We need to check if new quantities can be satisfied after restoring old quantities
      const currentSaleItems = sale.items;
      const products = await productService.getProducts();

      for (const newItem of request.items) {
        const product = products.find((p) => p.id === newItem.productId);
        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND: ${newItem.productId}`);
        }

        // Find corresponding old item to calculate net change
        const oldItem = currentSaleItems.find((item) => item.productId === newItem.productId);
        const oldQuantity = oldItem ? oldItem.quantity : 0;
        const netChange = newItem.quantity - oldQuantity;

        // Check if we have enough stock considering the net change
        if (product.stock + oldQuantity < newItem.quantity) {
          throw new Error(`INSUFFICIENT_STOCK: ${product.name} has only ${product.stock} ${product.unit} available, but ${newItem.quantity} ${product.unit} requested`);
        }
      }

      // Validate received amount against new total
      const newTotalAmount = request.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
      const receivedAmount = request.receivedAmount !== undefined ? request.receivedAmount : sale.receivedAmount;
      if (receivedAmount < 0 || receivedAmount > newTotalAmount) {
        throw new Error("INVALID_RECEIVED_AMOUNT");
      }
    } else if (request.receivedAmount !== undefined) {
      // Validate received amount against current total
      if (request.receivedAmount < 0 || request.receivedAmount > sale.totalAmount) {
        throw new Error("INVALID_RECEIVED_AMOUNT");
      }
    }

    // Validate date if provided
    if (request.date) {
      const dateObj = new Date(request.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("INVALID_DATE");
      }
    }

    // Update sale (stock and ledger will be automatically recalculated)
    const updates: Partial<Sale> = {};
    if (request.customerId !== undefined) updates.customerId = request.customerId;
    if (request.date !== undefined) updates.date = request.date;
    if (request.items !== undefined) updates.items = request.items;
    if (request.receivedAmount !== undefined) updates.receivedAmount = request.receivedAmount;

    return mockStore.updateSale(id, updates);
  }

  async deleteSale(id: string): Promise<void> {
    const tenantId = this.getTenantId();
    const sale = mockStore.getSaleById(id);

    if (!sale) {
      throw new Error("SALE_NOT_FOUND");
    }

    // Ensure sale belongs to current tenant
    if (sale.tenantId !== tenantId) {
      throw new Error("SALE_NOT_FOUND");
    }

    // Delete sale (stock and ledger will be automatically updated)
    mockStore.deleteSale(id);
  }

  async getSalesByCustomer(customerId: string): Promise<SaleWithDetails[]> {
    const tenantId = this.getTenantId();
    const customer = mockStore.getCustomerById(customerId);

    if (!customer) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    // Ensure customer belongs to current tenant
    if (customer.tenantId !== tenantId) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    const sales = mockStore.getSalesByCustomer(customerId).filter((s) => s.tenantId === tenantId);
    return sales.map((s) => this.saleWithDetails(s));
  }
}
