/**
 * HTTP implementation of DashboardService (stub for Phase 11).
 */

import type { DashboardService, DashboardMetrics } from "../interfaces/DashboardService";

export class DashboardServiceHttp implements DashboardService {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // TODO: Phase 11 - Implement HTTP API calls
    throw new Error("DashboardServiceHttp not implemented yet. Phase 11: Backend Integration");
  }
}
