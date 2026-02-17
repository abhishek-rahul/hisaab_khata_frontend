import type {
  AuthService,
  LoginCredentials,
  RegisterRequest,
  Session,
  SessionUser,
  SessionTenant
} from "../interfaces/AuthService";
import { mockStore } from "./store";

const SESSION_STORAGE_KEY = "hk_session";
const TOKEN_STORAGE_KEY = "hk_token";

function sessionFromStore(user: { id: string; email: string; name: string }, tenant: { id: string; name: string }): Session {
  const token = `mock-token-${user.id}-${Date.now()}`;
  return {
    token,
    user: { id: user.id, email: user.email, name: user.name } as SessionUser,
    tenant: { id: tenant.id, name: tenant.name } as SessionTenant
  };
}

function persistSession(session: Session): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
}

function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export class AuthServiceMock implements AuthService {
  async login(credentials: LoginCredentials): Promise<Session> {
    const email = credentials.email?.trim().toLowerCase();
    const password = credentials.password;
    if (!email || !password) {
      throw new Error("EMAIL_AND_PASSWORD_REQUIRED");
    }
    const user = mockStore.getUserByEmail(email);
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }
    if (user.passwordHash !== password) {
      throw new Error("INVALID_CREDENTIALS");
    }
    const tenant = mockStore.getTenantById(user.tenantId);
    if (!tenant) {
      throw new Error("TENANT_NOT_FOUND");
    }
    const session = sessionFromStore(user, tenant);
    persistSession(session);
    return session;
  }

  async register(request: RegisterRequest): Promise<Session> {
    const shopName = request.shopName?.trim();
    const ownerName = request.ownerName?.trim();
    const email = request.email?.trim().toLowerCase();
    const password = request.password;
    if (!shopName || !ownerName || !email || !password) {
      throw new Error("ALL_FIELDS_REQUIRED");
    }
    if (password.length < 6) {
      throw new Error("PASSWORD_TOO_SHORT");
    }
    if (mockStore.getUserByEmail(email)) {
      throw new Error("USER_EMAIL_EXISTS");
    }
    const tenant = mockStore.addTenant(shopName);
    const user = mockStore.addUser(tenant.id, email, ownerName, password, "owner");
    const session = sessionFromStore(user, tenant);
    persistSession(session);
    return session;
  }

  async logout(): Promise<void> {
    clearSession();
  }

  getSession(): Session | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as Session;
      if (!session?.token || !session?.user?.id || !session?.tenant?.id) return null;
      return session;
    } catch {
      return null;
    }
  }
}
