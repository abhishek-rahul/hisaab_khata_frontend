import type {
  LedgerService,
  LedgerEntry,
  LedgerFilter,
  CreatePaymentRequest
} from "../interfaces/LedgerService";
import { mockStore, type Payment, type Purchase, type Sale } from "./store";
import { authService } from "../index";

/**
 * Mock implementation of LedgerService.
 * Uses in-memory store to generate ledger entries from purchases, sales, and payments.
 */
export class LedgerServiceMock implements LedgerService {
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
   * Build ledger entries for a supplier
   */
  private buildSupplierLedger(supplierId: string, tenantId: string): LedgerEntry[] {
    const entries: LedgerEntry[] = [];
    let balance = 0;

    // Get supplier info
    const supplier = mockStore.getSupplierById(supplierId);
    if (!supplier || supplier.tenantId !== tenantId) {
      return [];
    }

    // Get all purchases for this supplier
    const purchases = mockStore.getPurchasesBySupplier(supplierId).filter(
      (p) => p.tenantId === tenantId
    );

    // Get all payments to this supplier
    const payments = mockStore.getPaymentsByParty(supplierId, "supplier").filter(
      (p) => p.tenantId === tenantId
    );

    // Combine and sort by date
    const allTransactions: Array<{ date: string; type: "purchase" | "payment"; data: Purchase | Payment }> = [];

    for (const purchase of purchases) {
      allTransactions.push({ date: purchase.date, type: "purchase", data: purchase });
    }

    for (const payment of payments) {
      allTransactions.push({ date: payment.date, type: "payment", data: payment });
    }

    // Sort by date (oldest first)
    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Build entries
    for (const transaction of allTransactions) {
      if (transaction.type === "purchase") {
        const purchase = transaction.data as Purchase;
        const unpaid = purchase.totalAmount - purchase.paidAmount;
        if (unpaid > 0) {
          balance += unpaid;
          entries.push({
            id: `purchase-${purchase.id}`,
            type: "purchase",
            date: purchase.date,
            description: `Purchase #${purchase.id.slice(-6)}`,
            credit: unpaid,
            debit: 0,
            balance,
            referenceId: purchase.id,
            partyId: supplierId,
            partyName: supplier.name,
            partyType: "supplier"
          });
        }
      } else {
        const payment = transaction.data as Payment;
        balance -= payment.amount;
        entries.push({
          id: `payment-${payment.id}`,
          type: "payment",
          date: payment.date,
          description: `Payment (${payment.mode})${payment.reference ? ` - ${payment.reference}` : ""}`,
          credit: payment.amount,
          debit: 0,
          balance,
          referenceId: payment.id,
          partyId: supplierId,
          partyName: supplier.name,
          partyType: "supplier"
        });
      }
    }

    return entries;
  }

  /**
   * Build ledger entries for a customer
   */
  private buildCustomerLedger(customerId: string, tenantId: string): LedgerEntry[] {
    const entries: LedgerEntry[] = [];
    let balance = 0;

    // Get customer info
    const customer = mockStore.getCustomerById(customerId);
    if (!customer || customer.tenantId !== tenantId) {
      return [];
    }

    // Get all sales for this customer
    const sales = mockStore.getSalesByCustomer(customerId).filter(
      (s) => s.tenantId === tenantId
    );

    // Get all payments from this customer
    const payments = mockStore.getPaymentsByParty(customerId, "customer").filter(
      (p) => p.tenantId === tenantId
    );

    // Combine and sort by date
    const allTransactions: Array<{ date: string; type: "sale" | "payment"; data: Sale | Payment }> = [];

    for (const sale of sales) {
      allTransactions.push({ date: sale.date, type: "sale", data: sale });
    }

    for (const payment of payments) {
      allTransactions.push({ date: payment.date, type: "payment", data: payment });
    }

    // Sort by date (oldest first)
    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Build entries
    for (const transaction of allTransactions) {
      if (transaction.type === "sale") {
        const sale = transaction.data as Sale;
        const unpaid = sale.totalAmount - sale.receivedAmount;
        if (unpaid > 0) {
          balance += unpaid;
          entries.push({
            id: `sale-${sale.id}`,
            type: "sale",
            date: sale.date,
            description: `Sale #${sale.id.slice(-6)}`,
            credit: 0,
            debit: unpaid,
            balance,
            referenceId: sale.id,
            partyId: customerId,
            partyName: customer.name,
            partyType: "customer"
          });
        }
      } else {
        const payment = transaction.data as Payment;
        balance -= payment.amount;
        entries.push({
          id: `payment-${payment.id}`,
          type: "payment",
          date: payment.date,
          description: `Payment (${payment.mode})${payment.reference ? ` - ${payment.reference}` : ""}`,
          credit: 0,
          debit: payment.amount,
          balance,
          referenceId: payment.id,
          partyId: customerId,
          partyName: customer.name,
          partyType: "customer"
        });
      }
    }

    return entries;
  }

