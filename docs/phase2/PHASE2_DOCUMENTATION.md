# Phase 2: Auth + Onboarding (Mock) - Complete Documentation

## Overview

Phase 2 implements user authentication and tenant onboarding functionality using a mock data layer. This phase establishes the service layer architecture pattern that will be used throughout the application, ensuring clean separation between UI and business logic.

**Goal**: Users can register new shops (tenants) and login with email/password. All functionality works with mock data stored in-memory.

---

## Architecture Pattern

### Service Layer Pattern

The application follows a **Service Interface Pattern** where:

1. **UI Components** → Call service methods (never direct API calls)
2. **Service Interface** → Defines the contract (TypeScript interface)
3. **Service Implementation** → Mock (in-memory) or HTTP (backend API)

```
┌─────────────────────────────────────┐
│         UI Components               │
│  (LoginPage, RegisterPage, App)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Service Interface               │
│    (AuthService contract)            │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌──────────┐      ┌──────────────┐
│   Mock   │      │     HTTP     │
│ Service  │      │   Service    │
│(Phase 2) │      │  (Phase 11)  │
└──────────┘      └──────────────┘
```

### Key Benefits

- ✅ **Zero UI changes** when switching from mock to HTTP mode
- ✅ **Business logic** stays in services, not components
- ✅ **Easy testing** with mock implementations
- ✅ **Type safety** via TypeScript interfaces

---

## File Structure

```
src/
├── services/
│   ├── interfaces/
│   │   └── AuthService.ts          # Service contract + types
│   ├── mock/
│   │   ├── store.ts                # In-memory data store
│   │   └── AuthServiceMock.ts      # Mock implementation
│   ├── http/
│   │   └── AuthServiceHttp.ts      # HTTP stub (Phase 11)
│   └── index.ts                    # Service factory
│
├── pages/
│   └── auth/
│       ├── LoginPage.tsx           # Login UI (updated)
│       └── RegisterPage.tsx        # Registration UI (new)
│
├── layouts/
│   └── AppLayout.tsx               # Updated logout
│
└── App.tsx                         # Updated routes + auth check
```

---

## Code Changes Explained

### 1. Service Interface (`src/services/interfaces/AuthService.ts`)

**Purpose**: Defines the contract that all auth service implementations must follow.

#### Types Defined

```typescript
// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration request (tenant onboarding)
export interface RegisterRequest {
  shopName: string;    // Tenant name
  ownerName: string;   // Owner's name
  email: string;       // Owner's email
  password: string;    // Owner's password
}

// Session user info
export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

// Session tenant info
export interface SessionTenant {
  id: string;
  name: string;
}

// Complete session object
export interface Session {
  token: string;
  user: SessionUser;
  tenant: SessionTenant;
}
```

#### Service Contract

```typescript
export interface AuthService {
  login(credentials: LoginCredentials): Promise<Session>;
  register(request: RegisterRequest): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Session | null;
}
```

**Why this design?**
- `Session` includes both user and tenant info (multi-tenant architecture)
- All methods return Promises (async) for consistency
- `getSession()` returns `null` when no session exists (no exceptions)

---

### 2. Mock Store (`src/services/mock/store.ts`)

**Purpose**: In-memory data store that simulates a database. Shared by all mock services.

#### Data Structures

```typescript
export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;        // Links user to tenant
  email: string;
  name: string;
  passwordHash: string;     // Mock: plain text for demo
  role: "owner" | "staff";
  createdAt: string;
}
```

#### Store Object

```typescript
export const mockStore = {
  tenants: Tenant[],        // All tenants
  users: User[],            // All users
  
  // Query methods
  getTenantById(id): Tenant | undefined
  getUserById(id): User | undefined
  getUserByEmail(email): User | undefined
  
  // Mutation methods
  addTenant(name): Tenant
  addUser(tenantId, email, name, password, role): User
}
```

#### Seed Data

The store is initialized with demo data:
- **Demo Tenant**: "Demo Shop" (`tenant-demo-1`)
- **Demo User**: `owner@example.com` / `password` (`user-demo-1`)

**Why in-memory?**
- No backend required during UI development
- Fast and simple for testing
- Can be expanded in Phase 3 with more entities

**ID Generation**

```typescript
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
```

Uses timestamp + random string for unique IDs. Format: `tenant-1234567890-abc123`

---

### 3. Mock Service Implementation (`src/services/mock/AuthServiceMock.ts`)

**Purpose**: Implements `AuthService` interface using the mock store.

#### Session Management

```typescript
const SESSION_STORAGE_KEY = "hk_session";  // Full session object
const TOKEN_STORAGE_KEY = "hk_token";      // Token only (for apiClient)
```

