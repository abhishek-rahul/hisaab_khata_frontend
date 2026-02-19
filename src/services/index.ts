import type { AuthService } from "./interfaces/AuthService";
import { AuthServiceMock } from "./mock/AuthServiceMock";
import { AuthServiceHttp } from "./http/AuthServiceHttp";
import type { ProductService } from "./interfaces/ProductService";
import { ProductServiceMock } from "./mock/ProductServiceMock";
import { ProductServiceHttp } from "./http/ProductServiceHttp";

const dataMode = import.meta.env.VITE_DATA_MODE || "mock";

export const authService: AuthService =
  dataMode === "mock" ? new AuthServiceMock() : new AuthServiceHttp();

export const productService: ProductService =
  dataMode === "mock" ? new ProductServiceMock() : new ProductServiceHttp();

export type { AuthService, LoginCredentials, RegisterRequest, Session } from "./interfaces/AuthService";
export type {
  ProductService,
  ProductWithStock,
  CreateProductRequest,
  UpdateProductRequest
} from "./interfaces/ProductService";