  async getSupplierLedger(supplierId: string): Promise<LedgerEntry[]> {
    const tenantId = this.getTenantId();
    return this.buildSupplierLedger(supplierId, tenantId);
  }

  async getCustomerLedger(customerId: string): Promise<LedgerEntry[]> {
    const tenantId = this.getTenantId();
    return this.buildCustomerLedger(customerId, tenantId);
  }

  async getLedgerEntries(filter?: LedgerFilter): Promise<LedgerEntry[]> {
    const tenantId = this.getTenantId();
    const allEntries: LedgerEntry[] = [];

    if (filter?.partyId) {
      // Get ledger for specific party
      if (filter.type === "supplier") {
        return this.getSupplierLedger(filter.partyId);
      } else if (filter.type === "customer") {
        return this.getCustomerLedger(filter.partyId);
      } else {
        // Try both
        const supplier = mockStore.getSupplierById(filter.partyId);
        if (supplier && supplier.tenantId === tenantId) {
          const supplierEntries = await this.getSupplierLedger(filter.partyId);
          allEntries.push(...supplierEntries);
        }
        const customer = mockStore.getCustomerById(filter.partyId);
        if (customer && customer.tenantId === tenantId) {
          const customerEntries = await this.getCustomerLedger(filter.partyId);
          allEntries.push(...customerEntries);
        }
      }
    } else if (filter?.type === "supplier") {
      // Get all supplier ledgers
      const suppliers = mockStore.getSuppliersByTenant(tenantId);
      for (const supplier of suppliers) {
        const supplierEntries = await this.getSupplierLedger(supplier.id);
        allEntries.push(...supplierEntries);
      }
    } else if (filter?.type === "customer") {
      // Get all customer ledgers
      const customers = mockStore.getCustomersByTenant(tenantId);
      for (const customer of customers) {
        const customerEntries = await this.getCustomerLedger(customer.id);
        allEntries.push(...customerEntries);
      }
    } else {
      // Get all ledgers (suppliers + customers)
      const suppliers = mockStore.getSuppliersByTenant(tenantId);
      for (const supplier of suppliers) {
        const supplierEntries = await this.getSupplierLedger(supplier.id);
        allEntries.push(...supplierEntries);
      }
      const customers = mockStore.getCustomersByTenant(tenantId);
      for (const customer of customers) {
        const customerEntries = await this.getCustomerLedger(customer.id);
        allEntries.push(...customerEntries);
      }
    }

    // Apply date filters if provided
    let filteredEntries = allEntries;
    if (filter?.startDate) {
      filteredEntries = filteredEntries.filter(
        (e) => new Date(e.date).getTime() >= new Date(filter.startDate!).getTime()
      );
    }
    if (filter?.endDate) {
      filteredEntries = filteredEntries.filter(
        (e) => new Date(e.date).getTime() <= new Date(filter.endDate!).getTime()
      );
    }

    // Sort by date (newest first)
    filteredEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filteredEntries;
  }

  async addPayment(request: CreatePaymentRequest): Promise<Payment> {
    const tenantId = this.getTenantId();

    // Validate
    if (!request.partyId) {
      throw new Error("PARTY_ID_REQUIRED");
    }
    if (request.amount <= 0) {
      throw new Error("INVALID_PAYMENT_AMOUNT");
    }

    // Verify party exists and belongs to tenant
    if (request.type === "supplier") {
      const supplier = mockStore.getSupplierById(request.partyId);
      if (!supplier || supplier.tenantId !== tenantId) {
        throw new Error("SUPPLIER_NOT_FOUND");
      }
    } else {
      const customer = mockStore.getCustomerById(request.partyId);
      if (!customer || customer.tenantId !== tenantId) {
        throw new Error("CUSTOMER_NOT_FOUND");
      }
    }

    return mockStore.addPayment(
      tenantId,
      request.type,
      request.partyId,
      request.amount,
      request.date,
      request.mode,
      request.reference?.trim()
    );
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const tenantId = this.getTenantId();
    const payment = mockStore.getPaymentById(id);

    if (!payment) {
      return null;
    }

    // Ensure payment belongs to current tenant
    if (payment.tenantId !== tenantId) {
      return null;
    }

    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    const tenantId = this.getTenantId();
    const payment = mockStore.getPaymentById(id);

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    // Ensure payment belongs to current tenant
    if (payment.tenantId !== tenantId) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    mockStore.deletePayment(id);
  }
}
