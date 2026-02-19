import type {
  SupplierService,
  SupplierWithDue,
  CreateSupplierRequest,
  UpdateSupplierRequest
} from "../interfaces/SupplierService";

/**
 * HTTP implementation of SupplierService.
 * Stub for Phase 11 (Backend Integration).
 */
export class SupplierServiceHttp implements SupplierService {
  async getSuppliers(): Promise<SupplierWithDue[]> {
    throw new Error("SupplierServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getSupplierById(_id: string): Promise<SupplierWithDue | null> {
    throw new Error("SupplierServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async createSupplier(_request: CreateSupplierRequest): Promise<import("../mock/store").Supplier> {
    throw new Error("SupplierServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async updateSupplier(_id: string, _request: UpdateSupplierRequest): Promise<import("../mock/store").Supplier> {
    throw new Error("SupplierServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async deleteSupplier(_id: string): Promise<void> {
    throw new Error("SupplierServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getSupplierDue(_supplierId: string): Promise<number> {
    throw new Error("SupplierServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }
}
