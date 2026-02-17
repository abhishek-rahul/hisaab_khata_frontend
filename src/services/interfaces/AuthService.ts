/**
 * Auth service contract. Implementations: AuthServiceMock (mock) | AuthServiceHttp (http).
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  shopName: string;
  ownerName: string;
  email: string;
  password: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface SessionTenant {
  id: string;
  name: string;
}

export interface Session {
  token: string;
  user: SessionUser;
  tenant: SessionTenant;
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<Session>;
  register(request: RegisterRequest): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Session | null;
}
