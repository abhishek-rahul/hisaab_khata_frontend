/**
 * Ledger service contract. Implementations: LedgerServiceMock (mock) | LedgerServiceHttp (http).
 */

import type { Payment } from "../mock/store";

export type LedgerEntryType = "purchase" | "sale" | "payment";

export interface LedgerEntry {
  id: string;
  type: LedgerEntryType;
  date: string; // ISO date string
  description: string;
  credit: number; // Amount owed (for purchases from suppliers, payments to suppliers)
  debit: number; // Amount receivable (for sales to customers, payments from customers)
  balance: number; // Running balance
  referenceId: string; // ID of purchase/sale/payment
  partyId: string; // supplierId or customerId
  partyName: string; // supplier name or customer name
  partyType: "supplier" | "customer"; // Type of party (supplier or customer)
}

export interface LedgerFilter {
  partyId?: string; // Filter by supplier or customer ID
  type?: "supplier" | "customer"; // Filter by party type
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

export interface CreatePaymentRequest {
  type: "supplier" | "customer";
  partyId: string; // supplierId or customerId
  amount: number;
  date: string; // ISO date string
  mode: "cash" | "online" | "cheque";
  reference?: string; // Transaction reference
}

export interface LedgerService {
  /**
   * Get ledger entries for a specific supplier
   */
  getSupplierLedger(supplierId: string): Promise<LedgerEntry[]>;

  /**
   * Get ledger entries for a specific customer
   */
  getCustomerLedger(customerId: string): Promise<LedgerEntry[]>;

  /**
   * Get generic ledger entries with filters
   */
  getLedgerEntries(filter?: LedgerFilter): Promise<LedgerEntry[]>;

  /**
   * Add a payment entry (for supplier or customer)
   */
  addPayment(request: CreatePaymentRequest): Promise<Payment>;

  /**
   * Get payment by ID
   */
  getPaymentById(id: string): Promise<Payment | null>;

  /**
   * Delete a payment entry
   */
  deletePayment(id: string): Promise<void>;
}
