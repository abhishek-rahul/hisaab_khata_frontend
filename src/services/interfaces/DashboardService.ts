/**
 * Dashboard service contract. Implementations: DashboardServiceMock (mock) | DashboardServiceHttp (http).
 */

import type { ProductWithStock } from "./ProductService";

export interface DashboardMetrics {
  /**
   * Total sales amount for today
   */
  todaySales: number;

  /**
   * Total due amount (customers + suppliers)
   * - Customer due: Amount customers owe to the shop
   * - Supplier due: Amount shop owes to suppliers
   */
  totalDue: number;

  /**
   * Customer due amount (amount customers owe to the shop)
   */
  customerDue: number;

  /**
   * Supplier due amount (amount shop owes to suppliers)
   */
  supplierDue: number;

  /**
   * Products with low stock (stock < 10)
   */
  lowStockProducts: ProductWithStock[];
}

export interface DashboardService {
  /**
   * Get dashboard metrics for the current tenant
   * Includes: today sales, total due (customers + suppliers), low stock alerts
   */
  getDashboardMetrics(): Promise<DashboardMetrics>;
}
