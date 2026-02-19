# Phase 9: Dashboard - Code Changes Documentation (Detail)

Is document mein Phase 9 ke saare code changes ki detail mein explanation hai: kya add/change hua, kyun, aur kaise use hota hai.

---

## 1. DashboardService Interface (`src/services/interfaces/DashboardService.ts`)

### Purpose (Uddeshya)
Dashboard ke liye contract define karta hai: kis type ka data return hoga aur kaun sa method expose hoga. Koi bhi implementation (Mock ya HTTP) is contract ko follow karegi.

### Types Defined

#### DashboardMetrics
```typescript
export interface DashboardMetrics {
  todaySales: number;           // Aaj ki total sales amount
  totalDue: number;             // Customer due + Supplier due
  customerDue: number;          // Customers se jo paise lene hain
  supplierDue: number;           // Suppliers ko jo paise dene hain
  lowStockProducts: ProductWithStock[];  // Stock < 10 wale products
}
```

- **todaySales**: Sirf aaj ki date wali sales ka total amount. Agar aaj koi sale nahi hai to 0.
- **totalDue**: Customer due + Supplier due. Ek hi number mein total dues.
- **customerDue**: Saare customers ki dueAmount ka sum (CustomerService.getCustomers() se aata hai).
- **supplierDue**: Saare suppliers ki dueAmount ka sum (SupplierService.getSuppliers() se aata hai).
- **lowStockProducts**: ProductWithStock[] — jinke stock 10 se kam hain (ProductService.getProducts() se filter karke).

**ProductWithStock kyun?**  
ProductService interface se import; isme product + stock dono milte hain, isliye low stock list mein name, unit, stock sab use ho sakta hai.

#### DashboardService
```typescript
export interface DashboardService {
  getDashboardMetrics(): Promise<DashboardMetrics>;
}
```

Sirf ek public method: `getDashboardMetrics()`. Dashboard page isi ko call karta hai; andar se today sales, dues, aur low stock sab calculate ho kar ek object mein return hota hai.

---

## 2. DashboardServiceMock (`src/services/mock/DashboardServiceMock.ts`)

### Purpose (Uddeshya)
DashboardService contract ko mock data se implement karta hai. Store directly use nahi karta; existing services (saleService, customerService, supplierService, productService) use karta hai taaki calculation logic duplicate na ho aur tenant/session same rahe.

### Imports
```typescript
import type { DashboardService, DashboardMetrics } from "../interfaces/DashboardService";
import type { ProductWithStock } from "../interfaces/ProductService";
import {
  authService,
  productService,
  customerService,
  supplierService,
  saleService
} from "../index";
```
- Interface aur types interfaces se.
- auth + product/customer/supplier/sale services index se (same instances, session shared).

### Private Helpers

#### getTenantId(): string
- `authService.getSession()` se session leta hai; null ho to `Error("UNAUTHORIZED")` throw.
- Return: `session.tenant.id`.
- Har metric tenant-specific hona chahiye, isliye getDashboardMetrics shuru mein isi ko call karta hai (tenantId variable use ho raha hai getLowStockProducts call mein; baaki services already tenant-aware hain).

#### isToday(dateString: string): boolean
- `dateString` ko `Date` mein convert karke current date se compare karta hai.
- Compare: `getDate()`, `getMonth()`, `getFullYear()` dono dates ke.
- True only jab din, mahina, saal same ho. Isse "today" ki sales filter hoti hain.

#### calculateTodaySales(tenantId: string): Promise<number>
- `saleService.getSales()` se saari sales (already tenant-filtered).
- Filter: `sales.filter((sale) => this.isToday(sale.date))`.
- Reduce: `sum + sale.totalAmount`.
- Return total amount for today; agar koi sale nahi to 0.

#### calculateCustomerDue(): Promise<number>
- `customerService.getCustomers()` se customers (har customer pe dueAmount already calculated).
- `customers.reduce((sum, customer) => sum + customer.dueAmount, 0)`.
- Return total customer due.

#### calculateSupplierDue(): Promise<number>
- `supplierService.getSuppliers()` se suppliers (har supplier pe dueAmount already calculated).
- `suppliers.reduce((sum, supplier) => sum + supplier.dueAmount, 0)`.
- Return total supplier due.

#### getLowStockProducts(tenantId: string): Promise<ProductWithStock[]>
- `productService.getProducts()` se saare products (with stock).
- Filter: `products.filter((product) => product.stock < 10)`.
- Return array of ProductWithStock. Threshold 10 same hai jo ProductStockView mein "low stock" ke liye use hota hai.

### getDashboardMetrics(): Promise<DashboardMetrics>
- `getTenantId()` call karke tenant ensure karta hai.
- Saari calculations **parallel** run karta hai:
  - `this.calculateTodaySales(tenantId)`
  - `this.calculateCustomerDue()`
  - `this.calculateSupplierDue()`
  - `this.getLowStockProducts(tenantId)`
- `Promise.all([...])` se ek saath wait karta hai.
- `totalDue = customerDue + supplierDue`.
- Return object: `{ todaySales, totalDue, customerDue, supplierDue, lowStockProducts }`.

Yahi method DashboardPage call karta hai; isi se "real-time" metrics milte hain (har load par fresh calculation).

---

## 3. DashboardServiceHttp (`src/services/http/DashboardServiceHttp.ts`)

### Purpose (Uddeshya)
Phase 11 ke liye stub. Abhi implementation nahi hai; sirf interface implement kiya hai taaki service factory (index) mock/http switch kar sake bina type error ke.

