import type {
  CustomerService,
  CustomerWithDue,
  CreateCustomerRequest,
  UpdateCustomerRequest
} from "../interfaces/CustomerService";
import { mockStore, type Customer } from "./store";
import { authService } from "../index";

/**
 * Mock implementation of CustomerService.
 * Uses in-memory store and calculates due amounts from sales and payments.
 */
export class CustomerServiceMock implements CustomerService {
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
   * Calculate due amount for a customer from sales and payments
   * Due = Sum of (sale.totalAmount - sale.receivedAmount) - Sum of payments
   */
  private calculateDue(customerId: string, tenantId: string): number {
    // Get all sales for this customer
    const sales = mockStore.getSalesByCustomer(customerId);
    // Filter by tenant
    const tenantSales = sales.filter((s) => s.tenantId === tenantId);

    // Get all payments received from this customer
    const payments = mockStore.getPaymentsByParty(customerId, "customer");
    // Filter by tenant
    const tenantPayments = payments.filter((p) => p.tenantId === tenantId);

    let due = 0;

    // Add unpaid amounts from sales
    for (const sale of tenantSales) {
      const unpaid = sale.totalAmount - sale.receivedAmount;
      due += unpaid;
    }

    // Subtract payments received
    for (const payment of tenantPayments) {
      due -= payment.amount;
    }

    return Math.max(0, due); // Ensure due is never negative
  }

  /**
   * Convert Customer to CustomerWithDue
   */
  private customerWithDue(customer: Customer): CustomerWithDue {
    const dueAmount = this.calculateDue(customer.id, customer.tenantId);
    return {
      ...customer,
      dueAmount
    };
  }

  async getCustomers(): Promise<CustomerWithDue[]> {
    const tenantId = this.getTenantId();
    const customers = mockStore.getCustomersByTenant(tenantId);
    return customers.map((c) => this.customerWithDue(c));
  }

  async getCustomerById(id: string): Promise<CustomerWithDue | null> {
    const tenantId = this.getTenantId();
    const customer = mockStore.getCustomerById(id);

    if (!customer) {
      return null;
    }

    // Ensure customer belongs to current tenant
    if (customer.tenantId !== tenantId) {
      return null;
    }

    return this.customerWithDue(customer);
  }

  async createCustomer(request: CreateCustomerRequest): Promise<Customer> {
    const tenantId = this.getTenantId();

    // Validate required fields
    if (!request.name?.trim()) {
      throw new Error("CUSTOMER_NAME_REQUIRED");
    }

    return mockStore.addCustomer(
      tenantId,
      request.name.trim(),
      request.phone?.trim(),
      request.email?.trim(),
      request.address?.trim()
    );
  }

  async updateCustomer(id: string, request: UpdateCustomerRequest): Promise<Customer> {
    const tenantId = this.getTenantId();
    const customer = mockStore.getCustomerById(id);

    if (!customer) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    // Ensure customer belongs to current tenant
    if (customer.tenantId !== tenantId) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    const updates: Partial<Customer> = {};
    if (request.name !== undefined) updates.name = request.name.trim();
    if (request.phone !== undefined) updates.phone = request.phone?.trim();
    if (request.email !== undefined) updates.email = request.email?.trim();
    if (request.address !== undefined) updates.address = request.address?.trim();

    return mockStore.updateCustomer(id, updates);
  }

  async deleteCustomer(id: string): Promise<void> {
    const tenantId = this.getTenantId();
    const customer = mockStore.getCustomerById(id);

    if (!customer) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    // Ensure customer belongs to current tenant
    if (customer.tenantId !== tenantId) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    mockStore.deleteCustomer(id);
  }

  async getCustomerDue(customerId: string): Promise<number> {
    const tenantId = this.getTenantId();
    const customer = mockStore.getCustomerById(customerId);

    if (!customer) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    // Ensure customer belongs to current tenant
    if (customer.tenantId !== tenantId) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    return this.calculateDue(customerId, tenantId);
  }
}
