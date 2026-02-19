import type {
  PurchaseService,
  PurchaseWithDetails,
  CreatePurchaseRequest,
  UpdatePurchaseRequest
} from "../interfaces/PurchaseService";
import { mockStore, type Purchase, type PurchaseItem, type Supplier, type Product } from "./store";
import { authService } from "../index";

/**
 * Mock implementation of PurchaseService.
 * Uses in-memory store. Stock and supplier ledger are automatically updated when purchases are created/updated/deleted.
 */
export class PurchaseServiceMock implements PurchaseService {
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
   * Convert Purchase to PurchaseWithDetails
   */
  private purchaseWithDetails(purchase: Purchase): PurchaseWithDetails {
    const supplier = mockStore.getSupplierById(purchase.supplierId);
    const supplierName = supplier?.name || "Unknown Supplier";

    const itemDetails = purchase.items.map((item) => {
      const product = mockStore.getProductById(item.productId);
      return {
        ...item,
        productName: product?.name || "Unknown Product",
        productUnit: product?.unit || ""
      };
    });

    return {
      ...purchase,
      supplierName,
      itemDetails
    };
  }

  async getPurchases(): Promise<PurchaseWithDetails[]> {
    const tenantId = this.getTenantId();
    const purchases = mockStore.getPurchasesByTenant(tenantId);
    return purchases.map((p) => this.purchaseWithDetails(p));
  }

  async getPurchaseById(id: string): Promise<PurchaseWithDetails | null> {
    const tenantId = this.getTenantId();
    const purchase = mockStore.getPurchaseById(id);

    if (!purchase) {
      return null;
    }

    // Ensure purchase belongs to current tenant
    if (purchase.tenantId !== tenantId) {
      return null;
    }

    return this.purchaseWithDetails(purchase);
  }

  async createPurchase(request: CreatePurchaseRequest): Promise<Purchase> {
    const tenantId = this.getTenantId();

    // Validate required fields
    if (!request.supplierId?.trim()) {
      throw new Error("SUPPLIER_ID_REQUIRED");
    }
    if (!request.date?.trim()) {
      throw new Error("PURCHASE_DATE_REQUIRED");
    }
    if (!request.items || request.items.length === 0) {
      throw new Error("PURCHASE_ITEMS_REQUIRED");
    }

    // Validate supplier exists and belongs to tenant
    const supplier = mockStore.getSupplierById(request.supplierId);
    if (!supplier) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }
    if (supplier.tenantId !== tenantId) {
      throw new Error("SUPPLIER_NOT_FOUND");
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

    // Validate paid amount
    const totalAmount = request.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    if (request.paidAmount < 0 || request.paidAmount > totalAmount) {
      throw new Error("INVALID_PAID_AMOUNT");
    }

    // Validate date format (should be ISO string)
    const dateObj = new Date(request.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error("INVALID_DATE");
    }

    // Create purchase (stock and ledger will be automatically updated via ProductService and LedgerService)
    return mockStore.addPurchase(
      tenantId,
      request.supplierId,
      request.date,
      request.items,
      request.paidAmount || 0
    );
  }

  async updatePurchase(id: string, request: UpdatePurchaseRequest): Promise<Purchase> {
    const tenantId = this.getTenantId();
    const purchase = mockStore.getPurchaseById(id);

    if (!purchase) {
      throw new Error("PURCHASE_NOT_FOUND");
    }

    // Ensure purchase belongs to current tenant
    if (purchase.tenantId !== tenantId) {
      throw new Error("PURCHASE_NOT_FOUND");
    }

    // Validate supplier if provided
    if (request.supplierId) {
      const supplier = mockStore.getSupplierById(request.supplierId);
      if (!supplier) {
        throw new Error("SUPPLIER_NOT_FOUND");
      }
      if (supplier.tenantId !== tenantId) {
        throw new Error("SUPPLIER_NOT_FOUND");
      }
    }

    // Validate items if provided
    if (request.items) {
      if (request.items.length === 0) {
        throw new Error("PURCHASE_ITEMS_REQUIRED");
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

      // Validate paid amount against new total
      const newTotalAmount = request.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
      const paidAmount = request.paidAmount !== undefined ? request.paidAmount : purchase.paidAmount;
      if (paidAmount < 0 || paidAmount > newTotalAmount) {
        throw new Error("INVALID_PAID_AMOUNT");
      }
    } else if (request.paidAmount !== undefined) {
      // Validate paid amount against current total
      if (request.paidAmount < 0 || request.paidAmount > purchase.totalAmount) {
        throw new Error("INVALID_PAID_AMOUNT");
      }
    }

    // Validate date if provided
    if (request.date) {
      const dateObj = new Date(request.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("INVALID_DATE");
      }
    }

    // Update purchase (stock and ledger will be automatically recalculated)
    const updates: Partial<Purchase> = {};
    if (request.supplierId !== undefined) updates.supplierId = request.supplierId;
    if (request.date !== undefined) updates.date = request.date;
    if (request.items !== undefined) updates.items = request.items;
    if (request.paidAmount !== undefined) updates.paidAmount = request.paidAmount;

    return mockStore.updatePurchase(id, updates);
  }

  async deletePurchase(id: string): Promise<void> {
    const tenantId = this.getTenantId();
    const purchase = mockStore.getPurchaseById(id);

    if (!purchase) {
      throw new Error("PURCHASE_NOT_FOUND");
    }

    // Ensure purchase belongs to current tenant
    if (purchase.tenantId !== tenantId) {
      throw new Error("PURCHASE_NOT_FOUND");
    }

    // Delete purchase (stock and ledger will be automatically updated)
    mockStore.deletePurchase(id);
  }

  async getPurchasesBySupplier(supplierId: string): Promise<PurchaseWithDetails[]> {
    const tenantId = this.getTenantId();
    const supplier = mockStore.getSupplierById(supplierId);

    if (!supplier) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }

    // Ensure supplier belongs to current tenant
    if (supplier.tenantId !== tenantId) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }

    const purchases = mockStore.getPurchasesBySupplier(supplierId).filter((p) => p.tenantId === tenantId);
    return purchases.map((p) => this.purchaseWithDetails(p));
  }
}
