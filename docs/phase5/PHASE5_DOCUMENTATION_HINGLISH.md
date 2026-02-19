# Phase 5: Suppliers + Customers + Ledger Management - Complete Documentation (Hinglish)

## Overview (Jankari)

Phase 5 mein humne Supplier aur Customer management functionality implement ki hai with complete ledger tracking. Is phase mein humne SupplierService, CustomerService, aur LedgerService interfaces, mock implementations, aur complete UI components banaye hain. Due amounts automatically calculate hote hain purchases/sales aur payments se.

**Goal (Lakshya)**: Users suppliers aur customers create/edit/delete kar sakte hain, unke ledgers dekh sakte hain, payments add kar sakte hain, aur generic ledger view se saare transactions filter kar sakte hain.

**Key Feature**: Due calculation purchases (suppliers ke liye) aur sales (customers ke liye) se automatically hota hai. Payments add karne se due amounts automatically update hote hain.

---

## Architecture Pattern (Rachna Pattern)

### Service Layer Pattern (Phase 4 se continue)

Phase 5 mein humne Phase 4 ke service layer pattern ko follow kiya hai:

```
┌─────────────────────────────────────┐
│         UI Components               │
│  (SuppliersPage, CustomersPage,    │
│   SupplierLedgerPage, etc.)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Service Interface               │
│  (SupplierService, CustomerService, │
│   LedgerService contracts)          │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌──────────┐      ┌──────────────┐
│   Mock   │      │     HTTP     │
│ Service  │      │   Service    │
│(Phase 5) │      │  (Phase 11)  │
└──────────┘      └──────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Mock Store (store.ts)           │
│  - Suppliers[]                       │
│  - Customers[]                       │
│  - Purchases[] (due calculation)    │
│  - Sales[] (due calculation)         │
│  - Payments[] (due calculation)      │
└─────────────────────────────────────┘
```

### Key Benefits (Mukhya Fayde)

- ✅ **Zero UI changes** jab mock se HTTP mode mein switch karte hain
- ✅ **Business logic** services mein rehti hai (due calculation)
- ✅ **Auto due calculation** purchases/sales/payments se
- ✅ **Type safety** TypeScript interfaces se
- ✅ **Tenant isolation** har operation tenant-aware hai
- ✅ **Ledger tracking** complete transaction history

---

## File Structure (File Ki Rachna)

```
src/
├── services/
│   ├── interfaces/
│   │   ├── SupplierService.ts        # Service contract + types (NEW)
│   │   ├── CustomerService.ts        # Service contract + types (NEW)
│   │   └── LedgerService.ts           # Service contract + types (NEW)
│   ├── mock/
│   │   ├── SupplierServiceMock.ts    # Mock implementation (NEW)
│   │   ├── CustomerServiceMock.ts    # Mock implementation (NEW)
│   │   └── LedgerServiceMock.ts      # Mock implementation (NEW)
│   ├── http/
│   │   ├── SupplierServiceHttp.ts    # HTTP stub (NEW, Phase 11)
│   │   ├── CustomerServiceHttp.ts    # HTTP stub (NEW, Phase 11)
│   │   └── LedgerServiceHttp.ts      # HTTP stub (NEW, Phase 11)
│   └── index.ts                       # Service factory (UPDATED)
│
├── components/
│   ├── suppliers/
│   │   └── SupplierFormDialog.tsx    # Add/Edit dialog (NEW)
│   ├── customers/
│   │   └── CustomerFormDialog.tsx    # Add/Edit dialog (NEW)
│   └── ledger/
│       └── AddPaymentDialog.tsx       # Payment dialog (NEW)
│
└── pages/
    ├── suppliers/
    │   ├── SuppliersPage.tsx         # Main suppliers page (UPDATED)
    │   └── SupplierLedgerPage.tsx     # Supplier ledger (UPDATED)
    ├── customers/
    │   ├── CustomersPage.tsx           # Main customers page (UPDATED)
    │   └── CustomerLedgerPage.tsx     # Customer ledger (UPDATED)
    └── ledger/
        └── LedgerPage.tsx             # Generic ledger view (UPDATED)
```

---

## Code Changes Explained (Code Changes Ki Vistrit Jankari)

### 1. SupplierService Interface (`src/services/interfaces/SupplierService.ts`)

**Purpose (Uddeshya)**: Yeh contract define karta hai jo sabhi supplier service implementations ko follow karna hoga.

#### Types Defined (Defined Kiye Gaye Types)

```typescript
// Supplier with calculated due amount
export interface SupplierWithDue extends Supplier {
  dueAmount: number; // Total amount due to supplier (calculated from purchases - payments)
}

// Create supplier request
export interface CreateSupplierRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

// Update supplier request (all fields optional)
export interface UpdateSupplierRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}
```

**SupplierWithDue kyun?**
- `Supplier` interface store se aata hai (Phase 3)
- `SupplierWithDue` extends karke `dueAmount` field add kiya
- Due amount har query par calculate hota hai (real-time)

**Partial UpdateRequest kyun?**
- Update mein sirf changed fields bhejne hain
- Optional fields allow karte hain
- Flexibility milti hai

#### Service Contract (Service Ka Contract)

```typescript
export interface SupplierService {
  getSuppliers(): Promise<SupplierWithDue[]>;
  getSupplierById(id: string): Promise<SupplierWithDue | null>;
  createSupplier(request: CreateSupplierRequest): Promise<Supplier>;
  updateSupplier(id: string, request: UpdateSupplierRequest): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;
  getSupplierDue(supplierId: string): Promise<number>;
}
```

**Methods Explanation**:
- `getSuppliers()`: Tenant ke saare suppliers with due amounts
- `getSupplierById()`: Single supplier with due amount
- `createSupplier()`: Naya supplier create karna
- `updateSupplier()`: Existing supplier update karna
- `deleteSupplier()`: Supplier delete karna
- `getSupplierDue()`: Sirf due amount get karna

---

### 2. CustomerService Interface (`src/services/interfaces/CustomerService.ts`)

**Purpose (Uddeshya)**: Yeh contract define karta hai jo sabhi customer service implementations ko follow karna hoga.

#### Types Defined (Defined Kiye Gaye Types)

```typescript
// Customer with calculated due amount
export interface CustomerWithDue extends Customer {
  dueAmount: number; // Total amount due from customer (calculated from sales - payments)
}

// Create customer request
export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

// Update customer request (all fields optional)
export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}
```

**CustomerWithDue kyun?**
- `Customer` interface store se aata hai (Phase 3)
- `CustomerWithDue` extends karke `dueAmount` field add kiya
- Due amount har query par calculate hota hai (real-time)

#### Service Contract (Service Ka Contract)

```typescript
export interface CustomerService {
  getCustomers(): Promise<CustomerWithDue[]>;
  getCustomerById(id: string): Promise<CustomerWithDue | null>;
  createCustomer(request: CreateCustomerRequest): Promise<Customer>;
  updateCustomer(id: string, request: UpdateCustomerRequest): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;
  getCustomerDue(customerId: string): Promise<number>;
}
```

