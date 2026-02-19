# Phase 8: Staff + Roles - Complete Documentation (Hinglish)

## Overview (Jankari)

Phase 8 mein humne Staff management aur role assignment functionality implement ki hai. Is phase mein humne StaffService interface, mock implementation, StaffPage, aur StaffFormDialog banaye hain. Staff members ko add/edit/delete kiya ja sakta hai aur unhe role (owner/staff) assign kiya ja sakta hai.

**Goal (Lakshya)**: Users staff members create/edit/delete kar sakte hain, staff list dekh sakte hain, aur role (owner/staff) assign kar sakte hain.

**Key Feature**: Staff management functional hai with role management. Supplier/Customer jaisa same pattern follow kiya hai (list + form dialog).

---

## Architecture Pattern (Rachna Pattern)

### Service Layer Pattern (Phase 5 / 7 se continue)

Phase 8 mein humne existing service layer pattern ko follow kiya hai:

```
┌─────────────────────────────────────┐
│         UI Components               │
│  (StaffPage + StaffFormDialog)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Service Interface               │
│  (StaffService contract)             │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌──────────┐      ┌──────────────┐
│   Mock   │      │     HTTP     │
│ Service  │      │   Service    │
│(Phase 8) │      │  (Phase 11)  │
└──────────┘      └──────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Mock Store (store.ts)           │
│  - Staff[] (Phase 3 se)              │
│  - getStaffByTenant, addStaff, etc.  │
└─────────────────────────────────────┘
```

### Key Benefits (Mukhya Fayde)

- ✅ **Zero UI changes** jab mock se HTTP mode mein switch karte hain
- ✅ **Business logic** services mein (validation, tenant check)
- ✅ **Role management** simple (owner/staff) — future mein extend ho sakta hai
- ✅ **Type safety** TypeScript interfaces se
- ✅ **Tenant isolation** har operation tenant-aware hai

---

## File Structure (File Ki Rachna)

```
src/
├── services/
│   ├── interfaces/
│   │   └── StaffService.ts            # Service contract + types (NEW)
│   ├── mock/
│   │   └── StaffServiceMock.ts        # Mock implementation (NEW)
│   ├── http/
│   │   └── StaffServiceHttp.ts        # HTTP stub (NEW)
│   └── index.ts                       # Service factory (UPDATED)
│
├── components/
│   └── staff/
│       └── StaffFormDialog.tsx        # Add/Edit dialog (NEW)
│
└── pages/
    └── staff/
        └── StaffPage.tsx              # Staff list (UPDATED)
```

---

## Code Changes Explained (Code Changes Ki Vistrit Jankari)

### 1. StaffService Interface (`src/services/interfaces/StaffService.ts`)

**Purpose (Uddeshya)**: Yeh contract define karta hai jo sabhi staff service implementations ko follow karenge.

#### Types Defined (Defined Kiye Gaye Types)

```typescript
import type { Staff } from "../mock/store";

export interface CreateStaffRequest {
  name: string;
  email?: string;
  phone?: string;
  role: "owner" | "staff";
}

export interface UpdateStaffRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: "owner" | "staff";
}
```

**CreateStaffRequest**:
- `name`: Required — staff member ka naam
- `role`: Required — owner ya staff
- `email`, `phone`: Optional — contact info

**UpdateStaffRequest**:
- Sab fields optional — sirf jo change karna hai woh bhejna hai
- Role bhi update ho sakta hai (e.g. staff → owner)

**Staff type kahan se?**
- `Staff` interface Phase 3 se store.ts mein hai: id, tenantId, name, email?, phone?, role, createdAt, updatedAt

#### Service Contract (Service Ka Contract)

```typescript
export interface StaffService {
  getStaff(): Promise<Staff[]>;
  getStaffById(id: string): Promise<Staff | null>;
  createStaff(request: CreateStaffRequest): Promise<Staff>;
  updateStaff(id: string, request: UpdateStaffRequest): Promise<Staff>;
  deleteStaff(id: string): Promise<void>;
}
```

