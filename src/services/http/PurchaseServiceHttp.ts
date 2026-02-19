import type {
  PurchaseService,
  PurchaseWithDetails,
  CreatePurchaseRequest,
  UpdatePurchaseRequest
} from "../interfaces/PurchaseService";

/**
 * HTTP implementation of PurchaseService.
 * Stub for Phase 11 (Backend Integration).
 */
export class PurchaseServiceHttp implements PurchaseService {
  async getPurchases(): Promise<PurchaseWithDetails[]> {
    throw new Error("PurchaseServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getPurchaseById(_id: string): Promise<PurchaseWithDetails | null> {
    throw new Error("PurchaseServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async createPurchase(_request: CreatePurchaseRequest): Promise<import("../mock/store").Purchase> {
    throw new Error("PurchaseServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async updatePurchase(_id: string, _request: UpdatePurchaseRequest): Promise<import("../mock/store").Purchase> {
    throw new Error("PurchaseServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async deletePurchase(_id: string): Promise<void> {
    throw new Error("PurchaseServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getPurchasesBySupplier(_supplierId: string): Promise<PurchaseWithDetails[]> {
    throw new Error("PurchaseServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }
}
