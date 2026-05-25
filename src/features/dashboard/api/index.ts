import { DashboardRepository } from "./DashboardRepository";
import { ApiDashboardRepository } from "./ApiDashboardRepository";

export const dashboardRepository: DashboardRepository =
  new ApiDashboardRepository();
