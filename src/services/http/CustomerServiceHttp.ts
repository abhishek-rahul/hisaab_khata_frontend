import type {
  CustomerService,
  CustomerWithDue,
  CreateCustomerRequest,
  UpdateCustomerRequest
} from "../interfaces/CustomerService";

/**
 * HTTP implementation of CustomerService.
 * Stub for Phase 11 (Backend Integration).
 */
export class CustomerServiceHttp implements CustomerService {
  async getCustomers(): Promise<CustomerWithDue[]> {
    throw new Error("CustomerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getCustomerById(_id: string): Promise<CustomerWithDue | null> {
    throw new Error("CustomerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async createCustomer(_request: CreateCustomerRequest): Promise<import("../mock/store").Customer> {
    throw new Error("CustomerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async updateCustomer(_id: string, _request: UpdateCustomerRequest): Promise<import("../mock/store").Customer> {
    throw new Error("CustomerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async deleteCustomer(_id: string): Promise<void> {
    throw new Error("CustomerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getCustomerDue(_customerId: string): Promise<number> {
    throw new Error("CustomerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }
}
