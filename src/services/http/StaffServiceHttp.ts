import type {
  StaffService,
  CreateStaffRequest,
  UpdateStaffRequest
} from "../interfaces/StaffService";

/**
 * HTTP implementation of StaffService.
 * Stub for Phase 11 (Backend Integration).
 */
export class StaffServiceHttp implements StaffService {
  async getStaff(): Promise<import("../mock/store").Staff[]> {
    throw new Error("StaffServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async getStaffById(_id: string): Promise<import("../mock/store").Staff | null> {
    throw new Error("StaffServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async createStaff(_request: CreateStaffRequest): Promise<import("../mock/store").Staff> {
    throw new Error("StaffServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async updateStaff(_id: string, _request: UpdateStaffRequest): Promise<import("../mock/store").Staff> {
    throw new Error("StaffServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }

  async deleteStaff(_id: string): Promise<void> {
    throw new Error("StaffServiceHttp not implemented. Use VITE_DATA_MODE=mock for now.");
  }
}
