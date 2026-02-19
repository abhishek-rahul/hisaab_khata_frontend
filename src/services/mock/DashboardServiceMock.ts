/**
 * Mock implementation of DashboardService using in-memory store.
 */

import type { DashboardService, DashboardMetrics } from "../interfaces/DashboardService";
import type { ProductWithStock } from "../interfaces/ProductService";
import {
  authService,
  productService,
  customerService,
  supplierService,
  saleService
} from "../index";

export class DashboardServiceMock implements DashboardService {
  /**
   * Get tenant ID from session
   */
  private getTenantId(): string {
    const session = authService.getSession();
    if (!session) {
      throw new Error("UNAUTHORIZED");
    }
    return session.tenant.id;
  }

  /**
   * Check if a date is today (same day, month, year)
   */
  private isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Calculate today's sales total
   */
  private async calculateTodaySales(tenantId: string): Promise<number> {
    const sales = await saleService.getSales();
    const todaySales = sales
      .filter((sale) => this.isToday(sale.date))
      .reduce((sum, sale) => sum + sale.totalAmount, 0);
    return todaySales;
  }

  /**
   * Calculate total customer due
   */
  private async calculateCustomerDue(): Promise<number> {
    const customers = await customerService.getCustomers();
    const totalCustomerDue = customers.reduce((sum, customer) => sum + customer.dueAmount, 0);
    return totalCustomerDue;
  }

  /**
   * Calculate total supplier due
   */
  private async calculateSupplierDue(): Promise<number> {
    const suppliers = await supplierService.getSuppliers();
    const totalSupplierDue = suppliers.reduce((sum, supplier) => sum + supplier.dueAmount, 0);
    return totalSupplierDue;
  }

  /**
   * Get products with low stock (stock < 10)
   */
  private async getLowStockProducts(tenantId: string): Promise<ProductWithStock[]> {
    const products = await productService.getProducts();
    const lowStockProducts = products.filter((product) => product.stock < 10);
    return lowStockProducts;
  }

  /**
   * Get dashboard metrics for the current tenant
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const tenantId = this.getTenantId();

    // Calculate all metrics in parallel for better performance
    const [todaySales, customerDue, supplierDue, lowStockProducts] = await Promise.all([
      this.calculateTodaySales(tenantId),
      this.calculateCustomerDue(),
      this.calculateSupplierDue(),
      this.getLowStockProducts(tenantId)
    ]);

    const totalDue = customerDue + supplierDue;

    return {
      todaySales,
      totalDue,
      customerDue,
      supplierDue,
      lowStockProducts
    };
  }
}