**Methods**:
- `getStaff()`: Current tenant ke saare staff members
- `getStaffById(id)`: Ek staff member by ID (tenant check ke baad)
- `createStaff(request)`: Naya staff create
- `updateStaff(id, request)`: Existing staff update
- `deleteStaff(id)`: Staff delete

---

### 2. StaffServiceMock (`src/services/mock/StaffServiceMock.ts`)

**Purpose (Uddeshya)**: StaffService interface ko mock store use karke implement karta hai.

#### Tenant ID Helper

```typescript
private getTenantId(): string {
  const session = authService.getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session.tenant.id;
}
```

Har operation se pehle tenantId session se liya jata hai taaki sirf current tenant ka data dikhe.

#### getStaff()

```typescript
async getStaff(): Promise<Staff[]> {
  const tenantId = this.getTenantId();
  return mockStore.getStaffByTenant(tenantId);
}
```

Store se `getStaffByTenant(tenantId)` call — Phase 3 se yeh method store mein hai.

#### getStaffById(id)

```typescript
async getStaffById(id: string): Promise<Staff | null> {
  const tenantId = this.getTenantId();
  const staff = mockStore.getStaffById(id);
  if (!staff) return null;
  if (staff.tenantId !== tenantId) return null;
  return staff;
}
```

- Pehle staff dhundho
- Agar nahi mila ya doosre tenant ka hai to null
- Warna staff return

#### createStaff(request)

```typescript
async createStaff(request: CreateStaffRequest): Promise<Staff> {
  const tenantId = this.getTenantId();

  if (!request.name?.trim()) {
    throw new Error("STAFF_NAME_REQUIRED");
  }
  if (!request.role || (request.role !== "owner" && request.role !== "staff")) {
    throw new Error("INVALID_ROLE");
  }

  return mockStore.addStaff(
    tenantId,
    request.name.trim(),
    request.role,
    request.email?.trim(),
    request.phone?.trim()
  );
}
```

**Validation**:
1. Name required (trim ke baad empty nahi hona chahiye)
2. Role valid hona chahiye — sirf "owner" ya "staff"

Phir `mockStore.addStaff()` — store Phase 3 se addStaff signature match karta hai.

#### updateStaff(id, request)

```typescript
async updateStaff(id: string, request: UpdateStaffRequest): Promise<Staff> {
  const tenantId = this.getTenantId();
  const staff = mockStore.getStaffById(id);

  if (!staff) throw new Error("STAFF_NOT_FOUND");
  if (staff.tenantId !== tenantId) throw new Error("STAFF_NOT_FOUND");

  if (request.role !== undefined && request.role !== "owner" && request.role !== "staff") {
    throw new Error("INVALID_ROLE");
  }

  const updates: Partial<Staff> = {};
  if (request.name !== undefined) updates.name = request.name.trim();
  if (request.email !== undefined) updates.email = request.email?.trim();
  if (request.phone !== undefined) updates.phone = request.phone?.trim();
  if (request.role !== undefined) updates.role = request.role;

  return mockStore.updateStaff(id, updates);
}
```

- Staff exist karta hai aur current tenant ka hai — yeh ensure karo
- Agar role diya hai to valid (owner/staff) hona chahiye
- Jo fields diye gaye hain sirf unhi ko updates object mein daalo
- mockStore.updateStaff(id, updates) se update karo

#### deleteStaff(id)

```typescript
async deleteStaff(id: string): Promise<void> {
  const tenantId = this.getTenantId();
  const staff = mockStore.getStaffById(id);
  if (!staff) throw new Error("STAFF_NOT_FOUND");
  if (staff.tenantId !== tenantId) throw new Error("STAFF_NOT_FOUND");
  mockStore.deleteStaff(id);
}
```

Tenant check ke baad store se delete.

---

