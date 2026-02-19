# HISAAB-KHATA FRONTEND - COMPREHENSIVE MIND MAP

> **Purpose**: This mind map visualizes the complete architecture, structure, and development phases for the Hisaab-Khata frontend project based on the contract document.

---

## 📋 TABLE OF CONTENTS

1. [Project Core Principles](#1-project-core-principles)
2. [Tech Stack](#2-tech-stack-locked)
3. [Architecture Pattern](#3-architecture-pattern-non-negotiable)
4. [Data Mode Switch](#4-data-mode-switch)
5. [Complete Screen & Route Mapping](#5-complete-screen--route-mapping)
6. [Service Layer Architecture](#6-service-layer-architecture)
7. [Mock Data Strategy](#7-mock-data-strategy)
8. [Folder Structure](#8-folder-structure-contract)
9. [Development Phases](#9-development-phases-sequential)
10. [Absolute Rules](#10-absolute-rules-non-negotiable)
11. [Current State Analysis](#11-current-state-analysis)
12. [Data Flow Diagram](#12-data-flow-diagram)

---

## 1. PROJECT CORE PRINCIPLES

### Core Philosophy
- ✅ **UI-First Development** - Build complete UI before backend integration
- ✅ **Mock-First** - No backend initially, all functionality with mock data
- ✅ **All Screens Fully Functional** - Every screen works with mock data
- ✅ **Backend APIs Integrated Only After UI Completion**
- ✅ **Zero UI Rewrite During Backend Integration** - Only services change
- ✅ **Single-Tenant Context** - Shop data isolation
- ✅ **Tenant Self-Onboarding** - Shops register via Register screen

### Key Benefits
- Faster UI development without waiting for backend
- Complete user experience testing before integration
- Clean separation of concerns
- Easy backend swapping without UI changes

---

## 2. TECH STACK (LOCKED)

### Runtime
- **Node.js**: `20.11.1` (enforced via `.nvmrc`)
- **npm**: `>= 9` (enforced via `package.json` engines)

### Frontend Core
- **React**: `18.3.1`
- **TypeScript**: `5.5.4`
- **Vite**: `5.4.10`
- **React Router**: `6.26.2`

### UI Framework
- **MUI (Material-UI)**: `5.15.20`
- **@mui/icons-material**: `5.15.20`

### HTTP Client (Later)
- **Axios**: `1.7.7`

### Linting
- **ESLint**: `9.9.0`
- **@typescript-eslint**: Latest compatible versions

### Version Enforcement
- ✅ `.nvmrc` file → `20.11.1`
- ✅ `package-lock.json` committed
- ✅ `package.json` engines field: `"node": ">=18.18 <=22.x", "npm": ">=9"`

---

## 3. ARCHITECTURE PATTERN (NON-NEGOTIABLE)

### Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                             │
│         (Pages + Components - Dumb/Presentational)      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Service Interface                          │
│              (Contract/Abstraction)                      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  Mock Service    │    │  HTTP Service    │
│  (In-Memory)     │    │  (Axios)         │
└──────────────────┘    └──────────────────┘
```

### ❌ FORBIDDEN Patterns
- **UI components calling axios directly**
- **UI knowing mock vs backend**
- **MSW as primary mock mechanism**

### ✅ MANDATORY Pattern
- **UI → Service Interface → Implementation (Mock / HTTP)**
- **Business logic stays in services/store**
- **Components remain dumb**

### Service Factory Pattern
```typescript
// src/services/index.ts
const dataMode = import.meta.env.VITE_DATA_MODE || 'mock';

export const authService = dataMode === 'mock' 
  ? new AuthServiceMock() 
  : new AuthServiceHttp();
```

---

## 4. DATA MODE SWITCH

### Environment Variable
```bash
VITE_DATA_MODE=mock | http
```

### Modes
- **`mock`** → UI Development (In-Memory Store)
- **`http`** → Backend Integration (Axios Calls)

### Critical Requirement
⚠️ **Switching modes MUST require ZERO UI change**

The UI layer should be completely agnostic to whether it's using mock or HTTP services.

---

## 5. COMPLETE SCREEN & ROUTE MAPPING

### 5.1 Authentication

| Route | Screen | Page File |
|-------|--------|-----------|
| `/login` | Login | `pages/auth/LoginPage.tsx` |
| `/register` | Register (Shop Onboarding) | `pages/auth/RegisterPage.tsx` |

### 5.2 Dashboard

| Route | Screen | Page File |
|-------|--------|-----------|
| `/` | Dashboard (Today sales, Total due, Low stock) | `pages/dashboard/DashboardPage.tsx` |

### 5.3 Products / Items

| Route | Screen | Component File |
|-------|--------|----------------|
| `/products` | Product List | `pages/products/ProductsPage.tsx` |
| `/products` | Add Product (dialog) | `components/products/ProductFormDialog.tsx` |
| `/products` | Edit Product (dialog) | `components/products/ProductFormDialog.tsx` |
| `/products` | Product Stock View | `components/products/ProductStockView.tsx` |

### 5.4 Suppliers

| Route | Screen | Page/Component File |
|-------|--------|---------------------|
| `/suppliers` | Supplier List | `pages/suppliers/SuppliersPage.tsx` |
| `/suppliers` | Add / Edit Supplier (dialog) | `components/suppliers/SupplierFormDialog.tsx` |
| `/suppliers/:id` | Supplier Ledger | `pages/suppliers/SupplierLedgerPage.tsx` |
| `/suppliers/:id` | Add Supplier Payment (dialog) | `components/ledger/AddPaymentDialog.tsx` |

### 5.5 Customers

| Route | Screen | Page/Component File |
|-------|--------|---------------------|
| `/customers` | Customer List | `pages/customers/CustomersPage.tsx` |
| `/customers` | Add / Edit Customer (dialog) | `components/customers/CustomerFormDialog.tsx` |
| `/customers/:id` | Customer Ledger | `pages/customers/CustomerLedgerPage.tsx` |
| `/customers/:id` | Add Customer Payment (dialog) | `components/ledger/AddPaymentDialog.tsx` |

### 5.6 Ledger (Generic)

| Route | Screen | Page File |
|-------|--------|-----------|
| `/ledger` | Ledger (Credit/Debit + Filters) | `pages/ledger/LedgerPage.tsx` |
| | Supports customer ledger and supplier ledger | |

### 5.7 Purchases

| Route | Screen | Page File |
|-------|--------|-----------|
| `/purchases/new` | Create Purchase | `pages/purchases/CreatePurchasePage.tsx` |
| `/purchases` | Purchase List | `pages/purchases/PurchasesPage.tsx` |

### 5.8 Sales

| Route | Screen | Page File |
|-------|--------|-----------|
| `/sales/new` | Create Sale | `pages/sales/CreateSalePage.tsx` |
| `/sales` | Sales List | `pages/sales/SalesPage.tsx` |

### 5.9 Staff

| Route | Screen | Page/Component File |
|-------|--------|---------------------|
| `/staff` | Staff List | `pages/staff/StaffPage.tsx` |
| `/staff` | Add / Edit Staff (dialog) | `components/staff/StaffFormDialog.tsx` |

---

## 6. SERVICE LAYER ARCHITECTURE

### Folder Structure

```
src/services/
├── interfaces/          # Service Contracts (TypeScript Interfaces)
│   ├── AuthService.ts
│   ├── ProductService.ts
│   ├── SupplierService.ts
│   ├── CustomerService.ts
│   ├── PurchaseService.ts
│   ├── SaleService.ts
│   ├── LedgerService.ts
│   ├── StaffService.ts
│   └── DashboardService.ts
│
├── mock/                # Mock Implementations (In-Memory)
│   ├── AuthServiceMock.ts
│   ├── ProductServiceMock.ts
│   ├── SupplierServiceMock.ts
│   ├── CustomerServiceMock.ts
│   ├── PurchaseServiceMock.ts
│   ├── SaleServiceMock.ts
│   ├── LedgerServiceMock.ts
│   ├── StaffServiceMock.ts
│   ├── DashboardServiceMock.ts
│   └── store.ts          # Shared In-Memory Domain Store
│
├── http/                 # HTTP Implementations (Later)
│   ├── AuthServiceHttp.ts
│   ├── ProductServiceHttp.ts
│   ├── SupplierServiceHttp.ts
│   ├── CustomerServiceHttp.ts
│   ├── PurchaseServiceHttp.ts
│   ├── SaleServiceHttp.ts
│   ├── LedgerServiceHttp.ts
│   ├── StaffServiceHttp.ts
│   └── DashboardServiceHttp.ts
│
└── index.ts              # Service Factory (Mode Switch)
```

### Service Interface Example

```typescript
// src/services/interfaces/AuthService.ts
export interface AuthService {
  login(credentials: LoginCredentials): Promise<Session>;
  register(request: RegisterRequest): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Session | null;
}
```

### AuthService Required Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `login` | `credentials` | `Promise<Session>` | Authenticate user |
| `register` | `onboardingRequest` | `Promise<Session>` | Creates tenant + owner user |
| `logout` | - | `Promise<void>` | Clear session |
| `getSession` | - | `Session \| null` | Get current session |

### Service Factory Pattern

```typescript
// src/services/index.ts
import { AuthService } from './interfaces/AuthService';
import { AuthServiceMock } from './mock/AuthServiceMock';
import { AuthServiceHttp } from './http/AuthServiceHttp';

const dataMode = import.meta.env.VITE_DATA_MODE || 'mock';

export const authService: AuthService = dataMode === 'mock'
  ? new AuthServiceMock()
  : new AuthServiceHttp();

// Export all services...
```

---

## 7. MOCK DATA STRATEGY

### In-Memory Domain Store
- **Shared mutable state** across all services
- **CRUD operations affect all screens** immediately
- **Ledger, stock, dues auto-calculated** from transactions
- **Tenant-aware**: Users see only their shop data

### Seed Data Requirements
- ✅ At least **one demo tenant + demo user**
- ✅ Allow **creating new tenants via Register**
- ✅ Realistic sample data for testing

### Mock Layer Behavior
The mock layer must behave like a real backend:
- ✅ **Validation** (required fields, data types, business rules)
- ✅ **Errors** (404, 400, 500 responses)
- ✅ **ID Generation** (unique IDs for entities)
- ✅ **Data Consistency** (referential integrity)

### Store Structure (Conceptual)

```typescript
// src/services/mock/store.ts
interface MockStore {
  tenants: Tenant[];
  users: User[];
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  purchases: Purchase[];
  sales: Sale[];
  payments: Payment[];
  staff: Staff[];
  
  // Helper methods
  getCurrentTenant(): Tenant | null;
  getProductsByTenant(tenantId: string): Product[];
  // ... etc
}
```

---

## 8. FOLDER STRUCTURE (CONTRACT)

### Complete Structure

```
src/
├── api/                    # Axios Client Setup
│   ├── apiClient.ts        # Axios instance with interceptors
│   └── index.ts            # API exports
│
├── services/               # Service Layer (Core Architecture)
│   ├── interfaces/         # Service Contracts
│   ├── mock/               # Mock Implementations
│   ├── http/               # HTTP Implementations
│   └── index.ts            # Service Factory
│
├── store/                  # Global State (If Needed)
│   └── (Redux/Zustand/etc if required)
│
├── components/             # Reusable Components
│   ├── products/
│   │   ├── ProductFormDialog.tsx
│   │   └── ProductStockView.tsx
│   ├── suppliers/
│   │   └── SupplierFormDialog.tsx
│   ├── customers/
│   │   └── CustomerFormDialog.tsx
│   ├── ledger/
│   │   └── AddPaymentDialog.tsx
│   └── staff/
│       └── StaffFormDialog.tsx
│
├── pages/                  # Page Components (Route Handlers)
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── products/
│   │   └── ProductsPage.tsx
│   ├── suppliers/
│   │   ├── SuppliersPage.tsx
│   │   └── SupplierLedgerPage.tsx
│   ├── customers/
│   │   ├── CustomersPage.tsx
│   │   └── CustomerLedgerPage.tsx
│   ├── ledger/
│   │   └── LedgerPage.tsx
│   ├── purchases/
│   │   ├── CreatePurchasePage.tsx
│   │   └── PurchasesPage.tsx
│   ├── sales/
│   │   ├── CreateSalePage.tsx
│   │   └── SalesPage.tsx
│   └── staff/
│       └── StaffPage.tsx
│
├── layouts/                # Layout Components
│   └── AppLayout.tsx       # Main app layout with navigation
│
├── routes/                 # Route Configuration (Optional)
│   └── routes.ts           # Centralized route definitions
│
├── theme/                  # MUI Theme Configuration
│   └── theme.ts            # Theme customization
│
├── utils/                  # Utility Functions
│   ├── formatters.ts       # Date, currency formatters
│   ├── validators.ts       # Form validation helpers
│   └── constants.ts        # App constants
│
├── App.tsx                 # Root Component
└── main.tsx                # Entry Point
```

---

## 9. DEVELOPMENT PHASES (SEQUENTIAL)

### ⚠️ Critical Rule
**Every phase must end with a runnable app.**

### Phase 1: Foundation ✅ (Partially Complete)
**Goal**: Basic project structure and navigation

**Tasks**:
- ✅ Routing setup (React Router)
- ✅ Layout components (AppLayout)
- ✅ Common components (if any)
- ✅ Theme configuration (MUI theme)
- ✅ Navigation structure (sidebar/menu)
- ⚠️ Complete navigation menu (add all routes)

**Deliverable**: App runs, navigation works, theme applied

---

### Phase 2: Auth + Onboarding (Mock)
**Goal**: User authentication and tenant registration

**Tasks**:
- Login Page (UI complete)
- Register Page (Tenant Onboarding)
- AuthService (Mock implementation)
- Session management (localStorage/token)
- Protected routes (RequireAuth wrapper)
- Tenant creation on registration

**Deliverable**: Users can register new shops and login

---

### Phase 3: Mock Data Layer
**Goal**: In-memory data store with tenant isolation

**Tasks**:
- In-memory domain store (`store.ts`)
- Tenant-aware data isolation
- Seed data (demo tenant + user)
- Service factory (mode switch)
- Data persistence simulation (localStorage backup)

**Deliverable**: Mock store ready, seed data loaded

---

### Phase 4: Products + Stock
**Goal**: Product management with stock tracking

**Tasks**:
- ProductService (Mock)
- ProductsPage (List view)
- ProductFormDialog (Add/Edit)
- ProductStockView component
- Stock calculations (auto-update on purchase/sale)
- Product CRUD operations

**Deliverable**: Full product management functional

---

### Phase 5: Suppliers + Customers + Ledger
**Goal**: Party management and ledger tracking

**Tasks**:
- SupplierService (Mock)
- CustomerService (Mock)
- LedgerService (Mock)
- SuppliersPage + SupplierLedgerPage
- CustomersPage + CustomerLedgerPage
- LedgerPage (Generic ledger view)
- AddPaymentDialog component
- Due calculations (auto-calculated)

**Deliverable**: Complete party and ledger management

---

### Phase 6: Purchases
**Goal**: Purchase order creation and management

**Tasks**:
- PurchaseService (Mock)
- CreatePurchasePage (Purchase form)
- PurchasesPage (Purchase list)
- Purchase → Stock update (automatic)
- Purchase → Supplier Ledger update (automatic)
- Purchase validation

**Deliverable**: Purchase flow complete with stock/ledger updates

---

### Phase 7: Sales
**Goal**: Sales order creation and management

**Tasks**:
- SaleService (Mock)
- CreateSalePage (Sale form)
- SalesPage (Sales list)
- Sale → Stock update (automatic)
- Sale → Customer Ledger update (automatic)
- Sale validation

**Deliverable**: Sales flow complete with stock/ledger updates

---

### Phase 8: Staff + Roles
**Goal**: Staff management and role assignment

**Tasks**:
- StaffService (Mock)
- StaffPage (Staff list)
- StaffFormDialog (Add/Edit)
- Role management (if needed)
- Permission system (if needed)

**Deliverable**: Staff management functional

---

### Phase 9: Dashboard
**Goal**: Overview dashboard with key metrics

**Tasks**:
- DashboardService (Mock)
- DashboardPage (Main dashboard)
- Today Sales calculation
- Total Due calculation (customers + suppliers)
- Low Stock alerts
- Charts/visualizations (optional)

**Deliverable**: Dashboard shows real-time metrics

---

### Phase 10: UI Polish
**Goal**: Production-ready UI/UX

**Tasks**:
- Responsive design (mobile/tablet/desktop)
- Loading states (skeletons, spinners)
- Error handling (error boundaries, toast notifications)
- Form validation (client-side)
- User feedback (success messages, confirmations)
- Accessibility improvements
- Performance optimization

**Deliverable**: Polished, production-ready UI

---

### Phase 11: Backend Integration
**Goal**: Connect to real backend APIs

**Tasks**:
- HTTP Service implementations (all services)
- Service factory update (mode switch)
- Environment configuration (.env)
- API error handling
- Token refresh handling
- **Zero UI changes** (only service implementations)

**Deliverable**: App works with real backend, UI unchanged

---

## 10. ABSOLUTE RULES (NON-NEGOTIABLE)

### ✅ Mandatory Rules
1. **UI Never Rewritten During Backend Integration**
   - Only service implementations change
   - UI components remain untouched

2. **Business Logic Stays in Services/Store**
   - No business logic in components
   - Components are presentational only

3. **Components Remain Dumb**
   - Components receive props, emit events
   - No direct API calls from components

4. **Contract Overrides Convenience**
   - Follow contract even if inconvenient
   - Consistency over shortcuts

5. **Single Source of Truth**
   - This contract document is the authority
   - No assumptions outside contract

6. **No Assumptions Outside Contract**
   - If not in contract, don't assume
   - Ask/clarify before implementing

7. **Version Enforcement**
   - `.nvmrc` file must exist
   - `package-lock.json` must be committed
   - `package.json` engines field enforced

---

## 11. CURRENT STATE ANALYSIS

### ✅ Completed
- Basic project setup (Vite + React + TS + MUI)
- AppLayout with navigation drawer
- LoginPage (basic structure)
- DashboardPage (placeholder)
- ProductsPage (placeholder)
- Basic routing setup
- API client setup (axios)
- Theme setup (basic)

### ❌ Missing / Incomplete
- RegisterPage (not created)
- Service layer (interfaces + mock + http)
- In-memory store
- All other pages:
  - Suppliers pages
  - Customers pages
  - Ledger page
  - Purchases pages
  - Sales pages
  - Staff page
- All dialog components:
  - ProductFormDialog
  - SupplierFormDialog
  - CustomerFormDialog
  - AddPaymentDialog
  - StaffFormDialog
- Complete navigation menu (only Dashboard + Products)
- Theme customization (enhanced)
- Environment variable for data mode (`VITE_DATA_MODE`)
- Service factory pattern
- Mock implementations

---

## 12. DATA FLOW DIAGRAM

### Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      User Action                             │
│              (Click, Form Submit, Navigation)                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Component (UI Layer)                     │
│              (Pages, Dialogs, Forms - Dumb)                 │
│                                                              │
│  Example: ProductsPage calls productService.getAll()        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Interface                          │
│              (TypeScript Interface/Contract)                │
│                                                              │
│  Example: ProductService.getAll(): Promise<Product[]>      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Factory                            │
│              (Mode Switch Based on Env)                     │
│                                                              │
│  const mode = import.meta.env.VITE_DATA_MODE || 'mock';    │
│  return mode === 'mock' ? MockService : HttpService;       │
└───────────────────────────┬─────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│   Mock Service       │      │   HTTP Service       │
│   (In-Memory)        │      │   (Axios)            │
│                      │      │                      │
│  - Reads from store  │      │  - GET /api/products │
│  - Updates store     │      │  - POST /api/products│
│  - Auto-calculates   │      │  - Error handling    │
└──────────┬───────────┘      └──────────┬───────────┘
           │                              │
           └──────────────┬───────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Store / Backend API                       │
│                                                              │
│  Mock: In-Memory JavaScript Objects                         │
│  HTTP: REST API Endpoints                                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    UI Updates                               │
│              (State Change, Re-render)                      │
│                                                              │
│  Component receives data → Updates UI                       │
└─────────────────────────────────────────────────────────────┘
```

### Example: Creating a Product

```
User fills ProductFormDialog
    ↓
Dialog calls productService.create(productData)
    ↓
Service Factory returns ProductServiceMock (in mock mode)
    ↓
ProductServiceMock.create() adds to store.products[]
    ↓
Store updates → Stock calculated → All screens reflect change
    ↓
UI updates → Product appears in ProductsPage list
```

---

## 📝 NOTES

### Development Workflow
1. **Read this mind map** before starting any phase
2. **Follow the contract** strictly
3. **Complete each phase** before moving to next
4. **Test thoroughly** at end of each phase
5. **Document any deviations** (should be minimal)

### Key Principles to Remember
- 🎯 **UI-First**: Build UI completely before backend
- 🎭 **Mock-First**: Use mock data for all development
- 🔄 **Zero Rewrite**: UI never changes during integration
- 🏗️ **Service Layer**: All business logic in services
- 🧩 **Dumb Components**: Components are presentational only
- 📋 **Contract First**: This document is the single source of truth

---

## 🔗 RELATED DOCUMENTS

- **Contract Document**: `HISAAB-KHATA FRONTEND CONTRACT (FINAL v2)`
- **README**: `README.md` (Setup instructions)
- **Package.json**: `package.json` (Dependencies)

---

**Last Updated**: Based on Contract v2  
**Status**: Reference Document for Phase-wise Development
