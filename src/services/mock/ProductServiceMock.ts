import type {
  ProductService,
  ProductWithStock,
  CreateProductRequest,
  UpdateProductRequest
} from "../interfaces/ProductService";
import { mockStore, type Product } from "./store";
import { authService } from "../index";

/**
 * Mock implementation of ProductService.
 * Uses in-memory store and calculates stock from purchases and sales.
 */
export class ProductServiceMock implements ProductService {
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
   * Calculate stock for a product from purchases and sales
   */
  private calculateStock(productId: string, tenantId: string): number {
    // Get all purchases for this tenant
    const purchases = mockStore.getPurchasesByTenant(tenantId);
    // Get all sales for this tenant
    const sales = mockStore.getSalesByTenant(tenantId);

    let stock = 0;

    // Add stock from purchases
    for (const purchase of purchases) {
      for (const item of purchase.items) {
        if (item.productId === productId) {
          stock += item.quantity;
        }
      }
    }

    // Subtract stock from sales
    for (const sale of sales) {
      for (const item of sale.items) {
        if (item.productId === productId) {
          stock -= item.quantity;
        }
      }
    }

    return Math.max(0, stock); // Ensure stock is never negative
  }

  /**
   * Convert Product to ProductWithStock
   */
  private productWithStock(product: Product): ProductWithStock {
    const stock = this.calculateStock(product.id, product.tenantId);
    return {
      ...product,
      stock
    };
  }

  async getProducts(): Promise<ProductWithStock[]> {
    const tenantId = this.getTenantId();
    const products = mockStore.getProductsByTenant(tenantId);
    return products.map((p) => this.productWithStock(p));
  }

  async getProductById(id: string): Promise<ProductWithStock | null> {
    const tenantId = this.getTenantId();
    const product = mockStore.getProductById(id);
    
    if (!product) {
      return null;
    }

    // Ensure product belongs to current tenant
    if (product.tenantId !== tenantId) {
      return null;
    }

    return this.productWithStock(product);
  }

  async createProduct(request: CreateProductRequest): Promise<Product> {
    const tenantId = this.getTenantId();

    // Validate required fields
    if (!request.name?.trim()) {
      throw new Error("PRODUCT_NAME_REQUIRED");
    }
    if (!request.unit?.trim()) {
      throw new Error("PRODUCT_UNIT_REQUIRED");
    }
    if (request.purchasePrice < 0 || request.salePrice < 0) {
      throw new Error("INVALID_PRICE");
    }

    return mockStore.addProduct(
      tenantId,
      request.name.trim(),
      request.unit.trim(),
      request.purchasePrice,
      request.salePrice,
      request.sku?.trim()
    );
  }

  async updateProduct(id: string, request: UpdateProductRequest): Promise<Product> {
    const tenantId = this.getTenantId();
    const product = mockStore.getProductById(id);

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    // Ensure product belongs to current tenant
    if (product.tenantId !== tenantId) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    // Validate prices if provided
    if (request.purchasePrice !== undefined && request.purchasePrice < 0) {
      throw new Error("INVALID_PURCHASE_PRICE");
    }
    if (request.salePrice !== undefined && request.salePrice < 0) {
      throw new Error("INVALID_SALE_PRICE");
    }

    const updates: Partial<Product> = {};
    if (request.name !== undefined) updates.name = request.name.trim();
    if (request.sku !== undefined) updates.sku = request.sku?.trim();
    if (request.unit !== undefined) updates.unit = request.unit.trim();
    if (request.purchasePrice !== undefined) updates.purchasePrice = request.purchasePrice;
    if (request.salePrice !== undefined) updates.salePrice = request.salePrice;

    return mockStore.updateProduct(id, updates);
  }

  async deleteProduct(id: string): Promise<void> {
    const tenantId = this.getTenantId();
    const product = mockStore.getProductById(id);

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    // Ensure product belongs to current tenant
    if (product.tenantId !== tenantId) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    mockStore.deleteProduct(id);
  }

  async getProductStock(productId: string): Promise<number> {
    const tenantId = this.getTenantId();
    const product = mockStore.getProductById(productId);

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    // Ensure product belongs to current tenant
    if (product.tenantId !== tenantId) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    return this.calculateStock(productId, tenantId);
  }
}
