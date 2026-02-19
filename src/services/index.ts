import type { AuthService } from "./interfaces/AuthService";
import { AuthServiceMock } from "./mock/AuthServiceMock";
import { AuthServiceHttp } from "./http/AuthServiceHttp";
import type { ProductService } from "./interfaces/ProductService";
import { ProductServiceMock } from "./mock/ProductServiceMock";
import { ProductServiceHttp } from "./http/ProductServiceHttp";
import type { SupplierService } from "./interfaces/SupplierService";
import { SupplierServiceMock } from "./mock/SupplierServiceMock";
import { SupplierServiceHttp } from "./http/SupplierServiceHttp";
import type { CustomerService } from "./interfaces/CustomerService";
import { CustomerServiceMock } from "./mock/CustomerServiceMock";
import { CustomerServiceHttp } from "./http/CustomerServiceHttp";
import type { LedgerService } from "./interfaces/LedgerService";
import { LedgerServiceMock } from "./mock/LedgerServiceMock";
import { LedgerServiceHttp } from "./http/LedgerServiceHttp";
import type { PurchaseService } from "./interfaces/PurchaseService";
import { PurchaseServiceMock } from "./mock/PurchaseServiceMock";
import { PurchaseServiceHttp } from "./http/PurchaseServiceHttp";

const dataMode = import.meta.env.VITE_DATA_MODE || "mock";

export const authService: AuthService =
  dataMode === "mock" ? new AuthServiceMock() : new AuthServiceHttp();

export const productService: ProductService =
  dataMode === "mock" ? new ProductServiceMock() : new ProductServiceHttp();

export const supplierService: SupplierService =
  dataMode === "mock" ? new SupplierServiceMock() : new SupplierServiceHttp();

export const customerService: CustomerService =
  dataMode === "mock" ? new CustomerServiceMock() : new CustomerServiceHttp();

export const ledgerService: LedgerService =
  dataMode === "mock" ? new LedgerServiceMock() : new LedgerServiceHttp();

export const purchaseService: PurchaseService =
  dataMode === "mock" ? new PurchaseServiceMock() : new PurchaseServiceHttp();

export type { AuthService, LoginCredentials, RegisterRequest, Session } from "./interfaces/AuthService";
export type {
  ProductService,
  ProductWithStock,
  CreateProductRequest,
  UpdateProductRequest
} from "./interfaces/ProductService";
export type {
  SupplierService,
  SupplierWithDue,
  CreateSupplierRequest,
  UpdateSupplierRequest
} from "./interfaces/SupplierService";
export type {
  CustomerService,
  CustomerWithDue,
  CreateCustomerRequest,
  UpdateCustomerRequest
} from "./interfaces/CustomerService";
export type {
  LedgerService,
  LedgerEntry,
  LedgerFilter,
  CreatePaymentRequest
} from "./interfaces/LedgerService";
export type {
  PurchaseService,
  PurchaseWithDetails,
  CreatePurchaseRequest,
  UpdatePurchaseRequest
} from "./interfaces/PurchaseService";