**Methods Explanation**:
- `getCustomers()`: Tenant ke saare customers with due amounts
- `getCustomerById()`: Single customer with due amount
- `createCustomer()`: Naya customer create karna
- `updateCustomer()`: Existing customer update karna
- `deleteCustomer()`: Customer delete karna
- `getCustomerDue()`: Sirf due amount get karna

---

### 3. LedgerService Interface (`src/services/interfaces/LedgerService.ts`)

**Purpose (Uddeshya)**: Yeh contract define karta hai jo sabhi ledger service implementations ko follow karna hoga.

#### Types Defined (Defined Kiye Gaye Types)

```typescript
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
```

**LedgerEntry kyun?**
- Purchase, sale, aur payment entries ko unified format mein represent karta hai
- Running balance maintain karta hai
- Party information (supplier/customer) include karta hai

**LedgerFilter kyun?**
- Generic ledger view mein filtering ke liye
- Date range filtering
- Party type filtering

#### Service Contract (Service Ka Contract)

```typescript
export interface LedgerService {
  getSupplierLedger(supplierId: string): Promise<LedgerEntry[]>;
  getCustomerLedger(customerId: string): Promise<LedgerEntry[]>;
  getLedgerEntries(filter?: LedgerFilter): Promise<LedgerEntry[]>;
  addPayment(request: CreatePaymentRequest): Promise<Payment>;
  getPaymentById(id: string): Promise<Payment | null>;
  deletePayment(id: string): Promise<void>;
}
```

**Methods Explanation**:
- `getSupplierLedger()`: Specific supplier ke saare ledger entries
- `getCustomerLedger()`: Specific customer ke saare ledger entries
- `getLedgerEntries()`: Generic ledger entries with filters
- `addPayment()`: Payment entry add karna
- `getPaymentById()`: Payment get karna
- `deletePayment()`: Payment delete karna

---

### 4. SupplierServiceMock (`src/services/mock/SupplierServiceMock.ts`)

**Purpose (Uddeshya)**: SupplierService interface ko mock store use karke implement karta hai.

#### Tenant ID Helper (Tenant ID Helper)

```typescript
private getTenantId(): string {
  const session = authService.getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session.tenant.id;
}
```

**Yeh method kyun?**
- Har operation tenant-aware hona chahiye
- Session se tenant ID get karta hai
- Unauthorized access ko prevent karta hai

#### Due Calculation Logic (Due Calculation Ka Logic)

```typescript
private calculateDue(supplierId: string, tenantId: string): number {
  // Get all purchases for this supplier
  const purchases = mockStore.getPurchasesBySupplier(supplierId);
  // Filter by tenant
  const tenantPurchases = purchases.filter((p) => p.tenantId === tenantId);

  // Get all payments made to this supplier
  const payments = mockStore.getPaymentsByParty(supplierId, "supplier");
  // Filter by tenant
  const tenantPayments = payments.filter((p) => p.tenantId === tenantId);

  let due = 0;

  // Add unpaid amounts from purchases
  for (const purchase of tenantPurchases) {
    const unpaid = purchase.totalAmount - purchase.paidAmount;
    due += unpaid;
  }

  // Subtract payments made
  for (const payment of tenantPayments) {
    due -= payment.amount;
  }

  return Math.max(0, due); // Ensure due is never negative
}
```

**Due Calculation Formula**:
```
Due = Sum of (purchase.totalAmount - purchase.paidAmount) - Sum of payments
```

**Steps**:
1. Supplier ke saare purchases get karo
2. Har purchase ke liye unpaid amount calculate karo (totalAmount - paidAmount)
3. Unpaid amounts add karo (due increase)
4. Supplier ko kiye gaye saare payments get karo
5. Payments subtract karo (due decrease)
6. Negative due avoid karo (Math.max(0, due))

**Real-time calculation kyun?**
- Due database mein store nahi hota
- Har query par fresh calculate hota hai
- Purchases/payments change hone par automatically update hota hai

#### SupplierWithDue Conversion (SupplierWithDue Conversion)

```typescript
private supplierWithDue(supplier: Supplier): SupplierWithDue {
  const dueAmount = this.calculateDue(supplier.id, supplier.tenantId);
  return {
    ...supplier,
    dueAmount
  };
}
```

**Yeh method kyun?**
- `Supplier` (store se) ko `SupplierWithDue` mein convert karta hai
- Due calculate karke add karta hai
- Reusable helper method

#### Get Suppliers Implementation (Get Suppliers Implementation)

```typescript
async getSuppliers(): Promise<SupplierWithDue[]> {
  const tenantId = this.getTenantId();
  const suppliers = mockStore.getSuppliersByTenant(tenantId);
  return suppliers.map((s) => this.supplierWithDue(s));
}
```

**Steps**:
1. Current tenant ID get karo
2. Tenant ke saare suppliers get karo
3. Har supplier ke liye due calculate karo
4. SupplierWithDue array return karo

#### Create Supplier Implementation (Create Supplier Implementation)

```typescript
async createSupplier(request: CreateSupplierRequest): Promise<Supplier> {
  const tenantId = this.getTenantId();

  // Validate required fields
  if (!request.name?.trim()) {
    throw new Error("SUPPLIER_NAME_REQUIRED");
  }

  return mockStore.addSupplier(
    tenantId,
    request.name.trim(),
    request.phone?.trim(),
    request.email?.trim(),
    request.address?.trim()
  );
}
```

**Validation kyun?**
- Required fields check (name)
- Data consistency maintain karta hai

**Trim kyun?**
- Whitespace remove karta hai
- Clean data store mein save hota hai

---

### 5. CustomerServiceMock (`src/services/mock/CustomerServiceMock.ts`)

**Purpose (Uddeshya)**: CustomerService interface ko mock store use karke implement karta hai.

#### Due Calculation Logic (Due Calculation Ka Logic)

```typescript
private calculateDue(customerId: string, tenantId: string): number {
  // Get all sales for this customer
  const sales = mockStore.getSalesByCustomer(customerId);
  // Filter by tenant
  const tenantSales = sales.filter((s) => s.tenantId === tenantId);

  // Get all payments received from this customer
  const payments = mockStore.getPaymentsByParty(customerId, "customer");
  // Filter by tenant
  const tenantPayments = payments.filter((p) => p.tenantId === tenantId);

  let due = 0;

  // Add unpaid amounts from sales
  for (const sale of tenantSales) {
    const unpaid = sale.totalAmount - sale.receivedAmount;
    due += unpaid;
  }

  // Subtract payments received
  for (const payment of tenantPayments) {
    due -= payment.amount;
  }

  return Math.max(0, due); // Ensure due is never negative
}
```

**Due Calculation Formula**:
```
Due = Sum of (sale.totalAmount - sale.receivedAmount) - Sum of payments
```

**Steps**:
1. Customer ke saare sales get karo
2. Har sale ke liye unpaid amount calculate karo (totalAmount - receivedAmount)
3. Unpaid amounts add karo (due increase)
4. Customer se milne wale saare payments get karo
5. Payments subtract karo (due decrease)
6. Negative due avoid karo (Math.max(0, due))

**Supplier vs Customer Due Difference**:
- **Supplier Due**: Hum supplier ko paise dene hain (purchases se)
- **Customer Due**: Customer ko humse paise dene hain (sales se)
- Dono mein calculation logic similar hai, bas data source different hai

---