**Why two keys?**
- `hk_session`: Complete session (user + tenant info)
- `hk_token`: Token only (used by `apiClient.ts` for HTTP requests)

#### Helper Functions

```typescript
// Creates session object from user + tenant
function sessionFromStore(user, tenant): Session {
  const token = `mock-token-${user.id}-${Date.now()}`;
  return { token, user, tenant };
}

// Persists session to localStorage
function persistSession(session: Session): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
}

// Clears session from localStorage
function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}
```

#### Login Implementation

```typescript
async login(credentials: LoginCredentials): Promise<Session> {
  // 1. Validate input
  const email = credentials.email?.trim().toLowerCase();
  const password = credentials.password;
  if (!email || !password) {
    throw new Error("EMAIL_AND_PASSWORD_REQUIRED");
  }
  
  // 2. Find user by email
  const user = mockStore.getUserByEmail(email);
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }
  
  // 3. Verify password (mock: plain comparison)
  if (user.passwordHash !== password) {
    throw new Error("INVALID_CREDENTIALS");
  }
  
  // 4. Get tenant
  const tenant = mockStore.getTenantById(user.tenantId);
  if (!tenant) {
    throw new Error("TENANT_NOT_FOUND");
  }
  
  // 5. Create and persist session
  const session = sessionFromStore(user, tenant);
  persistSession(session);
  return session;
}
```

**Error Handling**: Throws specific error codes that UI can map to user-friendly messages.

#### Register Implementation

```typescript
async register(request: RegisterRequest): Promise<Session> {
  // 1. Validate input
  const shopName = request.shopName?.trim();
  const ownerName = request.ownerName?.trim();
  const email = request.email?.trim().toLowerCase();
  const password = request.password;
  
  if (!shopName || !ownerName || !email || !password) {
    throw new Error("ALL_FIELDS_REQUIRED");
  }
  
  // 2. Password validation
  if (password.length < 6) {
    throw new Error("PASSWORD_TOO_SHORT");
  }
  
  // 3. Check email uniqueness
  if (mockStore.getUserByEmail(email)) {
    throw new Error("USER_EMAIL_EXISTS");
  }
  
  // 4. Create tenant
  const tenant = mockStore.addTenant(shopName);
  
  // 5. Create owner user
  const user = mockStore.addUser(tenant.id, email, ownerName, password, "owner");
  
  // 6. Create and persist session
  const session = sessionFromStore(user, tenant);
  persistSession(session);
  return session;
}
```

**Tenant Onboarding**: Registration creates both tenant and owner user in one operation.

#### Get Session

```typescript
getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    
    // Validate session structure
    if (!session?.token || !session?.user?.id || !session?.tenant?.id) {
      return null;
    }
    return session;
  } catch {
    return null;  // Invalid JSON or missing data
  }
}
```

**Why return `null`?** No exceptions for missing session - UI can check `if (!session)`.

---

### 4. HTTP Service Stub (`src/services/http/AuthServiceHttp.ts`)

**Purpose**: Placeholder for Phase 11 (Backend Integration). Currently throws errors.

```typescript
export class AuthServiceHttp implements AuthService {
  async login(_credentials: LoginCredentials): Promise<Session> {
    throw new Error("AuthServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }
  
  async register(_request: RegisterRequest): Promise<Session> {
    throw new Error("AuthServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }
  
  async logout(): Promise<void> {
    localStorage.removeItem("hk_token");
    localStorage.removeItem("hk_session");
  }
  
  getSession(): Session | null {
    // Same implementation as mock (reads from localStorage)
    // In Phase 11, this will validate token with backend
  }
}
```

**Why stub now?** Ensures TypeScript compilation works and provides structure for Phase 11.

---

### 5. Service Factory (`src/services/index.ts`)

**Purpose**: Exports the correct service implementation based on environment variable.

```typescript
import type { AuthService } from "./interfaces/AuthService";
import { AuthServiceMock } from "./mock/AuthServiceMock";
import { AuthServiceHttp } from "./http/AuthServiceHttp";

const dataMode = import.meta.env.VITE_DATA_MODE || "mock";

export const authService: AuthService =
  dataMode === "mock" ? new AuthServiceMock() : new AuthServiceHttp();

export type { AuthService, LoginCredentials, RegisterRequest, Session };
```

**Mode Switch**:
- `VITE_DATA_MODE=mock` → Uses `AuthServiceMock` (default)
- `VITE_DATA_MODE=http` → Uses `AuthServiceHttp` (Phase 11)

**Why factory pattern?** UI components import `authService` and don't know which implementation is used.

---

### 6. Register Page (`src/pages/auth/RegisterPage.tsx`)

**Purpose**: UI for tenant onboarding (shop registration).

