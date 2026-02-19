import type {
  ProductService,
  ProductWithStock,
  CreateProductRequest,
  UpdateProductRequest
} from "../interfaces/ProductService";

/**
 * HTTP implementation of ProductService.
 * Stub for Phase 11 (Backend Integration).
 */
export class ProductServiceHttp implements ProductService {
  async getProducts(): Promise<ProductWithStock[]> {
    throw new Error("ProductServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getProductById(_id: string): Promise<ProductWithStock | null> {
    throw new Error("ProductServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async createProduct(_request: CreateProductRequest): Promise<import("../mock/store").Product> {
    throw new Error("ProductServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async updateProduct(_id: string, _request: UpdateProductRequest): Promise<import("../mock/store").Product> {
    throw new Error("ProductServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async deleteProduct(_id: string): Promise<void> {
    throw new Error("ProductServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getProductStock(_productId: string): Promise<number> {
    throw new Error("ProductServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }
}
