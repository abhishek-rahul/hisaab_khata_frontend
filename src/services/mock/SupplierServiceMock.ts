import type {
  SupplierService,
  SupplierWithDue,
  CreateSupplierRequest,
  UpdateSupplierRequest
} from "../interfaces/SupplierService";
import { mockStore, type Supplier } from "./store";
import { authService } from "../index";

/**
 * Mock implementation of SupplierService.
 * Uses in-memory store and calculates due amounts from purchases and payments.
 */
export class SupplierServiceMock implements SupplierService {
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
   * Calculate due amount for a supplier from purchases and payments
   * Due = Sum of (purchase.totalAmount - purchase.paidAmount) - Sum of payments
   */
  private calculateDue(supplierId: string, tenantId: string): number {
    // Get all purchases for this supplier
    const purchases = mockStore.getPurchasesBySupplier(supplierId);
    // Filter by tenant
    const tenantPurchases = purchases.filter((p) => p.tenantId === tenantId);

    // Get all payments made to this supplier
    const payments = mockStore.getPaymentsByParty(supplierId, "supplier");
    // Filter by tenant
    const tenantPayments = payments.filter((p) => p.tenantId === tenantId);

    let due = 0;

    // Add unpaid amounts from purchases
    for (const purchase of tenantPurchases) {
      const unpaid = purchase.totalAmount - purchase.paidAmount;
      due += unpaid;
    }

    // Subtract payments made
    for (const payment of tenantPayments) {
      due -= payment.amount;
    }

    return Math.max(0, due); // Ensure due is never negative
  }

  /**
   * Convert Supplier to SupplierWithDue
   */
  private supplierWithDue(supplier: Supplier): SupplierWithDue {
    const dueAmount = this.calculateDue(supplier.id, supplier.tenantId);
    return {
      ...supplier,
      dueAmount
    };
  }

  async getSuppliers(): Promise<SupplierWithDue[]> {
    const tenantId = this.getTenantId();
    const suppliers = mockStore.getSuppliersByTenant(tenantId);
    return suppliers.map((s) => this.supplierWithDue(s));
  }

  async getSupplierById(id: string): Promise<SupplierWithDue | null> {
    const tenantId = this.getTenantId();
    const supplier = mockStore.getSupplierById(id);

    if (!supplier) {
      return null;
    }

    // Ensure supplier belongs to current tenant
    if (supplier.tenantId !== tenantId) {
      return null;
    }

    return this.supplierWithDue(supplier);
  }

  async createSupplier(request: CreateSupplierRequest): Promise<Supplier> {
    const tenantId = this.getTenantId();

    // Validate required fields
    if (!request.name?.trim()) {
      throw new Error("SUPPLIER_NAME_REQUIRED");
    }

    return mockStore.addSupplier(
      tenantId,
      request.name.trim(),
      request.phone?.trim(),
      request.email?.trim(),
      request.address?.trim()
    );
  }

  async updateSupplier(id: string, request: UpdateSupplierRequest): Promise<Supplier> {
    const tenantId = this.getTenantId();
    const supplier = mockStore.getSupplierById(id);

    if (!supplier) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }

    // Ensure supplier belongs to current tenant
    if (supplier.tenantId !== tenantId) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }

    const updates: Partial<Supplier> = {};
    if (request.name !== undefined) updates.name = request.name.trim();
    if (request.phone !== undefined) updates.phone = request.phone?.trim();
    if (request.email !== undefined) updates.email = request.email?.trim();
    if (request.address !== undefined) updates.address = request.address?.trim();

    return mockStore.updateSupplier(id, updates);
  }

  async deleteSupplier(id: string): Promise<void> {
    const tenantId = this.getTenantId();
    const supplier = mockStore.getSupplierById(id);

    if (!supplier) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }

    // Ensure supplier belongs to current tenant
    if (supplier.tenantId !== tenantId) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }

    mockStore.deleteSupplier(id);
  }

  async getSupplierDue(supplierId: string): Promise<number> {
    const tenantId = this.getTenantId();
    const supplier = mockStore.getSupplierById(supplierId);

    if (!supplier) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }

    // Ensure supplier belongs to current tenant
    if (supplier.tenantId !== tenantId) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }

    return this.calculateDue(supplierId, tenantId);
  }
}
