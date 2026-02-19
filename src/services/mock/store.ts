/**
 * In-memory domain store for mock mode. Shared by mock services.
 * Phase 3: Expanded with Products, Suppliers, Customers, Purchases, Sales, Payments, Staff.
 * Data persists to localStorage to survive page refreshes.
 */

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  passwordHash: string; // mock: plain comparison for demo; real would be hashed
  role: "owner" | "staff";
  createdAt: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku?: string; // Stock Keeping Unit
  unit: string; // e.g., "kg", "pcs", "liters"
  purchasePrice: number;
  salePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  price: number; // Purchase price per unit
}

export interface Purchase {
  id: string;
  tenantId: string;
  supplierId: string;
  date: string; // ISO date string
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number; // Amount paid at purchase time
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number; // Sale price per unit
}

export interface Sale {
  id: string;
  tenantId: string;
  customerId: string;
  date: string; // ISO date string
  items: SaleItem[];
  totalAmount: number;
  receivedAmount: number; // Amount received at sale time
  createdAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  type: "supplier" | "customer";
  partyId: string; // supplierId or customerId
  amount: number;
  date: string; // ISO date string
  mode: "cash" | "online" | "cheque";
  reference?: string; // Transaction reference
  createdAt: string;
}

export interface Staff {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  role: "owner" | "staff";
  createdAt: string;
  updatedAt: string;
}

const DEMO_TENANT_ID = "tenant-demo-1";
const DEMO_USER_ID = "user-demo-1";
const STORAGE_KEY_TENANTS = "hk_mock_tenants";
const STORAGE_KEY_USERS = "hk_mock_users";
const STORAGE_KEY_PRODUCTS = "hk_mock_products";
const STORAGE_KEY_SUPPLIERS = "hk_mock_suppliers";
const STORAGE_KEY_CUSTOMERS = "hk_mock_customers";
const STORAGE_KEY_PURCHASES = "hk_mock_purchases";
const STORAGE_KEY_SALES = "hk_mock_sales";
const STORAGE_KEY_PAYMENTS = "hk_mock_payments";
const STORAGE_KEY_STAFF = "hk_mock_staff";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
}

// Seed data
const seedTenants: Tenant[] = [
  {
    id: DEMO_TENANT_ID,
    name: "Demo Shop",
    createdAt: new Date().toISOString()
  }
];

const seedUsers: User[] = [
  {
    id: DEMO_USER_ID,
    tenantId: DEMO_TENANT_ID,
    email: "owner@example.com",
    name: "Demo Owner",
    passwordHash: "password", // mock: store plain for demo
    role: "owner" as const,
    createdAt: new Date().toISOString()
  }
];

