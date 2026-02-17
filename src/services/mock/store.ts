/**
 * In-memory domain store for mock mode. Shared by mock services.
 * Phase 2: tenants + users only. Other entities added in later phases.
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

const DEMO_TENANT_ID = "tenant-demo-1";
const DEMO_USER_ID = "user-demo-1";
const STORAGE_KEY_TENANTS = "hk_mock_tenants";
const STORAGE_KEY_USERS = "hk_mock_users";

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

// Initialize from localStorage or seed data
const initialTenants = loadFromStorage<Tenant[]>(STORAGE_KEY_TENANTS, seedTenants);
const initialUsers = loadFromStorage<User[]>(STORAGE_KEY_USERS, seedUsers);

// If localStorage was empty, save seed data
if (!localStorage.getItem(STORAGE_KEY_TENANTS)) {
  saveToStorage(STORAGE_KEY_TENANTS, seedTenants);
}
if (!localStorage.getItem(STORAGE_KEY_USERS)) {
  saveToStorage(STORAGE_KEY_USERS, seedUsers);
}

export const mockStore = {
  tenants: initialTenants,
  users: initialUsers,

  getTenantById(id: string): Tenant | undefined {
    return this.tenants.find((t) => t.id === id);
  },

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
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
  }
};
