import type {
  SaleService,
  SaleWithDetails,
  CreateSaleRequest,
  UpdateSaleRequest
} from "../interfaces/SaleService";

/**
 * HTTP implementation of SaleService.
 * Stub for Phase 11 (Backend Integration).
 */
export class SaleServiceHttp implements SaleService {
  async getSales(): Promise<SaleWithDetails[]> {
    throw new Error("SaleServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getSaleById(_id: string): Promise<SaleWithDetails | null> {
    throw new Error("SaleServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async createSale(_request: CreateSaleRequest): Promise<import("../mock/store").Sale> {
    throw new Error("SaleServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async updateSale(_id: string, _request: UpdateSaleRequest): Promise<import("../mock/store").Sale> {
    throw new Error("SaleServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async deleteSale(_id: string): Promise<void> {
    throw new Error("SaleServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getSalesByCustomer(_customerId: string): Promise<SaleWithDetails[]> {
    throw new Error("SaleServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }
}