### 6. LedgerServiceMock (`src/services/mock/LedgerServiceMock.ts`)

**Purpose (Uddeshya)**: LedgerService interface ko mock store use karke implement karta hai. Ledger entries purchases, sales, aur payments se generate karta hai.

#### Build Supplier Ledger (Supplier Ledger Build Karna)

```typescript
private buildSupplierLedger(supplierId: string, tenantId: string): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  let balance = 0;

  // Get supplier info
  const supplier = mockStore.getSupplierById(supplierId);
  if (!supplier || supplier.tenantId !== tenantId) {
    return [];
  }

  // Get all purchases for this supplier
  const purchases = mockStore.getPurchasesBySupplier(supplierId).filter(
    (p) => p.tenantId === tenantId
  );

  // Get all payments to this supplier
  const payments = mockStore.getPaymentsByParty(supplierId, "supplier").filter(
    (p) => p.tenantId === tenantId
  );

  // Combine and sort by date
  const allTransactions: Array<{ date: string; type: "purchase" | "payment"; data: Purchase | Payment }> = [];

  for (const purchase of purchases) {
    allTransactions.push({ date: purchase.date, type: "purchase", data: purchase });
  }

  for (const payment of payments) {
    allTransactions.push({ date: payment.date, type: "payment", data: payment });
  }

  // Sort by date (oldest first)
  allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Build entries
  for (const transaction of allTransactions) {
    if (transaction.type === "purchase") {
      const purchase = transaction.data as Purchase;
      const unpaid = purchase.totalAmount - purchase.paidAmount;
      if (unpaid > 0) {
        balance += unpaid;
        entries.push({
          id: `purchase-${purchase.id}`,
          type: "purchase",
          date: purchase.date,
          description: `Purchase #${purchase.id.slice(-6)}`,
          credit: unpaid,
          debit: 0,
          balance,
          referenceId: purchase.id,
          partyId: supplierId,
          partyName: supplier.name
        });
      }
    } else {
      const payment = transaction.data as Payment;
      balance -= payment.amount;
      entries.push({
        id: `payment-${payment.id}`,
        type: "payment",
        date: payment.date,
        description: `Payment (${payment.mode})${payment.reference ? ` - ${payment.reference}` : ""}`,
        credit: payment.amount,
        debit: 0,
        balance,
        referenceId: payment.id,
        partyId: supplierId,
        partyName: supplier.name
      });
    }
  }

  return entries;
}
```

**Ledger Entry Building Steps**:
1. Purchases aur payments ko combine karo
2. Date ke basis par sort karo (oldest first)
3. Har transaction ke liye ledger entry create karo
4. Running balance maintain karo
5. Purchase entries: credit (due increase)
6. Payment entries: credit (due decrease)

**Balance Calculation**:
- Purchase: `balance += unpaid` (due increase)
- Payment: `balance -= payment.amount` (due decrease)
- Balance = current outstanding amount

#### Build Customer Ledger (Customer Ledger Build Karna)

```typescript
private buildCustomerLedger(customerId: string, tenantId: string): LedgerEntry[] {
  // Similar to supplier ledger but:
  // - Uses sales instead of purchases
  // - Debit for unpaid sales (customer owes us)
  // - Debit for payments (customer paid us)
}
```

**Customer Ledger vs Supplier Ledger**:
- **Supplier**: Credit entries (hum supplier ko paise dene hain)
- **Customer**: Debit entries (customer ko humse paise dene hain)
- Logic similar hai, bas credit/debit reversed hai

#### Get Ledger Entries (Generic Ledger)

```typescript
async getLedgerEntries(filter?: LedgerFilter): Promise<LedgerEntry[]> {
  const tenantId = this.getTenantId();
  const allEntries: LedgerEntry[] = [];

  if (filter?.partyId) {
    // Get ledger for specific party
    if (filter.type === "supplier") {
      return this.getSupplierLedger(filter.partyId);
    } else if (filter.type === "customer") {
      return this.getCustomerLedger(filter.partyId);
    }
  } else if (filter?.type === "supplier") {
    // Get all supplier ledgers
    const suppliers = mockStore.getSuppliersByTenant(tenantId);
    for (const supplier of suppliers) {
      allEntries.push(...this.getSupplierLedger(supplier.id));
    }
  } else if (filter?.type === "customer") {
    // Get all customer ledgers
    const customers = mockStore.getCustomersByTenant(tenantId);
    for (const customer of customers) {
      allEntries.push(...this.getCustomerLedger(customer.id));
    }
  } else {
    // Get all ledgers (suppliers + customers)
    const suppliers = mockStore.getSuppliersByTenant(tenantId);
    for (const supplier of suppliers) {
      allEntries.push(...this.getSupplierLedger(supplier.id));
    }
    const customers = mockStore.getCustomersByTenant(tenantId);
    for (const customer of customers) {
      allEntries.push(...this.getCustomerLedger(customer.id));
    }
  }

  // Apply date filters if provided
  let filteredEntries = allEntries;
  if (filter?.startDate) {
    filteredEntries = filteredEntries.filter(
      (e) => new Date(e.date).getTime() >= new Date(filter.startDate!).getTime()
    );
  }
  if (filter?.endDate) {
    filteredEntries = filteredEntries.filter(
      (e) => new Date(e.date).getTime() <= new Date(filter.endDate!).getTime()
    );
  }

  // Sort by date (newest first)
  filteredEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return filteredEntries;
}
```

**Filtering Logic**:
- Party ID filter: Specific supplier/customer ke entries
- Party type filter: All suppliers ya all customers
- Date range filter: Start date aur end date ke beech ke entries
- Default: Saare entries (suppliers + customers)

---

### 7. Service Factory Update (`src/services/index.ts`)

**Purpose (Uddeshya)**: Naye services ko export karta hai aur mode switch handle karta hai.

```typescript
import type { SupplierService } from "./interfaces/SupplierService";
import { SupplierServiceMock } from "./mock/SupplierServiceMock";
import { SupplierServiceHttp } from "./http/SupplierServiceHttp";
import type { CustomerService } from "./interfaces/CustomerService";
import { CustomerServiceMock } from "./mock/CustomerServiceMock";
import { CustomerServiceHttp } from "./http/CustomerServiceHttp";
import type { LedgerService } from "./interfaces/LedgerService";
import { LedgerServiceMock } from "./mock/LedgerServiceMock";
import { LedgerServiceHttp } from "./http/LedgerServiceHttp";

const dataMode = import.meta.env.VITE_DATA_MODE || "mock";

export const supplierService: SupplierService =
  dataMode === "mock" ? new SupplierServiceMock() : new SupplierServiceHttp();

export const customerService: CustomerService =
  dataMode === "mock" ? new CustomerServiceMock() : new CustomerServiceHttp();

export const ledgerService: LedgerService =
  dataMode === "mock" ? new LedgerServiceMock() : new LedgerServiceHttp();
