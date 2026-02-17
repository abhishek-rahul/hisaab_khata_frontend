import type { AuthService } from "./interfaces/AuthService";
import { AuthServiceMock } from "./mock/AuthServiceMock";
import { AuthServiceHttp } from "./http/AuthServiceHttp";

const dataMode = import.meta.env.VITE_DATA_MODE || "mock";

export const authService: AuthService =
  dataMode === "mock" ? new AuthServiceMock() : new AuthServiceHttp();

export type { AuthService, LoginCredentials, RegisterRequest, Session } from "./interfaces/AuthService";