### 3. StaffServiceHttp (`src/services/http/StaffServiceHttp.ts`)

**Purpose**: Phase 11 ke liye stub. Sab methods mein "not implemented" error throw karte hain. Library versions change nahi kiye.

---

### 4. Service Factory Update (`src/services/index.ts`)

**Changes**:
- `StaffService`, `StaffServiceMock`, `StaffServiceHttp` import
- `staffService` export: `dataMode === "mock" ? new StaffServiceMock() : new StaffServiceHttp()`
- Type exports: `StaffService`, `CreateStaffRequest`, `UpdateStaffRequest`

---

### 5. StaffFormDialog (`src/components/staff/StaffFormDialog.tsx`)

**Purpose (Uddeshya)**: Add new staff ya edit existing staff ke liye dialog. SupplierFormDialog / CustomerFormDialog jaisa pattern.

#### Props

```typescript
interface StaffFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffRequest | UpdateStaffRequest) => Promise<void>;
  staff?: Staff | null;  // null = create mode, Staff = edit mode
}
```

- `open`: Dialog open/close
- `onClose`: Band karne par callback
- `onSubmit`: Form submit — parent create ya update karega
- `staff`: null = Add, Staff object = Edit

#### State

```typescript
const [name, setName] = React.useState("");
const [email, setEmail] = React.useState("");
const [phone, setPhone] = React.useState("");
const [role, setRole] = React.useState<"owner" | "staff">("staff");
const [error, setError] = React.useState<string | null>(null);
const [loading, setLoading] = React.useState(false);
```

Create mode mein default role "staff". Edit mode mein existing staff ka role pre-fill.

#### Reset Form (useEffect)

```typescript
React.useEffect(() => {
  if (open) {
    if (staff) {
      setName(staff.name);
      setEmail(staff.email || "");
      setPhone(staff.phone || "");
      setRole(staff.role);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setRole("staff");
    }
    setError(null);
  }
}, [open, staff]);
```

Jab dialog open ho ya staff prop change ho to form reset / pre-fill.

#### Submit Handler

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    if (!name.trim()) throw new Error("Staff name is required");

    const data: CreateStaffRequest | UpdateStaffRequest = {
      name: name.trim(),
      role,
      ...(email.trim() && { email: email.trim() }),
      ...(phone.trim() && { phone: phone.trim() })
    };

    await onSubmit(data);
    onClose();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save staff";
    setError(message);
  } finally {
    setLoading(false);
  }
};
```

- Name required check
- Data object: name, role (required), email/phone optional (sirf agar non-empty)
- Parent ka `onSubmit(data)` call, phir dialog close

#### UI Elements

- **Dialog**: maxWidth="sm", fullWidth
- **Title**: "Add New Staff Member" ya "Edit Staff Member"
- **Fields**:
  - Staff Name (TextField, required, autoFocus)
  - Role (FormControl + Select: Owner / Staff, required)
  - Email (TextField, optional, type="email")
  - Phone (TextField, optional, type="tel")
- **Actions**: Cancel, Submit (Create/Update button)

Role management yahan dropdown se hota hai — user Owner ya Staff select karta hai.

---

### 6. StaffPage (`src/pages/staff/StaffPage.tsx`)

**Purpose (Uddeshya)**: Staff list dikhana, search, Add/Edit/Delete.

#### State

```typescript
const [staff, setStaff] = React.useState<Staff[]>([]);
const [loading, setLoading] = React.useState(true);
const [error, setError] = React.useState<string | null>(null);
const [searchQuery, setSearchQuery] = React.useState("");
const [dialogOpen, setDialogOpen] = React.useState(false);
const [editingStaff, setEditingStaff] = React.useState<Staff | null>(null);
```

- `staff`: List from API
- `editingStaff`: null = Add dialog, Staff = Edit dialog
- `dialogOpen`: StaffFormDialog open/close

#### Load Staff

```typescript
const loadStaff = React.useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await staffService.getStaff();
    setStaff(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load staff";
    setError(message);
  } finally {
    setLoading(false);
  }
}, []);

