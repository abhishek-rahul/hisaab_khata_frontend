/**
 * Sale service contract. Implementations: SaleServiceMock (mock) | SaleServiceHttp (http).
 */

import type { Sale, SaleItem } from "../mock/store";

export interface SaleWithDetails extends Sale {
  customerName: string; // Customer name for display
  itemDetails: Array<SaleItem & { productName: string; productUnit: string }>; // Items with product details
}

export interface CreateSaleRequest {
  customerId: string;
  date: string; // ISO date string
  items: SaleItem[];
  receivedAmount: number; // Amount received at sale time (default: 0)
}

export interface UpdateSaleRequest {
  customerId?: string;
  date?: string;
  items?: SaleItem[];
  receivedAmount?: number;
}

export interface SaleService {
  /**
   * Get all sales for the current tenant with customer and product details
   */
  getSales(): Promise<SaleWithDetails[]>;

  /**
   * Get a sale by ID with customer and product details
   */
  getSaleById(id: string): Promise<SaleWithDetails | null>;

  /**
   * Create a new sale
   * Note: Stock and customer ledger are automatically updated
   */
  createSale(request: CreateSaleRequest): Promise<Sale>;

  /**
   * Update an existing sale
   * Note: Stock and customer ledger are automatically recalculated
   */
  updateSale(id: string, request: UpdateSaleRequest): Promise<Sale>;

  /**
   * Delete a sale
   * Note: Stock and customer ledger are automatically updated
   */
  deleteSale(id: string): Promise<void>;

  /**
   * Get sales for a specific customer
   */
  getSalesByCustomer(customerId: string): Promise<SaleWithDetails[]>;
}
