import type {
  AuthService,
  LoginCredentials,
  RegisterRequest,
  Session
} from "../interfaces/AuthService";

/**
 * HTTP implementation of AuthService. To be implemented in Phase 11 (Backend Integration).
 * Stub throws for all methods when VITE_DATA_MODE=http until backend is ready.
 */
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
    try {
      const raw = localStorage.getItem("hk_session");
      if (!raw) return null;
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }
}