React.useEffect(() => {
  loadStaff();
}, [loadStaff]);
```

Page load par staff list fetch.

#### Filter (Search)

```typescript
const filteredStaff = React.useMemo(() => {
  if (!searchQuery.trim()) return staff;
  const query = searchQuery.toLowerCase();
  return staff.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      s.phone?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.role.toLowerCase().includes(query)
  );
}, [staff, searchQuery]);
```

Search: name, phone, email, role — kisi se bhi match ho to list mein aata hai.

#### Handlers

- **handleSubmit(data)**: Agar `editingStaff` hai to `staffService.updateStaff(editingStaff.id, data)`, warna `staffService.createStaff(data)`. Phir `loadStaff()`.
- **handleDelete(id)**: Confirm dialog, phir `staffService.deleteStaff(id)`, phir `loadStaff()`.
- **handleEdit(staffMember)**: `setEditingStaff(staffMember)`, `setDialogOpen(true)`.
- **handleAdd()**: `setEditingStaff(null)`, `setDialogOpen(true)`.

#### Table Columns

- Name
- Role: Chip — Owner = color "primary", Staff = "default"
- Email (ya "-")
- Phone (ya "-")
- Actions: Edit icon, Delete icon

#### StaffFormDialog Usage

```tsx
<StaffFormDialog
  open={dialogOpen}
  onClose={() => {
    setDialogOpen(false);
    setEditingStaff(null);
  }}
  onSubmit={handleSubmit}
  staff={editingStaff}
/>
```

Dialog close par `editingStaff` null kar diya taaki next time Add fresh form ho.

---

## Role Management (Role Management)

- **Store**: Staff type mein `role: "owner" | "staff"` (Phase 3 se).
- **Service**: Create/Update mein role required (create) ya optional (update), validation "owner" ya "staff" hi allow karta hai.
- **UI**: StaffFormDialog mein Role dropdown (Owner/Staff). StaffPage mein role Chip se dikhaya (Owner = primary, Staff = default).
- **Future**: Agar permission system chahiye (e.g. owner-only delete, staff-only view) to Phase 8 ke baad add kiya ja sakta hai — abhi sirf role store aur display hai.

---

## Permission System (Permission System)

- Contract: "Permission system (if needed)".
- Current: Implement nahi kiya. Sirf role (owner/staff) store aur UI mein hai.
- Future: Agar chahiye to auth/session ke saath role check karke routes ya actions restrict kar sakte hain (e.g. RequireRole component, ya API level checks).

---

## Summary (Nishkarsh)

Phase 8 ne Staff management aur role assignment implement kar diya:

- ✅ StaffService (interface + mock + http stub)
- ✅ StaffPage (list, search, add/edit/delete)
- ✅ StaffFormDialog (add/edit with role selection)
- ✅ Role management (owner/staff) — display aur form dono mein
- ⚠️ Permission system — "if needed" ke hisaab se defer; abhi sirf role data aur UI

**Phase 8 Status**: ✅ **Complete**

**Next Phase**: Phase 9 — Dashboard (Today sales, Total due, Low stock).

---

## Files Changed Summary (Files Changed Ka Summary)

### New Files (Nayi Files)

- `src/services/interfaces/StaffService.ts`
- `src/services/mock/StaffServiceMock.ts`
- `src/services/http/StaffServiceHttp.ts`
- `src/components/staff/StaffFormDialog.tsx`

### Modified Files (Modified Files)

- `src/services/index.ts`
- `src/pages/staff/StaffPage.tsx`

### Total Changes

- **6 files** — 4 new, 2 modified  
- **~547 insertions, ~18 deletions**

---

**Last Updated**: Phase 8 Implementation Complete  
**Git Branch**: `develop_phase8`  
**PR Status**: Ready for Review
