# Phase 2: Auth + Onboarding (Mock) - Complete Documentation (Hinglish)

## Overview (Jankari)

Phase 2 mein humne user authentication aur tenant onboarding functionality implement ki hai mock data layer use karke. Is phase mein humne service layer architecture pattern establish kiya hai jo pure application mein use hoga, jisse UI aur business logic ke beech clean separation ho sake.

**Goal (Lakshya)**: Users naye shops (tenants) register kar sakte hain aur email/password se login kar sakte hain. Sabhi functionality mock data ke saath kaam karti hai jo in-memory store mein hai.

---

## Architecture Pattern (Rachna Pattern)

### Service Layer Pattern

Application **Service Interface Pattern** follow karti hai jisme:

1. **UI Components** → Service methods ko call karte hain (kabhi bhi direct API calls nahi)
2. **Service Interface** → Contract define karta hai (TypeScript interface)
3. **Service Implementation** → Mock (in-memory) ya HTTP (backend API)

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

### Key Benefits (Mukhya Fayde)

- ✅ **Zero UI changes** jab mock se HTTP mode mein switch karte hain
- ✅ **Business logic** services mein rehti hai, components mein nahi
- ✅ **Easy testing** mock implementations ke saath
- ✅ **Type safety** TypeScript interfaces se

---

## File Structure (File Ki Rachna)

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

## Code Changes Explained (Code Changes Ki Vistrit Jankari)

### 1. Service Interface (`src/services/interfaces/AuthService.ts`)

**Purpose (Uddeshya)**: Yeh contract define karta hai jo sabhi auth service implementations ko follow karna hoga.

#### Types Defined (Defined Kiye Gaye Types)

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

#### Service Contract (Service Ka Contract)

```typescript
export interface AuthService {
  login(credentials: LoginCredentials): Promise<Session>;
  register(request: RegisterRequest): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Session | null;
}
```

**Yeh design kyun?**
- `Session` mein user aur tenant dono ki info hai (multi-tenant architecture)
- Sabhi methods Promises return karte hain (async) consistency ke liye
- `getSession()` `null` return karta hai jab session nahi hai (no exceptions)

---

### 2. Mock Store (`src/services/mock/store.ts`)

**Purpose (Uddeshya)**: In-memory data store jo database ki tarah kaam karta hai. Sabhi mock services ise share karte hain.

#### Data Structures (Data Ki Rachna)

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

#### Store Object (Store Object)

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

#### Seed Data (Seed Data)

Store demo data ke saath initialize hota hai:
- **Demo Tenant**: "Demo Shop" (`tenant-demo-1`)
- **Demo User**: `owner@example.com` / `password` (`user-demo-1`)

**In-memory kyun?**
- UI development ke dauran backend ki zarurat nahi
- Testing ke liye fast aur simple
- Phase 3 mein aur entities ke saath expand ho sakta hai

**ID Generation (ID Generation)**

```typescript
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
```

Unique IDs ke liye timestamp + random string use karta hai. Format: `tenant-1234567890-abc123`

---

### 3. Mock Service Implementation (`src/services/mock/AuthServiceMock.ts`)

**Purpose (Uddeshya)**: `AuthService` interface ko mock store use karke implement karta hai.

#### Session Management (Session Management)

```typescript
const SESSION_STORAGE_KEY = "hk_session";  // Full session object
const TOKEN_STORAGE_KEY = "hk_token";      // Token only (for apiClient)
```

**Do keys kyun?**
- `hk_session`: Complete session (user + tenant info)
- `hk_token`: Sirf token (HTTP requests ke liye `apiClient.ts` use karta hai)

#### Helper Functions (Helper Functions)

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

#### Login Implementation (Login Implementation)

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

**Error Handling**: Specific error codes throw karta hai jo UI user-friendly messages mein map kar sakta hai.

#### Register Implementation (Register Implementation)

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

**Tenant Onboarding**: Registration ek hi operation mein tenant aur owner user dono create karta hai.

#### Get Session (Session Get Karna)

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

**`null` kyun return?** Missing session ke liye exceptions nahi - UI `if (!session)` check kar sakta hai.

---

### 4. HTTP Service Stub (`src/services/http/AuthServiceHttp.ts`)

**Purpose (Uddeshya)**: Phase 11 (Backend Integration) ke liye placeholder. Abhi errors throw karta hai.

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

**Abhi stub kyun?** TypeScript compilation kaam kare aur Phase 11 ke liye structure provide kare.

---

### 5. Service Factory (`src/services/index.ts`)

**Purpose (Uddeshya)**: Environment variable ke basis par sahi service implementation export karta hai.

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
- `VITE_DATA_MODE=mock` → `AuthServiceMock` use karta hai (default)
- `VITE_DATA_MODE=http` → `AuthServiceHttp` use karta hai (Phase 11)

**Factory pattern kyun?** UI components `authService` import karte hain aur nahi jaante ki kaun sa implementation use ho raha hai.

---