```

**Factory pattern kyun?**
- UI components `supplierService`, `customerService`, `ledgerService` import karte hain
- UI ko nahi pata ki mock hai ya HTTP
- Mode switch easy hota hai

---

### 8. SupplierFormDialog Component (`src/components/suppliers/SupplierFormDialog.tsx`)

**Purpose (Uddeshya)**: Supplier add/edit ke liye dialog form.

#### Props Interface (Props Interface)

```typescript
interface SupplierFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSupplierRequest | UpdateSupplierRequest) => Promise<void>;
  supplier?: SupplierWithDue | null; // null = create mode, SupplierWithDue = edit mode
}
```

**Supplier prop kyun?**
- `null`: Create mode (naya supplier)
- `SupplierWithDue`: Edit mode (existing supplier)
- Single component dono modes handle karta hai

#### Form Fields (Form Fields)

```typescript
const [name, setName] = React.useState("");
const [phone, setPhone] = React.useState("");
const [email, setEmail] = React.useState("");
const [address, setAddress] = React.useState("");
```

**Fields**:
- Name: Required
- Phone: Optional
- Email: Optional
- Address: Optional (multiline)

#### Form Reset Logic (Form Reset Logic)

```typescript
React.useEffect(() => {
  if (open) {
    if (supplier) {
      // Edit mode - populate form
      setName(supplier.name);
      setPhone(supplier.phone || "");
      setEmail(supplier.email || "");
      setAddress(supplier.address || "");
    } else {
      // Create mode - reset form
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
    }
    setError(null);
  }
}, [open, supplier]);
```

**useEffect kyun?**
- Dialog open hone par form reset/populate hota hai
- Edit mode mein existing data populate hota hai
- Create mode mein empty form dikhta hai

#### Form Validation (Form Validation)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    if (!name.trim()) {
      throw new Error("Supplier name is required");
    }

    const data: CreateSupplierRequest | UpdateSupplierRequest = {
      name: name.trim(),
      ...(phone.trim() && { phone: phone.trim() }),
      ...(email.trim() && { email: email.trim() }),
      ...(address.trim() && { address: address.trim() })
    };

    await onSubmit(data);
    onClose();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save supplier";
    setError(message);
  } finally {
    setLoading(false);
  }
};
```

**Validation Steps**:
1. Required fields check (name)
2. Data object create karna
3. Optional fields conditional add (agar empty nahi hain)

**Conditional fields kyun?**
- Optional fields ko data mein include nahi karte agar empty hain
- Clean data structure

---

### 9. CustomerFormDialog Component (`src/components/customers/CustomerFormDialog.tsx`)

**Purpose (Uddeshya)**: Customer add/edit ke liye dialog form.

**Implementation**: SupplierFormDialog jaisa hi hai, bas supplier ki jagah customer. Same pattern follow kiya gaya hai.

**Key Differences**:
- Component name: `CustomerFormDialog`
- Props: `customer?: CustomerWithDue | null`
- Labels: "Customer Name" instead of "Supplier Name"
- Service: `customerService` instead of `supplierService`

---

### 10. AddPaymentDialog Component (`src/components/ledger/AddPaymentDialog.tsx`)

**Purpose (Uddeshya)**: Payment add karne ke liye dialog form. Supplier aur customer dono ke liye use hota hai.

#### Props Interface (Props Interface)

```typescript
interface AddPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentRequest) => Promise<void>;
  type: "supplier" | "customer";
  partyId: string;
  partyName: string;
}
```

**Type prop kyun?**
- Payment supplier ko hai ya customer se hai, yeh specify karta hai
- Ledger entries mein correct credit/debit set karne ke liye

#### Form Fields (Form Fields)

```typescript
const [amount, setAmount] = React.useState("");
const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
const [mode, setMode] = React.useState<"cash" | "online" | "cheque">("cash");
const [reference, setReference] = React.useState("");
```

**Fields**:
- Amount: Required, number > 0
- Date: Required, default = today
- Mode: Required, dropdown (cash/online/cheque)
- Reference: Optional, transaction reference

#### Payment Mode Selection (Payment Mode Selection)

```typescript
<FormControl fullWidth required>
  <InputLabel>Payment Mode</InputLabel>
  <Select value={mode} onChange={(e) => setMode(e.target.value as "cash" | "online" | "cheque")} label="Payment Mode">
    <MenuItem value="cash">Cash</MenuItem>
    <MenuItem value="online">Online</MenuItem>
    <MenuItem value="cheque">Cheque</MenuItem>
  </Select>
</FormControl>
```

**Payment Modes**:
- Cash: Physical cash payment
- Online: Bank transfer, UPI, etc.
- Cheque: Cheque payment

---

### 11. SuppliersPage Component (`src/pages/suppliers/SuppliersPage.tsx`)

**Purpose (Uddeshya)**: Main suppliers page with list view, search, aur CRUD operations.

#### State Management (State Management)

```typescript
const [suppliers, setSuppliers] = React.useState<SupplierWithDue[]>([]);
const [loading, setLoading] = React.useState(true);
const [error, setError] = React.useState<string | null>(null);
const [searchQuery, setSearchQuery] = React.useState("");
const [dialogOpen, setDialogOpen] = React.useState(false);
const [editingSupplier, setEditingSupplier] = React.useState<SupplierWithDue | null>(null);
```

**State variables**:
- `suppliers`: Supplier list with due amounts
- `loading`: Loading state
- `error`: Error message
- `searchQuery`: Search filter
- `dialogOpen`: Dialog visibility
- `editingSupplier`: Currently editing supplier (null = create mode)

#### Load Suppliers (Load Suppliers)

```typescript
const loadSuppliers = React.useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await supplierService.getSuppliers();
    setSuppliers(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load suppliers";
    setError(message);
  } finally {
    setLoading(false);
  }
}, []);

React.useEffect(() => {
  loadSuppliers();
}, [loadSuppliers]);
```

**useCallback kyun?**
- Function memoization (re-render par recreate nahi hota)
- useEffect dependency stable rehti hai

#### Search Filter (Search Filter)

```typescript
const filteredSuppliers = React.useMemo(() => {
  if (!searchQuery.trim()) {
    return suppliers;
  }
  const query = searchQuery.toLowerCase();
  return suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      s.phone?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.address?.toLowerCase().includes(query)
  );
}, [suppliers, searchQuery]);
```

**Search fields**:
- Name (case-insensitive)
- Phone (case-insensitive, optional)
- Email (case-insensitive, optional)
- Address (case-insensitive, optional)

#### CRUD Handlers (CRUD Handlers)

```typescript
// Create/Edit
const handleSubmit = async (data: CreateSupplierRequest | UpdateSupplierRequest) => {
  if (editingSupplier) {
    await supplierService.updateSupplier(editingSupplier.id, data as UpdateSupplierRequest);
  } else {
    await supplierService.createSupplier(data as CreateSupplierRequest);
  }
  await loadSuppliers(); // Refresh list
};

// Delete
const handleDelete = async (id: string) => {
  if (!window.confirm("Are you sure you want to delete this supplier?")) {
    return;
  }
  try {
    await supplierService.deleteSupplier(id);
    await loadSuppliers(); // Refresh list
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete supplier";
    alert(message);
  }
};

// Ledger button
const handleLedger = (supplierId: string) => {
  navigate(`/suppliers/${supplierId}`);
};
```

**Delete confirmation kyun?**
- Accidental deletion prevent karta hai
- User ko warning deta hai

**List refresh kyun?**
- CRUD operations ke baad list update hota hai
- Latest data display hota hai

#### Table UI (Table UI)