#### Form Fields

```typescript
const [shopName, setShopName] = React.useState("");
const [ownerName, setOwnerName] = React.useState("");
const [email, setEmail] = React.useState("");
const [password, setPassword] = React.useState("");
const [error, setError] = React.useState<string | null>(null);
const [loading, setLoading] = React.useState(false);
```

#### Submit Handler

```typescript
const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  
  try {
    await authService.register({
      shopName,
      ownerName,
      email,
      password
    });
    nav("/", { replace: true });  // Redirect to dashboard
  } catch (err) {
    const message = err instanceof Error ? err.message : "REGISTRATION_FAILED";
    setError(ERROR_MESSAGES[message] ?? "Registration failed. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

#### Error Mapping

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  ALL_FIELDS_REQUIRED: "Please fill in all fields.",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters.",
  USER_EMAIL_EXISTS: "An account with this email already exists."
};
```

**Why error mapping?** Converts service error codes to user-friendly messages.

#### UI Features

- ✅ Form validation (required fields)
- ✅ Loading state (button disabled during submission)
- ✅ Error display (red error text)
- ✅ Link to login page
- ✅ Responsive design (centered, max-width 420px)

---

### 7. Login Page Updates (`src/pages/auth/LoginPage.tsx`)

**Changes from Phase 1**:
- ✅ Uses `authService.login()` instead of direct localStorage
- ✅ Error handling with user-friendly messages
- ✅ Loading state
- ✅ Link to register page

#### Before (Phase 1)

```typescript
const onSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  localStorage.setItem("hk_token", "demo-token");
  nav("/", { replace: true });
};
```

#### After (Phase 2)

```typescript
const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  
  try {
    await authService.login({ email, password });
    nav("/", { replace: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LOGIN_FAILED";
    setError(ERROR_MESSAGES[message] ?? "Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

**Demo Credentials**: Pre-filled with `owner@example.com` / `password` for easy testing.

---

### 8. App.tsx Updates (`src/App.tsx`)

**Changes**:
- ✅ Uses `authService.getSession()` for auth check
- ✅ Added `/register` route
- ✅ Imported `RegisterPage`

#### Before (Phase 1)

```typescript
const isAuthenticated = () => Boolean(localStorage.getItem("hk_token"));

function RequireAuth({ children }: { children: JSX.Element }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}
```

#### After (Phase 2)

```typescript
import { authService } from "./services";

function RequireAuth({ children }: { children: JSX.Element }) {
  const session = authService.getSession();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
```

**Why change?** Uses service abstraction instead of direct localStorage access.

#### Routes

```typescript
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />  {/* New */}
  
  <Route
    path="/"
    element={
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    }
  >
    <Route index element={<DashboardPage />} />
    <Route path="products" element={<ProductsPage />} />
  </Route>
  
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

---

### 9. AppLayout Updates (`src/layouts/AppLayout.tsx`)

**Change**: Logout uses `authService.logout()` instead of direct localStorage.

#### Before (Phase 1)

```typescript
onClick={() => {
  localStorage.removeItem("hk_token");
  window.location.href = "/login";
}}
```

#### After (Phase 2)

```typescript
import { authService } from "../services";

onClick={() => {
  authService.logout();
  window.location.href = "/login";
}}
```

**Why change?** Consistent use of service layer (clears both `hk_session` and `hk_token`).

---

## Data Flow Examples

### Login Flow

```
1. User enters email/password in LoginPage
   ↓
2. LoginPage calls authService.login({ email, password })
   ↓
3. AuthServiceMock.login():
   - Validates input
   - Finds user in mockStore by email
   - Verifies password
   - Gets tenant from mockStore
   - Creates Session object
   - Persists to localStorage (hk_session + hk_token)
   ↓
4. Returns Session to LoginPage
   ↓
5. LoginPage redirects to "/"
   ↓
6. App.tsx RequireAuth checks authService.getSession()
   - Reads from localStorage
   - Returns Session (user is authenticated)
   ↓
7. DashboardPage renders
```

### Registration Flow

```
1. User fills RegisterPage form (shopName, ownerName, email, password)
   ↓
2. RegisterPage calls authService.register({ ... })
   ↓
3. AuthServiceMock.register():
   - Validates all fields
   - Checks password length (min 6)
   - Checks email uniqueness
   - Creates Tenant in mockStore
   - Creates User (owner role) in mockStore
   - Creates Session object
   - Persists to localStorage
   ↓
4. Returns Session to RegisterPage
   ↓
5. RegisterPage redirects to "/"
   ↓
6. User is logged in and sees DashboardPage
```

### Session Persistence

```
1. User logs in → Session saved to localStorage
   ↓
2. User refreshes page → App.tsx calls authService.getSession()
   ↓
3. AuthServiceMock.getSession() reads from localStorage
   ↓
4. Returns Session → User stays logged in
```

---

## Testing the Implementation

### Demo Login

1. Navigate to `/login`
2. Email: `owner@example.com`
3. Password: `password`
4. Click "Sign in"
5. Should redirect to dashboard

### New Registration

1. Navigate to `/register`
2. Fill form:
   - Shop name: "My Shop"
   - Your name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
3. Click "Register"
4. Should create tenant + user and log in automatically
5. Should redirect to dashboard

### Session Persistence

1. Login successfully
2. Refresh the page (F5)
3. Should remain logged in (no redirect to login)

### Logout

1. Click "Logout" in AppLayout header
2. Should clear session and redirect to `/login`
3. Try accessing `/` → Should redirect to `/login`

---

## Error Handling

### Service Errors

The mock service throws specific error codes:

- `EMAIL_AND_PASSWORD_REQUIRED` - Missing credentials
- `INVALID_CREDENTIALS` - Wrong email/password
- `TENANT_NOT_FOUND` - User's tenant missing (data corruption)
- `ALL_FIELDS_REQUIRED` - Missing registration fields
- `PASSWORD_TOO_SHORT` - Password < 6 characters
- `USER_EMAIL_EXISTS` - Email already registered

### UI Error Display

Both `LoginPage` and `RegisterPage` map error codes to user-friendly messages:

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_AND_PASSWORD_REQUIRED: "Please enter email and password.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  // ... etc
};

