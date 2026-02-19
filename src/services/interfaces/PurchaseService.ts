/**
 * Purchase service contract. Implementations: PurchaseServiceMock (mock) | PurchaseServiceHttp (http).
 */

import type { Purchase, PurchaseItem } from "../mock/store";

export interface PurchaseWithDetails extends Purchase {
  supplierName: string; // Supplier name for display
  itemDetails: Array<PurchaseItem & { productName: string; productUnit: string }>; // Items with product details
}

export interface CreatePurchaseRequest {
  supplierId: string;
  date: string; // ISO date string
  items: PurchaseItem[];
  paidAmount: number; // Amount paid at purchase time (default: 0)
}

export interface UpdatePurchaseRequest {
  supplierId?: string;
  date?: string;
  items?: PurchaseItem[];
  paidAmount?: number;
}

export interface PurchaseService {
  /**
   * Get all purchases for the current tenant with supplier and product details
   */
  getPurchases(): Promise<PurchaseWithDetails[]>;

  /**
   * Get a purchase by ID with supplier and product details
   */
  getPurchaseById(id: string): Promise<PurchaseWithDetails | null>;

  /**
   * Create a new purchase
   * Note: Stock and supplier ledger are automatically updated
   */
  createPurchase(request: CreatePurchaseRequest): Promise<Purchase>;

  /**
   * Update an existing purchase
   * Note: Stock and supplier ledger are automatically recalculated
   */
  updatePurchase(id: string, request: UpdatePurchaseRequest): Promise<Purchase>;

  /**
   * Delete a purchase
   * Note: Stock and supplier ledger are automatically updated
   */
  deletePurchase(id: string): Promise<void>;

  /**
   * Get purchases for a specific supplier
   */
  getPurchasesBySupplier(supplierId: string): Promise<PurchaseWithDetails[]>;
}