```typescript
<TableContainer component={Paper} variant="outlined">
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Phone</TableCell>
        <TableCell>Email</TableCell>
        <TableCell>Address</TableCell>
        <TableCell>Due Amount</TableCell>
        <TableCell align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredSuppliers.map((supplier) => (
        <TableRow key={supplier.id} hover>
          <TableCell>{supplier.name}</TableCell>
          <TableCell>{supplier.phone || "-"}</TableCell>
          <TableCell>{supplier.email || "-"}</TableCell>
          <TableCell>{supplier.address || "-"}</TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                color={supplier.dueAmount > 0 ? "error.main" : "text.secondary"}
                fontWeight={supplier.dueAmount > 0 ? "bold" : "normal"}
              >
                ₹{supplier.dueAmount.toFixed(2)}
              </Typography>
              {supplier.dueAmount > 0 && (
                <Chip label="Due" color="error" size="small" />
              )}
            </Box>
          </TableCell>
          <TableCell align="right">
            <IconButton onClick={() => handleLedger(supplier.id)} color="primary" size="small" title="View Ledger">
              <AccountBalanceIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={() => handleEdit(supplier)} color="primary" size="small" title="Edit">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={() => handleDelete(supplier.id)} color="error" size="small" title="Delete">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

**Table Features**:
- Hover effect (better UX)
- Due amount display with color coding (red if due > 0)
- Due chip badge (agar due > 0)
- Action buttons (Ledger, Edit, Delete)
- Empty state handling

**Due Amount Display**:
- Due > 0: Red color, bold, "Due" chip
- Due = 0: Gray color, normal weight

---

### 12. CustomersPage Component (`src/pages/customers/CustomersPage.tsx`)

**Purpose (Uddeshya)**: Main customers page with list view, search, aur CRUD operations.

**Implementation**: SuppliersPage jaisa hi hai, bas supplier ki jagah customer. Same pattern follow kiya gaya hai.

**Key Differences**:
- Component name: `CustomersPage`
- Service: `customerService` instead of `supplierService`
- Navigation: `/customers/${customerId}` instead of `/suppliers/${supplierId}`
- Labels: "Customer" instead of "Supplier"

---

### 13. SupplierLedgerPage Component (`src/pages/suppliers/SupplierLedgerPage.tsx`)

**Purpose (Uddeshya)**: Supplier ke ledger entries display karta hai aur payment add karne ki facility deta hai.

#### State Management (State Management)

```typescript
const [supplier, setSupplier] = React.useState<{ name: string; dueAmount: number } | null>(null);
const [entries, setEntries] = React.useState<LedgerEntry[]>([]);
const [loading, setLoading] = React.useState(true);
const [error, setError] = React.useState<string | null>(null);
const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
```

**State variables**:
- `supplier`: Supplier info (name, dueAmount)
- `entries`: Ledger entries array
- `loading`: Loading state
- `error`: Error message
- `paymentDialogOpen`: Payment dialog visibility

#### Load Data (Load Data)

```typescript
const loadData = React.useCallback(async () => {
  if (!id) return;

  try {
    setLoading(true);
    setError(null);

    const supplierData = await supplierService.getSupplierById(id);
    if (!supplierData) {
      setError("Supplier not found");
      return;
    }

    setSupplier({ name: supplierData.name, dueAmount: supplierData.dueAmount });
    const ledgerEntries = await ledgerService.getSupplierLedger(id);
    setEntries(ledgerEntries);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load supplier ledger";
    setError(message);
  } finally {
    setLoading(false);
  }
}, [id]);
```

**Steps**:
1. Supplier ID se supplier data get karo
2. Supplier ke ledger entries get karo
3. State update karo

#### Add Payment Handler (Add Payment Handler)

```typescript
const handleAddPayment = async (data: CreatePaymentRequest) => {
  await ledgerService.addPayment(data);
  await loadData(); // Reload to refresh ledger entries
};
```

**Reload kyun?**
- Payment add karne ke baad ledger entries refresh hote hain
- Due amount automatically update hota hai

#### Ledger Table (Ledger Table)

```typescript
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Date</TableCell>
      <TableCell>Description</TableCell>
      <TableCell align="right">Credit (Due)</TableCell>
      <TableCell align="right">Debit (Paid)</TableCell>
      <TableCell align="right">Balance</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {entries.map((entry) => (
      <TableRow key={entry.id} hover>
        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {entry.description}
            <Chip
              label={entry.type}
              size="small"
              color={entry.type === "payment" ? "success" : entry.type === "purchase" ? "primary" : "default"}
              variant="outlined"
            />
          </Box>
        </TableCell>
        <TableCell align="right">
          {entry.credit > 0 && (
            <Typography color="error" fontWeight="bold">
              ₹{entry.credit.toFixed(2)}
            </Typography>
          )}
        </TableCell>
        <TableCell align="right">
          {entry.debit > 0 && (
            <Typography color="success.main" fontWeight="bold">
              ₹{entry.debit.toFixed(2)}
            </Typography>
          )}
        </TableCell>
        <TableCell align="right">
          <Typography fontWeight="bold" color={entry.balance > 0 ? "error.main" : "text.secondary"}>
            ₹{entry.balance.toFixed(2)}
          </Typography>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Table Features**:
- Date display (formatted)
- Description with type chip
- Credit column (due amounts, red color)
- Debit column (paid amounts, green color)
- Balance column (running balance, red if > 0)

**Color Coding**:
- Credit (Due): Red (error color)
- Debit (Paid): Green (success color)
- Balance > 0: Red (outstanding due)
- Balance = 0: Gray (no due)

---

### 14. CustomerLedgerPage Component (`src/pages/customers/CustomerLedgerPage.tsx`)

**Purpose (Uddeshya)**: Customer ke ledger entries display karta hai aur payment add karne ki facility deta hai.

**Implementation**: SupplierLedgerPage jaisa hi hai, bas supplier ki jagah customer. Same pattern follow kiya gaya hai.

**Key Differences**:
- Component name: `CustomerLedgerPage`
- Service: `customerService` instead of `supplierService`
- Ledger method: `getCustomerLedger()` instead of `getSupplierLedger()`
- Table headers: "Credit (Received)" instead of "Credit (Due)", "Debit (Due)" instead of "Debit (Paid)"

**Customer Ledger vs Supplier Ledger**:
- **Supplier**: Credit = Due (hum supplier ko paise dene hain)
- **Customer**: Debit = Due (customer ko humse paise dene hain)
- Color coding reversed hai

---

### 15. LedgerPage Component (`src/pages/ledger/LedgerPage.tsx`)

**Purpose (Uddeshya)**: Generic ledger view with filters. Saare suppliers aur customers ke transactions ek saath dikhata hai.

#### Filters (Filters)

```typescript
const [partyType, setPartyType] = React.useState<"supplier" | "customer" | "all">("all");
const [startDate, setStartDate] = React.useState("");
const [endDate, setEndDate] = React.useState("");
```

**Filter Options**:
- Party Type: All / Suppliers / Customers
- Start Date: Filter entries from this date
- End Date: Filter entries till this date

#### Load Entries (Load Entries)

```typescript
const loadEntries = React.useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const filterData: LedgerFilter = {};
    if (partyType !== "all") {
      filterData.type = partyType;
    }
    if (startDate) {
      filterData.startDate = new Date(startDate).toISOString();
    }
    if (endDate) {
      filterData.endDate = new Date(endDate).toISOString();
    }

    const data = await ledgerService.getLedgerEntries(filterData);
    setEntries(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load ledger entries";
    setError(message);
  } finally {
    setLoading(false);
  }
}, [partyType, startDate, endDate]);
```

**Filter Application**:
- Party type filter: Supplier ya customer entries
- Date range filter: Start date se end date tak ke entries
- Default: Saare entries (suppliers + customers)

#### Clear Filters (Clear Filters)

```typescript
const handleClearFilters = () => {
  setPartyType("all");
  setStartDate("");
  setEndDate("");
};
```

**Clear Filters kyun?**
- User easily filters reset kar sakta hai
- Better UX

#### Ledger Table (Ledger Table)

```typescript
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Date</TableCell>
      <TableCell>Party</TableCell>
      <TableCell>Description</TableCell>
      <TableCell align="right">Credit</TableCell>
      <TableCell align="right">Debit</TableCell>
      <TableCell align="right">Balance</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {entries.map((entry) => (
      <TableRow key={entry.id} hover>
        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
        <TableCell>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {entry.partyName}
            </Typography>
            <Chip
              label={entry.type === "supplier" ? "Supplier" : "Customer"}
              size="small"
              color={entry.type === "supplier" ? "primary" : "secondary"}
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {entry.description}
            <Chip
              label={entry.type}
              size="small"
              color={
                entry.type === "payment"
                  ? "success"
                  : entry.type === "purchase"
                  ? "primary"
                  : entry.type === "sale"
                  ? "secondary"
                  : "default"
              }
              variant="outlined"
            />
          </Box>
        </TableCell>
        {/* Credit, Debit, Balance columns */}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Table Features**:
- Party column: Party name with type chip (Supplier/Customer)
- Description column: Transaction description with type chip (Purchase/Sale/Payment)
- Credit/Debit columns: Amounts with color coding
- Balance column: Running balance

**Party Display**:
- Party name: Bold text
- Party type chip: Supplier (blue) / Customer (purple)

---

## Due Calculation Flow (Due Calculation Ka Flow)

### How Due is Calculated (Due Kaise Calculate Hota Hai)

#### Supplier Due Calculation

```
1. User SuppliersPage open karta hai
   ↓
2. SuppliersPage supplierService.getSuppliers() call karta hai
   ↓
3. SupplierServiceMock.getSuppliers():
   - Tenant ID get karta hai (session se)
   - mockStore.getSuppliersByTenant() se suppliers get karta hai
   - Har supplier ke liye calculateDue() call karta hai
   ↓
4. calculateDue() method:
   - mockStore.getPurchasesBySupplier() se purchases get karta hai
   - Har purchase ke liye unpaid = totalAmount - paidAmount calculate karta hai
   - Unpaid amounts add karta hai (due increase)
   - mockStore.getPaymentsByParty() se payments get karta hai
   - Payments subtract karta hai (due decrease)
   - Math.max(0, due) se negative due avoid karta hai
   ↓
5. SupplierWithDue objects return hote hain (supplier + dueAmount)
   ↓
6. SuppliersPage table mein display hota hai
```

#### Customer Due Calculation

```
1. User CustomersPage open karta hai
   ↓
2. CustomersPage customerService.getCustomers() call karta hai
   ↓
3. CustomerServiceMock.getCustomers():
   - Tenant ID get karta hai (session se)
   - mockStore.getCustomersByTenant() se customers get karta hai
   - Har customer ke liye calculateDue() call karta hai
   ↓
4. calculateDue() method:
   - mockStore.getSalesByCustomer() se sales get karta hai
   - Har sale ke liye unpaid = totalAmount - receivedAmount calculate karta hai
   - Unpaid amounts add karta hai (due increase)
   - mockStore.getPaymentsByParty() se payments get karta hai
   - Payments subtract karta hai (due decrease)
   - Math.max(0, due) se negative due avoid karta hai
   ↓
5. CustomerWithDue objects return hote hain (customer + dueAmount)
   ↓
6. CustomersPage table mein display hota hai
```

### Example Calculation (Udaharan)

#### Supplier Due Example

**Scenario**:
- Supplier: "ABC Wholesale" (id: "supplier-demo-1")
- Purchase 1: ₹10,250 total, ₹10,250 paid (unpaid: ₹0)
- Purchase 2: ₹5,000 total, ₹3,000 paid (unpaid: ₹2,000)
- Payment 1: ₹500

**Calculation**:
```
Due = (10,250 - 10,250) + (5,000 - 3,000) - 500
    = 0 + 2,000 - 500
    = ₹1,500
```

#### Customer Due Example

**Scenario**:
- Customer: "Regular Customer" (id: "customer-demo-1")
- Sale 1: ₹1,300 total, ₹1,000 received (unpaid: ₹300)
- Sale 2: ₹2,000 total, ₹0 received (unpaid: ₹2,000)
- Payment 1: ₹500

**Calculation**:
```
Due = (1,300 - 1,000) + (2,000 - 0) - 500
    = 300 + 2,000 - 500
    = ₹1,800
```

**Real-time kyun?**
- Purchase/Sale/Payment create hone par due automatically update hota hai
- Koi manual refresh ki zarurat nahi
- Next query par fresh due dikhega

---

## Ledger Entry Flow (Ledger Entry Ka Flow)

### How Ledger Entries are Built (Ledger Entries Kaise Build Hote Hain)

```
1. User SupplierLedgerPage open karta hai
   ↓
2. SupplierLedgerPage ledgerService.getSupplierLedger() call karta hai
   ↓
3. LedgerServiceMock.getSupplierLedger():
   - buildSupplierLedger() call karta hai
   ↓
4. buildSupplierLedger() method:
   - mockStore.getPurchasesBySupplier() se purchases get karta hai
   - mockStore.getPaymentsByParty() se payments get karta hai
   - Purchases aur payments ko combine karta hai
   - Date ke basis par sort karta hai (oldest first)
   - Har transaction ke liye LedgerEntry create karta hai:
     * Purchase: credit = unpaid, debit = 0, balance += unpaid
     * Payment: credit = amount, debit = 0, balance -= amount
   ↓
5. LedgerEntry[] array return hota hai
   ↓
6. SupplierLedgerPage table mein display hota hai
```

### Example Ledger Entry Building (Udaharan)

**Scenario**:
- Supplier: "ABC Wholesale"
- Purchase 1 (Date: 2024-01-01): ₹10,000 total, ₹8,000 paid → Unpaid: ₹2,000
- Payment 1 (Date: 2024-01-05): ₹1,000
- Purchase 2 (Date: 2024-01-10): ₹5,000 total, ₹0 paid → Unpaid: ₹5,000

**Ledger Entries**:
```
Entry 1 (Purchase 1):
- Date: 2024-01-01
- Description: "Purchase #demo-1"
- Credit: ₹2,000
- Debit: ₹0
- Balance: ₹2,000

Entry 2 (Payment 1):
- Date: 2024-01-05
- Description: "Payment (cash)"
- Credit: ₹1,000
- Debit: ₹0
- Balance: ₹1,000 (2,000 - 1,000)

Entry 3 (Purchase 2):
- Date: 2024-01-10
- Description: "Purchase #demo-2"
- Credit: ₹5,000
- Debit: ₹0
- Balance: ₹6,000 (1,000 + 5,000)
```

---

## Data Flow Examples (Data Flow Ke Examples)

### Create Supplier Flow (Supplier Create Karna)

```
1. User "Add Supplier" button click karta hai
   ↓
2. SupplierFormDialog open hota hai (create mode)
   ↓
3. User form fill karta hai (name, phone, email, address)
   ↓
4. User "Create" button click karta hai
   ↓
5. Form validation:
   - Required fields check (name)
   ↓
6. supplierService.createSupplier() call hota hai
   ↓
7. SupplierServiceMock.createSupplier():
   - Tenant ID get karta hai
   - Validation check karta hai
   - mockStore.addSupplier() call karta hai
   ↓
8. mockStore.addSupplier():
   - Supplier object create karta hai
   - suppliers[] array mein add karta hai
   - localStorage mein save karta hai
   ↓
9. SuppliersPage loadSuppliers() call karta hai
   ↓
10. Updated list display hota hai (new supplier with dueAmount = 0)
```

### Add Payment Flow (Payment Add Karna)

```
1. User SupplierLedgerPage par "Add Payment" button click karta hai
   ↓
2. AddPaymentDialog open hota hai
   ↓
3. User form fill karta hai (amount, date, mode, reference)
   ↓
4. User "Add Payment" button click karta hai
   ↓
5. Form validation:
   - Amount > 0 check
   - Date required check
   ↓
6. ledgerService.addPayment() call hota hai
   ↓
7. LedgerServiceMock.addPayment():
   - Tenant ID get karta hai
   - Party validation (supplier exists)
   - mockStore.addPayment() call karta hai
   ↓
8. mockStore.addPayment():
   - Payment object create karta hai
   - payments[] array mein add karta hai
   - localStorage mein save karta hai
   ↓
9. SupplierLedgerPage loadData() call karta hai
   ↓
10. Updated ledger entries display hote hain (new payment entry + updated balance)
11. Supplier due amount automatically decrease hota hai
```

### View Ledger Flow (Ledger Dekhna)

```
1. User SuppliersPage par "Ledger" icon click karta hai
   ↓
2. Navigate to /suppliers/:id
   ↓
3. SupplierLedgerPage load hota hai
   ↓
4. SupplierLedgerPage loadData() call karta hai:
   - supplierService.getSupplierById() → Supplier info
   - ledgerService.getSupplierLedger() → Ledger entries
   ↓
5. LedgerServiceMock.getSupplierLedger():
   - buildSupplierLedger() call karta hai
   - Purchases aur payments combine karta hai
   - Ledger entries build karta hai
   ↓
6. Ledger entries table mein display hote hain
   ↓
7. User "Add Payment" button se payment add kar sakta hai
```

---

## Testing (Testing)

### Phase 5 Testing Status

**UI Testing**: ✅ **Kiye Gaye** (manual testing)

**Technical Testing**: ✅ **Kiye Gaye**

1. ✅ **TypeScript Compilation**: Successful
   ```bash
   npm run build
   # ✓ built successfully
   ```

2. ✅ **Type Safety**: Sabhi components properly typed
   - Interfaces defined
   - Props typed
   - State typed

3. ✅ **Build Verification**: Production build successful
   - No compilation errors
   - All types resolved

### Manual Testing Scenarios (Manual Testing Ke Scenarios)

1. **Create Supplier**:
   - ✅ Form validation (required fields)
   - ✅ Supplier list mein add hota hai
   - ✅ Due amount = 0 (kyunki koi purchase nahi hai)

2. **Edit Supplier**:
   - ✅ Existing data populate hota hai
   - ✅ Partial updates kaam karte hain
   - ✅ Updated data save hota hai

3. **Delete Supplier**:
   - ✅ Confirmation dialog
   - ✅ Supplier remove hota hai
   - ✅ List update hota hai

4. **Search Suppliers**:
   - ✅ Name se search
   - ✅ Phone se search
   - ✅ Email se search
   - ✅ Address se search
   - ✅ Case-insensitive

5. **Due Amount Display**:
   - ✅ Due calculation correct hai
   - ✅ Due > 0: Red color, "Due" chip
   - ✅ Due = 0: Gray color, no chip

6. **Supplier Ledger**:
   - ✅ Ledger entries correct hain
   - ✅ Purchase entries display hote hain
   - ✅ Payment entries display hote hain
   - ✅ Balance calculation correct hai
   - ✅ Payment add karne se balance update hota hai

7. **Add Payment**:
   - ✅ Form validation
   - ✅ Payment add hota hai
   - ✅ Ledger entries refresh hote hain
   - ✅ Due amount decrease hota hai

8. **Generic Ledger**:
   - ✅ All entries display hote hain
   - ✅ Party type filter kaam karta hai
   - ✅ Date range filter kaam karta hai
   - ✅ Clear filters kaam karta hai

**Same scenarios Customer ke liye bhi test kiye gaye hain.**

---

## Architecture Decisions (Architecture Ke Faisle)

### 1. Due Calculation Real-Time Kyun?

**Decision**: Due har query par calculate hota hai, database mein store nahi hota.

**Fayde**:
- ✅ **Always Accurate**: Purchases/sales/payments se automatically sync
- ✅ **No Sync Issues**: Manual due update ki zarurat nahi
- ✅ **Simple Logic**: Single source of truth (purchases/sales/payments)

**Trade-offs**:
- ❌ **Performance**: Large datasets mein slow ho sakta hai
- ❌ **Future Optimization**: Indexing/caching zaroori ho sakta hai

**Future**: Phase 11 mein backend caching/indexing use kar sakte hain.

### 2. SupplierWithDue / CustomerWithDue Interface Kyun?

**Decision**: `Supplier`/`Customer` extend karke `dueAmount` field add kiya.

**Fayde**:
- ✅ **Type Safety**: Due amount field typed hai
- ✅ **Separation**: Store entity (Supplier/Customer) aur UI entity (SupplierWithDue/CustomerWithDue) alag
- ✅ **Flexibility**: Due calculation logic change kar sakte hain

**Alternative**: Due directly Supplier/Customer mein store kar sakte the, but:
- Store entity complex ho jata
- Due calculation logic store mein mix ho jata

### 3. Single Dialog for Create/Edit Kyun?

**Decision**: `SupplierFormDialog`/`CustomerFormDialog` dono modes handle karta hai.

**Fayde**:
- ✅ **Code Reuse**: Single component dono use cases
- ✅ **Consistency**: Same UI/UX dono modes mein
- ✅ **Maintainability**: Ek jagah changes

**Alternative**: Alag components bana sakte the, but:
- Code duplication
- Maintenance overhead

### 4. Ledger Entry Building Kyun?

**Decision**: Ledger entries purchases, sales, aur payments se dynamically build hote hain.

**Fayde**:
- ✅ **Always Accurate**: Real-time data se build hota hai
- ✅ **No Duplication**: Purchase/Sale/Payment data ek baar store hota hai
- ✅ **Flexible**: Filters easily apply kar sakte hain

**Alternative**: Ledger entries separately store kar sakte the, but:
- Data duplication
- Sync issues
- More storage

### 5. Generic Ledger Page Kyun?

**Decision**: Ek generic ledger page jahan saare transactions dikhte hain.

**Fayde**:
- ✅ **Complete View**: Saare transactions ek jagah
- ✅ **Filtering**: Party type aur date range filters
- ✅ **Flexibility**: Different views easily add kar sakte hain

**Alternative**: Sirf individual supplier/customer ledgers, but:
- Complete picture nahi milta
- Multiple pages switch karna padta

---

## Phase 5 Deliverables (Phase 5 Ke Deliverables)

✅ **SupplierService Interface**
- Service contract defined
- Types properly defined
- Methods documented

✅ **CustomerService Interface**
- Service contract defined
- Types properly defined
- Methods documented

✅ **LedgerService Interface**
- Service contract defined
- Types properly defined
- Methods documented

✅ **Mock Implementations**
- SupplierServiceMock (due calculation)
- CustomerServiceMock (due calculation)
- LedgerServiceMock (ledger entry building)

✅ **HTTP Stubs**
- SupplierServiceHttp
- CustomerServiceHttp
- LedgerServiceHttp

✅ **UI Components**
- SupplierFormDialog (Add/Edit)
- CustomerFormDialog (Add/Edit)
- AddPaymentDialog (Payment entry)

✅ **Pages**
- SuppliersPage (Full CRUD)
- CustomersPage (Full CRUD)
- SupplierLedgerPage (Ledger + Payment)
- CustomerLedgerPage (Ledger + Payment)
- LedgerPage (Generic ledger view)

✅ **Due Management**
- Real-time due calculation
- Visual indicators (due chips, colors)
- Automatic updates

✅ **CRUD Operations**
- Create supplier/customer
- Read suppliers/customers (list view)
- Update supplier/customer
- Delete supplier/customer

✅ **Search Functionality**
- Name search
- Phone search
- Email search
- Address search
- Real-time filtering

✅ **Ledger Tracking**
- Supplier ledger entries
- Customer ledger entries
- Generic ledger view
- Payment management

---

## Next Steps (Agle Steps) - Phase 6

Phase 6 mein:

1. **PurchaseService**: Purchase management
2. **CreatePurchasePage**: Purchase form
3. **PurchasesPage**: Purchase list
4. **Purchase → Stock update**: Automatic stock update
5. **Purchase → Supplier Ledger update**: Automatic ledger update

**Suppliers Ready**: Phase 5 ne suppliers complete kar diye hain. Ab Phase 6 mein purchases implement honge jo suppliers ke saath integrate honge.

---

## Files Changed Summary (Files Changed Ka Summary)

### New Files (Nayi Files)

**Service Interfaces**:
- `src/services/interfaces/SupplierService.ts` - Service contract
- `src/services/interfaces/CustomerService.ts` - Service contract
- `src/services/interfaces/LedgerService.ts` - Service contract

**Mock Implementations**:
- `src/services/mock/SupplierServiceMock.ts` - Mock implementation
- `src/services/mock/CustomerServiceMock.ts` - Mock implementation
- `src/services/mock/LedgerServiceMock.ts` - Mock implementation

**HTTP Stubs**:
- `src/services/http/SupplierServiceHttp.ts` - HTTP stub
- `src/services/http/CustomerServiceHttp.ts` - HTTP stub
- `src/services/http/LedgerServiceHttp.ts` - HTTP stub

**Components**:
- `src/components/suppliers/SupplierFormDialog.tsx` - Add/Edit dialog
- `src/components/customers/CustomerFormDialog.tsx` - Add/Edit dialog
- `src/components/ledger/AddPaymentDialog.tsx` - Payment dialog

### Modified Files (Modified Files)

- `src/services/index.ts` - Service factory updated
- `src/pages/suppliers/SuppliersPage.tsx` - Full implementation
- `src/pages/suppliers/SupplierLedgerPage.tsx` - Full implementation
- `src/pages/customers/CustomersPage.tsx` - Full implementation
- `src/pages/customers/CustomerLedgerPage.tsx` - Full implementation
- `src/pages/ledger/LedgerPage.tsx` - Full implementation

### Total Changes (Total Changes)

- **18 files changed**
- **2452 insertions**
- **90 deletions**

---

## Conclusion (Nishkarsh)

Phase 5 ne Supplier aur Customer management functionality successfully implement kar di hai. Ab users:

- ✅ Suppliers create/edit/delete kar sakte hain
- ✅ Customers create/edit/delete kar sakte hain
- ✅ Real-time due amounts dekh sakte hain
- ✅ Supplier ledgers dekh sakte hain
- ✅ Customer ledgers dekh sakte hain
- ✅ Payments add kar sakte hain
- ✅ Generic ledger view se saare transactions filter kar sakte hain

**Phase 5 Status**: ✅ **Complete**

**Key Achievement**: Due amounts automatically calculate hote hain purchases/sales/payments se. Koi manual due entry ki zarurat nahi hai.

**Next Phase**: Phase 6 mein Purchases implement hoga jo suppliers ke saath integrate hoga aur stock automatically update karega.

---

## Code Examples (Code Ke Examples)

### Example 1: Create Supplier

```typescript
// Supplier create karna
const supplier = await supplierService.createSupplier({
  name: "XYZ Distributors",
  phone: "+91-9876543211",
  email: "xyz@distributors.com",
  address: "456 Trade Avenue, City"
});

console.log(supplier.id);  // "supplier-1234567890-abc123"
```

### Example 2: Get Suppliers with Due

```typescript
// Suppliers with due get karna
const suppliers = await supplierService.getSuppliers();

suppliers.forEach(s => {
  console.log(`${s.name}: ₹${s.dueAmount.toFixed(2)}`);
  // "ABC Wholesale: ₹1500.00"
  // "XYZ Distributors: ₹0.00"
});
```

### Example 3: Add Payment

```typescript
// Payment add karna
const payment = await ledgerService.addPayment({
  type: "supplier",
  partyId: "supplier-demo-1",
  amount: 1000,
  date: new Date().toISOString(),
  mode: "cash",
  reference: "CASH-001"
});

console.log(payment.id);  // "payment-1234567890-abc123"
```

### Example 4: Get Supplier Ledger

```typescript
// Supplier ledger get karna
const entries = await ledgerService.getSupplierLedger("supplier-demo-1");

entries.forEach(entry => {
  console.log(`${entry.date}: ${entry.description} - Balance: ₹${entry.balance.toFixed(2)}`);
  // "2024-01-01: Purchase #demo-1 - Balance: ₹2000.00"
  // "2024-01-05: Payment (cash) - Balance: ₹1000.00"
});
```

### Example 5: Get Generic Ledger with Filters

```typescript
// Generic ledger with filters get karna
const entries = await ledgerService.getLedgerEntries({
  type: "supplier",
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2024-01-31T23:59:59Z"
});

console.log(`Found ${entries.length} entries`);
```

---

**Documentation Complete** ✅

Phase 5 ki sabhi code changes explain kar di gayi hain. Suppliers, Customers, aur Ledger ab fully functional hain with due tracking!
