/**
 * Staff service contract. Implementations: StaffServiceMock (mock) | StaffServiceHttp (http).
 */

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

export interface StaffService {
  /**
   * Get all staff members for the current tenant
   */
  getStaff(): Promise<Staff[]>;

  /**
   * Get a staff member by ID
   */
  getStaffById(id: string): Promise<Staff | null>;

  /**
   * Create a new staff member
   */
  createStaff(request: CreateStaffRequest): Promise<Staff>;

  /**
   * Update an existing staff member
   */
  updateStaff(id: string, request: UpdateStaffRequest): Promise<Staff>;

  /**
   * Delete a staff member
   */
  deleteStaff(id: string): Promise<void>;
}
