/**
 * In-memory domain store for mock mode. Shared by mock services.
 * Phase 2: tenants + users only. Other entities added in later phases.
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

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const mockStore = {
  tenants: [
    {
      id: DEMO_TENANT_ID,
      name: "Demo Shop",
      createdAt: new Date().toISOString()
    }
  ] as Tenant[],

  users: [
    {
      id: DEMO_USER_ID,
      tenantId: DEMO_TENANT_ID,
      email: "owner@example.com",
      name: "Demo Owner",
      passwordHash: "password", // mock: store plain for demo
      role: "owner" as const,
      createdAt: new Date().toISOString()
    }
  ] as User[],

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
    return user;
  }
};
