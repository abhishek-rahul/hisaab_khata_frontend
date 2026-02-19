import type {
  LedgerService,
  LedgerEntry,
  LedgerFilter,
  CreatePaymentRequest
} from "../interfaces/LedgerService";

/**
 * HTTP implementation of LedgerService.
 * Stub for Phase 11 (Backend Integration).
 */
export class LedgerServiceHttp implements LedgerService {
  async getSupplierLedger(_supplierId: string): Promise<LedgerEntry[]> {
    throw new Error("LedgerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getCustomerLedger(_customerId: string): Promise<LedgerEntry[]> {
    throw new Error("LedgerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getLedgerEntries(_filter?: LedgerFilter): Promise<LedgerEntry[]> {
    throw new Error("LedgerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async addPayment(_request: CreatePaymentRequest): Promise<import("../mock/store").Payment> {
    throw new Error("LedgerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getPaymentById(_id: string): Promise<import("../mock/store").Payment | null> {
    throw new Error("LedgerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async deletePayment(_id: string): Promise<void> {
    throw new Error("LedgerServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }
}
