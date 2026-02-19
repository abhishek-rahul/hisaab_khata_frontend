/**
 * Supplier service contract. Implementations: SupplierServiceMock (mock) | SupplierServiceHttp (http).
 */

import type { Supplier } from "../mock/store";

export interface SupplierWithDue extends Supplier {
  dueAmount: number; // Total amount due to supplier (calculated from purchases - payments)
}

export interface CreateSupplierRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface SupplierService {
  /**
   * Get all suppliers for the current tenant with due amount information
   */
  getSuppliers(): Promise<SupplierWithDue[]>;

  /**
   * Get a supplier by ID with due amount information
   */
  getSupplierById(id: string): Promise<SupplierWithDue | null>;

  /**
   * Create a new supplier
   */
  createSupplier(request: CreateSupplierRequest): Promise<Supplier>;

  /**
   * Update an existing supplier
   */
  updateSupplier(id: string, request: UpdateSupplierRequest): Promise<Supplier>;

  /**
   * Delete a supplier
   */
  deleteSupplier(id: string): Promise<void>;

  /**
   * Get due amount for a specific supplier
   */
  getSupplierDue(supplierId: string): Promise<number>;
}
