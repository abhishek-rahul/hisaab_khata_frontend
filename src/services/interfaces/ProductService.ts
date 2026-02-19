/**
 * Product service contract. Implementations: ProductServiceMock (mock) | ProductServiceHttp (http).
 */

import type { Product } from "../mock/store";

export interface ProductWithStock extends Product {
  stock: number; // Current stock quantity (calculated from purchases - sales)
}

export interface CreateProductRequest {
  name: string;
  sku?: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  unit?: string;
  purchasePrice?: number;
  salePrice?: number;
}

export interface ProductService {
  /**
   * Get all products for the current tenant with stock information
   */
  getProducts(): Promise<ProductWithStock[]>;

  /**
   * Get a product by ID with stock information
   */
  getProductById(id: string): Promise<ProductWithStock | null>;

  /**
   * Create a new product
   */
  createProduct(request: CreateProductRequest): Promise<Product>;

  /**
   * Update an existing product
   */
  updateProduct(id: string, request: UpdateProductRequest): Promise<Product>;

  /**
   * Delete a product
   */
  deleteProduct(id: string): Promise<void>;

  /**
   * Get stock for a specific product
   */
  getProductStock(productId: string): Promise<number>;
}