const seedProducts: Product[] = [
  {
    id: "product-demo-1",
    tenantId: DEMO_TENANT_ID,
    name: "Rice (Basmati)",
    sku: "RICE-001",
    unit: "kg",
    purchasePrice: 80,
    salePrice: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "product-demo-2",
    tenantId: DEMO_TENANT_ID,
    name: "Wheat Flour",
    sku: "FLOUR-001",
    unit: "kg",
    purchasePrice: 45,
    salePrice: 55,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "product-demo-3",
    tenantId: DEMO_TENANT_ID,
    name: "Sugar",
    sku: "SUGAR-001",
    unit: "kg",
    purchasePrice: 50,
    salePrice: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const seedSuppliers: Supplier[] = [
  {
    id: "supplier-demo-1",
    tenantId: DEMO_TENANT_ID,
    name: "ABC Wholesale",
    phone: "+91-9876543210",
    email: "abc@wholesale.com",
    address: "123 Market Street, City",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "supplier-demo-2",
    tenantId: DEMO_TENANT_ID,
    name: "XYZ Distributors",
    phone: "+91-9876543211",
    email: "xyz@distributors.com",
    address: "456 Trade Avenue, City",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const seedCustomers: Customer[] = [
  {
    id: "customer-demo-1",
    tenantId: DEMO_TENANT_ID,
    name: "Regular Customer",
    phone: "+91-9876543220",
    email: "customer@example.com",
    address: "789 Customer Lane, City",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "customer-demo-2",
    tenantId: DEMO_TENANT_ID,
    name: "Local Restaurant",
    phone: "+91-9876543221",
    email: "restaurant@example.com",
    address: "321 Restaurant Road, City",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const seedPurchases: Purchase[] = [
  {
    id: "purchase-demo-1",
    tenantId: DEMO_TENANT_ID,
    supplierId: "supplier-demo-1",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    items: [
      { productId: "product-demo-1", quantity: 100, price: 80 },
      { productId: "product-demo-2", quantity: 50, price: 45 }
    ],
    totalAmount: 10250, // (100 * 80) + (50 * 45)
    paidAmount: 10250,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const seedSales: Sale[] = [
  {
    id: "sale-demo-1",
    tenantId: DEMO_TENANT_ID,
    customerId: "customer-demo-1",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    items: [
      { productId: "product-demo-1", quantity: 10, price: 100 },
      { productId: "product-demo-3", quantity: 5, price: 60 }
    ],
    totalAmount: 1300, // (10 * 100) + (5 * 60)
    receivedAmount: 1000, // Partial payment
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const seedPayments: Payment[] = [
  {
    id: "payment-demo-1",
    tenantId: DEMO_TENANT_ID,
    type: "customer",
    partyId: "customer-demo-1",
    amount: 500,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    mode: "cash",
    reference: "CASH-001",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const seedStaff: Staff[] = [
  {
    id: "staff-demo-1",
    tenantId: DEMO_TENANT_ID,
    name: "John Staff",
    email: "john@demoshop.com",
    phone: "+91-9876543230",
    role: "staff",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize from localStorage or seed data
const initialTenants = loadFromStorage<Tenant[]>(STORAGE_KEY_TENANTS, seedTenants);
const initialUsers = loadFromStorage<User[]>(STORAGE_KEY_USERS, seedUsers);
const initialProducts = loadFromStorage<Product[]>(STORAGE_KEY_PRODUCTS, seedProducts);
const initialSuppliers = loadFromStorage<Supplier[]>(STORAGE_KEY_SUPPLIERS, seedSuppliers);
const initialCustomers = loadFromStorage<Customer[]>(STORAGE_KEY_CUSTOMERS, seedCustomers);
const initialPurchases = loadFromStorage<Purchase[]>(STORAGE_KEY_PURCHASES, seedPurchases);
const initialSales = loadFromStorage<Sale[]>(STORAGE_KEY_SALES, seedSales);
const initialPayments = loadFromStorage<Payment[]>(STORAGE_KEY_PAYMENTS, seedPayments);
const initialStaff = loadFromStorage<Staff[]>(STORAGE_KEY_STAFF, seedStaff);

// If localStorage was empty, save seed data
if (!localStorage.getItem(STORAGE_KEY_TENANTS)) {
  saveToStorage(STORAGE_KEY_TENANTS, seedTenants);
}
if (!localStorage.getItem(STORAGE_KEY_USERS)) {
  saveToStorage(STORAGE_KEY_USERS, seedUsers);
}
if (!localStorage.getItem(STORAGE_KEY_PRODUCTS)) {
  saveToStorage(STORAGE_KEY_PRODUCTS, seedProducts);
}
if (!localStorage.getItem(STORAGE_KEY_SUPPLIERS)) {
  saveToStorage(STORAGE_KEY_SUPPLIERS, seedSuppliers);
}
if (!localStorage.getItem(STORAGE_KEY_CUSTOMERS)) {
  saveToStorage(STORAGE_KEY_CUSTOMERS, seedCustomers);
}
if (!localStorage.getItem(STORAGE_KEY_PURCHASES)) {
  saveToStorage(STORAGE_KEY_PURCHASES, seedPurchases);
}
if (!localStorage.getItem(STORAGE_KEY_SALES)) {
  saveToStorage(STORAGE_KEY_SALES, seedSales);
}
if (!localStorage.getItem(STORAGE_KEY_PAYMENTS)) {
  saveToStorage(STORAGE_KEY_PAYMENTS, seedPayments);
}
if (!localStorage.getItem(STORAGE_KEY_STAFF)) {
  saveToStorage(STORAGE_KEY_STAFF, seedStaff);
}

export const mockStore = {
  tenants: initialTenants,
  users: initialUsers,
  products: initialProducts,
  suppliers: initialSuppliers,
  customers: initialCustomers,
  purchases: initialPurchases,
  sales: initialSales,
  payments: initialPayments,
  staff: initialStaff,

  // ========== Tenant Methods ==========
  getTenantById(id: string): Tenant | undefined {
    return this.tenants.find((t) => t.id === id);
  },

  addTenant(name: string): Tenant {
    const tenant: Tenant = {
      id: generateId("tenant"),
      name,
      createdAt: new Date().toISOString()
    };
    this.tenants.push(tenant);
    saveToStorage(STORAGE_KEY_TENANTS, this.tenants);
    return tenant;
  },

  // ========== User Methods ==========
  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  getUsersByTenant(tenantId: string): User[] {
    return this.users.filter((u) => u.tenantId === tenantId);
  },

  addUser(tenantId: string, email: string, name: string, password: string, role: "owner" | "staff"): User {
    if (this.getUserByEmail(email)) {
      throw new Error("USER_EMAIL_EXISTS");
    }
    const user: User = {
      id: generateId("user"),
      tenantId,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      passwordHash: password, // mock only
      role,
      createdAt: new Date().toISOString()
    };
    this.users.push(user);
    saveToStorage(STORAGE_KEY_USERS, this.users);
    return user;
  },

  // ========== Product Methods ==========
  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  },

  getProductsByTenant(tenantId: string): Product[] {
    return this.products.filter((p) => p.tenantId === tenantId);
  },

  addProduct(tenantId: string, name: string, unit: string, purchasePrice: number, salePrice: number, sku?: string): Product {
    const product: Product = {
      id: generateId("product"),
      tenantId,
      name: name.trim(),
      sku: sku?.trim(),
      unit: unit.trim(),
      purchasePrice,
      salePrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.products.push(product);
    saveToStorage(STORAGE_KEY_PRODUCTS, this.products);
    return product;
  },

  updateProduct(id: string, updates: Partial<Omit<Product, "id" | "tenantId" | "createdAt">>): Product {
    const product = this.getProductById(id);
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }
    Object.assign(product, updates, { updatedAt: new Date().toISOString() });
    saveToStorage(STORAGE_KEY_PRODUCTS, this.products);
    return product;
  },

  deleteProduct(id: string): void {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("PRODUCT_NOT_FOUND");
    }
    this.products.splice(index, 1);
    saveToStorage(STORAGE_KEY_PRODUCTS, this.products);
  },

  // ========== Supplier Methods ==========
  getSupplierById(id: string): Supplier | undefined {
    return this.suppliers.find((s) => s.id === id);
  },

  getSuppliersByTenant(tenantId: string): Supplier[] {
    return this.suppliers.filter((s) => s.tenantId === tenantId);
  },

  addSupplier(tenantId: string, name: string, phone?: string, email?: string, address?: string): Supplier {
    const supplier: Supplier = {
      id: generateId("supplier"),
      tenantId,
      name: name.trim(),
      phone: phone?.trim(),
      email: email?.trim().toLowerCase(),
      address: address?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.suppliers.push(supplier);
    saveToStorage(STORAGE_KEY_SUPPLIERS, this.suppliers);
    return supplier;
  },

  updateSupplier(id: string, updates: Partial<Omit<Supplier, "id" | "tenantId" | "createdAt">>): Supplier {
    const supplier = this.getSupplierById(id);
    if (!supplier) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }
    Object.assign(supplier, updates, { updatedAt: new Date().toISOString() });
    saveToStorage(STORAGE_KEY_SUPPLIERS, this.suppliers);
    return supplier;
  },

  deleteSupplier(id: string): void {
    const index = this.suppliers.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }
    this.suppliers.splice(index, 1);
    saveToStorage(STORAGE_KEY_SUPPLIERS, this.suppliers);
  },

  // ========== Customer Methods ==========
  getCustomerById(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  },

  getCustomersByTenant(tenantId: string): Customer[] {
    return this.customers.filter((c) => c.tenantId === tenantId);
  },

  addCustomer(tenantId: string, name: string, phone?: string, email?: string, address?: string): Customer {
    const customer: Customer = {
      id: generateId("customer"),
      tenantId,
      name: name.trim(),
      phone: phone?.trim(),
      email: email?.trim().toLowerCase(),
      address: address?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.customers.push(customer);
    saveToStorage(STORAGE_KEY_CUSTOMERS, this.customers);
    return customer;
  },

  updateCustomer(id: string, updates: Partial<Omit<Customer, "id" | "tenantId" | "createdAt">>): Customer {
    const customer = this.getCustomerById(id);
    if (!customer) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }
    Object.assign(customer, updates, { updatedAt: new Date().toISOString() });
    saveToStorage(STORAGE_KEY_CUSTOMERS, this.customers);
    return customer;
  },

  deleteCustomer(id: string): void {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }
    this.customers.splice(index, 1);
    saveToStorage(STORAGE_KEY_CUSTOMERS, this.customers);
  },

  // ========== Purchase Methods ==========
  getPurchaseById(id: string): Purchase | undefined {
    return this.purchases.find((p) => p.id === id);
  },

  getPurchasesByTenant(tenantId: string): Purchase[] {
    return this.purchases.filter((p) => p.tenantId === tenantId);
  },

  getPurchasesBySupplier(supplierId: string): Purchase[] {
    return this.purchases.filter((p) => p.supplierId === supplierId);
  },

  addPurchase(
    tenantId: string,
    supplierId: string,
    date: string,
    items: PurchaseItem[],
    paidAmount: number = 0
  ): Purchase {
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const purchase: Purchase = {
      id: generateId("purchase"),
      tenantId,
      supplierId,
      date,
      items,
      totalAmount,
      paidAmount,
      createdAt: new Date().toISOString()
    };
    this.purchases.push(purchase);
    saveToStorage(STORAGE_KEY_PURCHASES, this.purchases);
    return purchase;
  },

  updatePurchase(id: string, updates: Partial<Omit<Purchase, "id" | "tenantId" | "createdAt">>): Purchase {
    const purchase = this.getPurchaseById(id);
    if (!purchase) {
      throw new Error("PURCHASE_NOT_FOUND");
    }
    // Recalculate totalAmount if items changed
    if (updates.items) {
      updates.totalAmount = updates.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    }
    Object.assign(purchase, updates);
    saveToStorage(STORAGE_KEY_PURCHASES, this.purchases);
    return purchase;
  },

  deletePurchase(id: string): void {
    const index = this.purchases.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("PURCHASE_NOT_FOUND");
    }
    this.purchases.splice(index, 1);
    saveToStorage(STORAGE_KEY_PURCHASES, this.purchases);
  },

  // ========== Sale Methods ==========
  getSaleById(id: string): Sale | undefined {
    return this.sales.find((s) => s.id === id);
  },

  getSalesByTenant(tenantId: string): Sale[] {
    return this.sales.filter((s) => s.tenantId === tenantId);
  },

  getSalesByCustomer(customerId: string): Sale[] {
    return this.sales.filter((s) => s.customerId === customerId);
  },

  addSale(
    tenantId: string,
    customerId: string,
    date: string,
    items: SaleItem[],
    receivedAmount: number = 0
  ): Sale {
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const sale: Sale = {
      id: generateId("sale"),
      tenantId,
      customerId,
      date,
      items,
      totalAmount,
      receivedAmount,
      createdAt: new Date().toISOString()
    };
    this.sales.push(sale);
    saveToStorage(STORAGE_KEY_SALES, this.sales);
    return sale;
  },

  updateSale(id: string, updates: Partial<Omit<Sale, "id" | "tenantId" | "createdAt">>): Sale {
    const sale = this.getSaleById(id);
    if (!sale) {
      throw new Error("SALE_NOT_FOUND");
    }
    // Recalculate totalAmount if items changed
    if (updates.items) {
      updates.totalAmount = updates.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    }
    Object.assign(sale, updates);
    saveToStorage(STORAGE_KEY_SALES, this.sales);
    return sale;
  },

  deleteSale(id: string): void {
    const index = this.sales.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error("SALE_NOT_FOUND");
    }
    this.sales.splice(index, 1);
    saveToStorage(STORAGE_KEY_SALES, this.sales);
  },

  // ========== Payment Methods ==========
  getPaymentById(id: string): Payment | undefined {
    return this.payments.find((p) => p.id === id);
  },

  getPaymentsByTenant(tenantId: string): Payment[] {
    return this.payments.filter((p) => p.tenantId === tenantId);
  },

  getPaymentsByParty(partyId: string, type: "supplier" | "customer"): Payment[] {
    return this.payments.filter((p) => p.partyId === partyId && p.type === type);
  },

  addPayment(
    tenantId: string,
    type: "supplier" | "customer",
    partyId: string,
    amount: number,
    date: string,
    mode: "cash" | "online" | "cheque",
    reference?: string
  ): Payment {
    const payment: Payment = {
      id: generateId("payment"),
      tenantId,
      type,
      partyId,
      amount,
      date,
      mode,
      reference: reference?.trim(),
      createdAt: new Date().toISOString()
    };
    this.payments.push(payment);
    saveToStorage(STORAGE_KEY_PAYMENTS, this.payments);
    return payment;
  },

  updatePayment(id: string, updates: Partial<Omit<Payment, "id" | "tenantId" | "createdAt">>): Payment {
    const payment = this.getPaymentById(id);
    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }
    Object.assign(payment, updates);
    saveToStorage(STORAGE_KEY_PAYMENTS, this.payments);
    return payment;
  },

  deletePayment(id: string): void {
    const index = this.payments.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("PAYMENT_NOT_FOUND");
    }
    this.payments.splice(index, 1);
    saveToStorage(STORAGE_KEY_PAYMENTS, this.payments);
  },

  // ========== Staff Methods ==========
  getStaffById(id: string): Staff | undefined {
    return this.staff.find((s) => s.id === id);
  },

  getStaffByTenant(tenantId: string): Staff[] {
    return this.staff.filter((s) => s.tenantId === tenantId);
  },

  addStaff(tenantId: string, name: string, role: "owner" | "staff", email?: string, phone?: string): Staff {
    const staffMember: Staff = {
      id: generateId("staff"),
      tenantId,
      name: name.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone?.trim(),
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.staff.push(staffMember);
    saveToStorage(STORAGE_KEY_STAFF, this.staff);
    return staffMember;
  },

  updateStaff(id: string, updates: Partial<Omit<Staff, "id" | "tenantId" | "createdAt">>): Staff {
    const staffMember = this.getStaffById(id);
    if (!staffMember) {
      throw new Error("STAFF_NOT_FOUND");
    }
    Object.assign(staffMember, updates, { updatedAt: new Date().toISOString() });
    saveToStorage(STORAGE_KEY_STAFF, this.staff);
    return staffMember;
  },

  deleteStaff(id: string): void {
    const index = this.staff.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error("STAFF_NOT_FOUND");
    }
    this.staff.splice(index, 1);
    saveToStorage(STORAGE_KEY_STAFF, this.staff);
  }
};