### 6. Register Page (`src/pages/auth/RegisterPage.tsx`)

**Purpose (Uddeshya)**: Tenant onboarding ke liye UI (shop registration).

#### Form Fields (Form Fields)

```typescript
const [shopName, setShopName] = React.useState("");
const [ownerName, setOwnerName] = React.useState("");
const [email, setEmail] = React.useState("");
const [password, setPassword] = React.useState("");
const [error, setError] = React.useState<string | null>(null);
const [loading, setLoading] = React.useState(false);
```

#### Submit Handler (Submit Handler)

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

#### Error Mapping (Error Mapping)

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  ALL_FIELDS_REQUIRED: "Please fill in all fields.",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters.",
  USER_EMAIL_EXISTS: "An account with this email already exists."
};
```

**Error mapping kyun?** Service error codes ko user-friendly messages mein convert karta hai.

#### UI Features (UI Features)

- ✅ Form validation (required fields)
- ✅ Loading state (submission ke dauran button disabled)
- ✅ Error display (red error text)
- ✅ Link to login page
- ✅ Responsive design (centered, max-width 420px)

---

### 7. Login Page Updates (`src/pages/auth/LoginPage.tsx`)

**Phase 1 se changes**:
- ✅ `authService.login()` use karta hai direct localStorage ki jagah
- ✅ User-friendly messages ke saath error handling
- ✅ Loading state
- ✅ Register page ka link

#### Pehle (Phase 1)

```typescript
const onSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  localStorage.setItem("hk_token", "demo-token");
  nav("/", { replace: true });
};
```

#### Ab (Phase 2)

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

**Demo Credentials**: Testing ke liye `owner@example.com` / `password` pre-filled hai.

---

### 8. App.tsx Updates (`src/App.tsx`)

**Changes**:
- ✅ Auth check ke liye `authService.getSession()` use karta hai
- ✅ `/register` route add kiya
- ✅ `RegisterPage` import kiya

#### Pehle (Phase 1)

```typescript
const isAuthenticated = () => Boolean(localStorage.getItem("hk_token"));

function RequireAuth({ children }: { children: JSX.Element }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}
```

#### Ab (Phase 2)

```typescript
import { authService } from "./services";

