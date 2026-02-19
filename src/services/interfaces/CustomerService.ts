/**
 * Customer service contract. Implementations: CustomerServiceMock (mock) | CustomerServiceHttp (http).
 */

import type { Customer } from "../mock/store";

export interface CustomerWithDue extends Customer {
  dueAmount: number; // Total amount due from customer (calculated from sales - payments)
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface CustomerService {
  /**
   * Get all customers for the current tenant with due amount information
   */
  getCustomers(): Promise<CustomerWithDue[]>;

  /**
   * Get a customer by ID with due amount information
   */
  getCustomerById(id: string): Promise<CustomerWithDue | null>;

  /**
   * Create a new customer
   */
  createCustomer(request: CreateCustomerRequest): Promise<Customer>;

  /**
   * Update an existing customer
   */
  updateCustomer(id: string, request: UpdateCustomerRequest): Promise<Customer>;

  /**
   * Delete a customer
   */
  deleteCustomer(id: string): Promise<void>;

  /**
   * Get due amount for a specific customer
   */
  getCustomerDue(customerId: string): Promise<number>;
}