// In catch block:
const message = err instanceof Error ? err.message : "LOGIN_FAILED";
setError(ERROR_MESSAGES[message] ?? "Login failed. Please try again.");
```

**Fallback**: Unknown errors show generic message.

---

## Architecture Decisions

### Why Service Interface Pattern?

1. **Separation of Concerns**: UI doesn't know about mock vs HTTP
2. **Testability**: Easy to swap implementations
3. **Type Safety**: TypeScript ensures contract compliance
4. **Future-Proof**: Zero UI changes when switching to backend

### Why In-Memory Store?

1. **No Backend Required**: UI development can proceed independently
2. **Fast Development**: No API setup needed
3. **Easy Testing**: Reset state by refreshing page
4. **Realistic Behavior**: Store behaves like a database (CRUD operations)

### Why localStorage for Session?

1. **Persistence**: Session survives page refresh
2. **Simple**: No need for cookies or complex state management
3. **Compatible**: Works with existing `apiClient.ts` (uses `hk_token`)

### Why Two Storage Keys?

- `hk_session`: Full session object (user + tenant info)
- `hk_token`: Token only (for `apiClient.ts` Authorization header)

**Future**: In Phase 11, `hk_token` will be validated with backend, `hk_session` provides quick access to user/tenant info without API call.

---

## Phase 2 Deliverables

✅ **Service Layer Architecture**
- Service interface pattern established
- Mock and HTTP implementations separated
- Service factory with mode switch

✅ **Authentication**
- Login with email/password
- Session management (persistent)
- Protected routes

✅ **Tenant Onboarding**
- Register new shop (tenant)
- Create owner account
- Auto-login after registration

✅ **Mock Data Layer**
- In-memory store (tenants + users)
- Seed demo data
- CRUD operations

✅ **UI Components**
- LoginPage (updated)
- RegisterPage (new)
- Error handling
- Loading states

---

## Next Steps (Phase 3)

Phase 3 will expand the mock store with:
- Products
- Suppliers
- Customers
- Purchases
- Sales
- Payments
- Staff

The store will maintain tenant isolation (users only see their tenant's data).

---

## Files Changed Summary

### New Files
- `src/services/interfaces/AuthService.ts`
- `src/services/mock/store.ts`
- `src/services/mock/AuthServiceMock.ts`
- `src/services/http/AuthServiceHttp.ts`
- `src/services/index.ts`
- `src/pages/auth/RegisterPage.tsx`

### Modified Files
- `src/pages/auth/LoginPage.tsx`
- `src/App.tsx`
- `src/layouts/AppLayout.tsx`

### Total Changes
- **9 files changed**
- **413 insertions**
- **14 deletions**

---

## Conclusion

Phase 2 successfully implements authentication and onboarding with a clean service layer architecture. The implementation:

- ✅ Follows the contract pattern (UI → Interface → Implementation)
- ✅ Provides mock data for UI development
- ✅ Maintains type safety throughout
- ✅ Handles errors gracefully
- ✅ Persists sessions across page refreshes
- ✅ Sets foundation for Phase 3 (expanded mock store)

The code is production-ready for mock mode and can be seamlessly switched to HTTP mode in Phase 11 without any UI changes.
