import type {
  StaffService,
  CreateStaffRequest,
  UpdateStaffRequest
} from "../interfaces/StaffService";
import { mockStore, type Staff } from "./store";
import { authService } from "../index";

/**
 * Mock implementation of StaffService.
 * Uses in-memory store for staff management.
 */
export class StaffServiceMock implements StaffService {
  /**
   * Get current session tenant ID
   */
  private getTenantId(): string {
    const session = authService.getSession();
    if (!session) {
      throw new Error("UNAUTHORIZED");
    }
    return session.tenant.id;
  }

  async getStaff(): Promise<Staff[]> {
    const tenantId = this.getTenantId();
    return mockStore.getStaffByTenant(tenantId);
  }

  async getStaffById(id: string): Promise<Staff | null> {
    const tenantId = this.getTenantId();
    const staff = mockStore.getStaffById(id);

    if (!staff) {
      return null;
    }

    // Ensure staff belongs to current tenant
    if (staff.tenantId !== tenantId) {
      return null;
    }

    return staff;
  }

  async createStaff(request: CreateStaffRequest): Promise<Staff> {
    const tenantId = this.getTenantId();

    // Validate required fields
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

  async updateStaff(id: string, request: UpdateStaffRequest): Promise<Staff> {
    const tenantId = this.getTenantId();
    const staff = mockStore.getStaffById(id);

    if (!staff) {
      throw new Error("STAFF_NOT_FOUND");
    }

    // Ensure staff belongs to current tenant
    if (staff.tenantId !== tenantId) {
      throw new Error("STAFF_NOT_FOUND");
    }

    // Validate role if provided
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

  async deleteStaff(id: string): Promise<void> {
    const tenantId = this.getTenantId();
    const staff = mockStore.getStaffById(id);

    if (!staff) {
      throw new Error("STAFF_NOT_FOUND");
    }

    // Ensure staff belongs to current tenant
    if (staff.tenantId !== tenantId) {
      throw new Error("STAFF_NOT_FOUND");
    }

    mockStore.deleteStaff(id);
  }
}