### Code
```typescript
export class DashboardServiceHttp implements DashboardService {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    throw new Error("DashboardServiceHttp not implemented yet. Phase 11: Backend Integration");
  }
}
```
- Phase 11 mein yahan se API call (e.g. GET /api/dashboard/metrics) add karenge; UI same rahegi.

---

## 4. Service Factory – index.ts (`src/services/index.ts`)

### Changes
1. **Imports add kiye**:
   - `import type { DashboardService } from "./interfaces/DashboardService";`
   - `import { DashboardServiceMock } from "./mock/DashboardServiceMock";`
   - `import { DashboardServiceHttp } from "./http/DashboardServiceHttp";`

2. **Export**:
   - `export const dashboardService: DashboardService = dataMode === "mock" ? new DashboardServiceMock() : new DashboardServiceHttp();`

3. **Type re-exports**:
   - `export type { DashboardService, DashboardMetrics } from "./interfaces/DashboardService";`

Dashboard page sirf `dashboardService` aur `DashboardMetrics` type import karta hai; mock vs http switch yahi se hota hai.

---

## 5. DashboardPage (`src/pages/dashboard/DashboardPage.tsx`)

### Purpose (Uddeshya)
Main dashboard UI: metrics dikhana, loading/error handle karna, aur relevant pages tak navigate karna. Koi business logic nahi; sirf service call aur display.

### State
- `metrics: DashboardMetrics | null` — dashboard data.
- `loading: boolean` — initial load / refresh.
- `error: string | null` — service error message.

### Data Loading
- `loadMetrics = useCallback(async () => { ... }, [])`:
  - setLoading(true), setError(null).
  - `dashboardService.getDashboardMetrics()` call.
  - Success: setMetrics(data).
  - Catch: setError(message).
  - Finally: setLoading(false).
- `useEffect(() => { loadMetrics(); }, [loadMetrics]);` — mount par ek baar load.

### Early Returns (UI States)
1. **Loading**: Card with "Loading dashboard...".
2. **Error**: Card with `<Alert severity="error">{error}</Alert>`.
3. **!metrics**: return null (safety).

### Main Layout
- Page title: "Dashboard" (Typography h5, bold).
- **Grid**: `container spacing={3}`. Cards ke liye:
  - Today Sales: `xs={12} sm={6} md={4}`
  - Total Due: same
  - Low Stock Alerts: same
  - Low stock list (agar length > 0): `xs={12}` full width.
  - Empty state (low stock 0): `xs={12}` full width.

### Card 1: Today Sales
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`, color white.
- Icon: TrendingUpIcon.
- Text: "Today Sales", `₹{metrics.todaySales.toFixed(2)}`, "Total sales for today".
- onClick: `navigate("/sales")`.
- Hover: `transform: translateY(-4px)`.

### Card 2: Total Due
- Gradient: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`.
- Icon: AccountBalanceIcon.
- Text: "Total Due", `₹{metrics.totalDue.toFixed(2)}`, "Customer Due: ₹...", "Supplier Due: ₹...".
- onClick: `navigate("/ledger")`.
- Same hover effect.

### Card 3: Low Stock Alerts
- Gradient: `linear-gradient(135deg, #fa709a 0%, #fee140 100%)`.
- Icon: WarningIcon.
- Text: "Low Stock Alerts", `{metrics.lowStockProducts.length}`, "Products with stock < 10".
- onClick: `navigate("/products")`.
- Same hover effect.

### Low Stock Products List (when lowStockProducts.length > 0)
- Card with header: InventoryIcon, "Low Stock Products", Chip with count.
- Paper > List: har product ke liye ListItem:
  - Primary: product name + optional SKU Chip.
  - Secondary: "Stock: X unit", aur agar stock === 0 to "Out of Stock" (error Chip), agar 0 < stock < 10 to "Low Stock" (warning Chip).
  - ListItem onClick: `navigate("/products")`.
  - Items ke beech Divider.

### Empty State (when lowStockProducts.length === 0)
- Card: "Stock Status", success Alert: "All products have sufficient stock!".

### Summary of Behaviour
- Sirf ek service call: `dashboardService.getDashboardMetrics()`.
- No direct store/API; no library version change.
- Metrics real-time in the sense ki har baar dashboard open/load par fresh calculations (today sales, dues, low stock) service se aate hain.

---

## 6. File Summary

| File | Change |
|------|--------|
| `src/services/interfaces/DashboardService.ts` | **NEW** – DashboardMetrics + DashboardService interface |
| `src/services/mock/DashboardServiceMock.ts` | **NEW** – Mock implementation with today sales, dues, low stock |
| `src/services/http/DashboardServiceHttp.ts` | **NEW** – Stub for Phase 11 |
| `src/services/index.ts` | **MODIFIED** – dashboardService + type exports |
| `src/pages/dashboard/DashboardPage.tsx` | **REPLACED** – Placeholder se full dashboard UI |

---

## 7. Data Flow (Short)

1. User opens `/` → DashboardPage mount → loadMetrics() → dashboardService.getDashboardMetrics().
2. Mock: DashboardServiceMock getDashboardMetrics() → getTenantId(), then Promise.all([calculateTodaySales, calculateCustomerDue, calculateSupplierDue, getLowStockProducts]) → return DashboardMetrics.
3. Page setMetrics(data) → re-render → cards + low stock list / empty state dikhte hain.
4. Card/list click → navigate to /sales, /ledger, or /products.

Is tarah Phase 9 ke saare code changes detail mein cover ho jaate hain. Checklist ke liye `docs/phase9/PHASE9_DELIVERABLES_CHECKLIST.md` use karo.