function RequireAuth({ children }: { children: JSX.Element }) {
  const session = authService.getSession();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
```

**Change kyun?** Direct localStorage access ki jagah service abstraction use karta hai.

#### Routes (Routes)

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

**Change**: Logout `authService.logout()` use karta hai direct localStorage ki jagah.

#### Pehle (Phase 1)

```typescript
onClick={() => {
  localStorage.removeItem("hk_token");
  window.location.href = "/login";
}}
```

#### Ab (Phase 2)

```typescript
import { authService } from "../services";

onClick={() => {
  authService.logout();
  window.location.href = "/login";
}}
```

**Change kyun?** Service layer ka consistent use (`hk_session` aur `hk_token` dono clear karta hai).

---

## Data Flow Examples (Data Flow Ke Examples)

### Login Flow (Login Flow)

```
1. User LoginPage mein email/password enter karta hai
   ↓
2. LoginPage authService.login({ email, password }) call karta hai
   ↓
3. AuthServiceMock.login():
   - Input validate karta hai
   - mockStore se email se user find karta hai
   - Password verify karta hai
   - mockStore se tenant get karta hai
   - Session object create karta hai
   - localStorage mein persist karta hai (hk_session + hk_token)
   ↓
4. LoginPage ko Session return karta hai
   ↓
5. LoginPage "/" par redirect karta hai
   ↓
6. App.tsx RequireAuth authService.getSession() check karta hai
   - localStorage se read karta hai
   - Session return karta hai (user authenticated hai)
   ↓
7. DashboardPage render hota hai
```

### Registration Flow (Registration Flow)

```
1. User RegisterPage form fill karta hai (shopName, ownerName, email, password)
   ↓
2. RegisterPage authService.register({ ... }) call karta hai
   ↓
3. AuthServiceMock.register():
   - Sabhi fields validate karta hai
   - Password length check karta hai (min 6)
   - Email uniqueness check karta hai
   - mockStore mein Tenant create karta hai
   - mockStore mein User (owner role) create karta hai
   - Session object create karta hai
   - localStorage mein persist karta hai
   ↓
4. RegisterPage ko Session return karta hai
   ↓
5. RegisterPage "/" par redirect karta hai
   ↓
6. User logged in hai aur DashboardPage dikhai deta hai
```

### Session Persistence (Session Persistence)

```
1. User login karta hai → Session localStorage mein save hota hai
   ↓
2. User page refresh karta hai → App.tsx authService.getSession() call karta hai
   ↓
3. AuthServiceMock.getSession() localStorage se read karta hai
   ↓
4. Session return karta hai → User logged in rehta hai
```

---

## Testing the Implementation (Implementation Test Karna)

### Demo Login (Demo Login)

1. `/login` par navigate karein
2. Email: `owner@example.com`
3. Password: `password`
4. "Sign in" click karein
5. Dashboard par redirect hona chahiye

### New Registration (Naya Registration)

1. `/register` par navigate karein
2. Form fill karein:
   - Shop name: "My Shop"
   - Your name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
3. "Register" click karein
4. Tenant + user create hona chahiye aur automatically login hona chahiye
5. Dashboard par redirect hona chahiye

### Session Persistence (Session Persistence)

1. Successfully login karein
2. Page refresh karein (F5)
3. Logged in rehna chahiye (login par redirect nahi hona chahiye)

### Logout (Logout)

1. AppLayout header mein "Logout" click karein
2. Session clear hona chahiye aur `/login` par redirect hona chahiye
3. `/` access karne ki koshish karein → `/login` par redirect hona chahiye

---

## Error Handling (Error Handling)

### Service Errors (Service Errors)

Mock service specific error codes throw karta hai:

- `EMAIL_AND_PASSWORD_REQUIRED` - Missing credentials
- `INVALID_CREDENTIALS` - Wrong email/password
- `TENANT_NOT_FOUND` - User ka tenant missing hai (data corruption)
- `ALL_FIELDS_REQUIRED` - Missing registration fields
- `PASSWORD_TOO_SHORT` - Password < 6 characters
- `USER_EMAIL_EXISTS` - Email already registered

### UI Error Display (UI Error Display)

`LoginPage` aur `RegisterPage` dono error codes ko user-friendly messages mein map karte hain:

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

**Fallback**: Unknown errors generic message dikhate hain.

---

## Architecture Decisions (Architecture Ke Faisle)

### Service Interface Pattern Kyun?

1. **Separation of Concerns**: UI ko pata nahi ki mock hai ya HTTP
2. **Testability**: Implementations swap karna easy hai
3. **Type Safety**: TypeScript contract compliance ensure karta hai
4. **Future-Proof**: Backend switch karte waqt zero UI changes

### In-Memory Store Kyun?

1. **No Backend Required**: UI development independently proceed kar sakti hai
2. **Fast Development**: API setup ki zarurat nahi
3. **Easy Testing**: Page refresh se state reset ho jata hai
4. **Realistic Behavior**: Store database ki tarah behave karta hai (CRUD operations)

### Session Ke Liye localStorage Kyun?

1. **Persistence**: Session page refresh ke baad bhi rehta hai
2. **Simple**: Cookies ya complex state management ki zarurat nahi
3. **Compatible**: Existing `apiClient.ts` ke saath kaam karta hai (uses `hk_token`)

### Do Storage Keys Kyun?

- `hk_session`: Full session object (user + tenant info)
- `hk_token`: Sirf token (`apiClient.ts` ke Authorization header ke liye)

**Future**: Phase 11 mein `hk_token` backend se validate hoga, `hk_session` API call ke bina user/tenant info quick access ke liye hai.

---

## Phase 2 Deliverables (Phase 2 Ke Deliverables)

✅ **Service Layer Architecture**
- Service interface pattern establish ho gaya
- Mock aur HTTP implementations alag ho gaye
- Mode switch ke saath service factory

✅ **Authentication**
- Email/password se login
- Session management (persistent)
- Protected routes

✅ **Tenant Onboarding**
- Naya shop (tenant) register karna
- Owner account create karna
- Registration ke baad auto-login

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

## Next Steps (Agle Steps) - Phase 3

Phase 3 mein mock store expand hoga:
- Products
- Suppliers
- Customers
- Purchases
- Sales
- Payments
- Staff

Store tenant isolation maintain karega (users sirf apne tenant ka data dekhenge).

---

## Files Changed Summary (Files Changed Ka Summary)

### New Files (Nayi Files)
- `src/services/interfaces/AuthService.ts`
- `src/services/mock/store.ts`
- `src/services/mock/AuthServiceMock.ts`
- `src/services/http/AuthServiceHttp.ts`
- `src/services/index.ts`
- `src/pages/auth/RegisterPage.tsx`

### Modified Files (Modified Files)
- `src/pages/auth/LoginPage.tsx`
- `src/App.tsx`
- `src/layouts/AppLayout.tsx`

### Total Changes (Total Changes)
- **9 files changed**
- **413 insertions**
- **14 deletions**

---

## Conclusion (Nishkarsh)

Phase 2 ne authentication aur onboarding ko clean service layer architecture ke saath successfully implement kar diya hai. Implementation:

- ✅ Contract pattern follow karta hai (UI → Interface → Implementation)
- ✅ UI development ke liye mock data provide karta hai
- ✅ Pure code mein type safety maintain karta hai
- ✅ Errors ko gracefully handle karta hai
- ✅ Page refresh ke baad bhi sessions persist karte hain
- ✅ Phase 3 ke liye foundation set karta hai (expanded mock store)

Code mock mode ke liye production-ready hai aur Phase 11 mein HTTP mode mein seamlessly switch ho sakta hai bina kisi UI changes ke.
