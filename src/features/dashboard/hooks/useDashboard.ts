import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardRepository } from "@/features/dashboard/api";

const fetchDashboardByRole = (role: string) => {
  if (role === "ADMIN") return dashboardRepository.getAdminDashboard();
  if (role === "LECTURER") return dashboardRepository.getLecturerDashboard();
  return dashboardRepository.getStudentDashboard();
};

export const useDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data = null, isLoading: loading } = useQuery({
    queryKey: ["dashboard", user?.role, user?.id],
    queryFn: () => fetchDashboardByRole(user!.role),
    enabled: !!user?.id && !!user?.role,
    staleTime: 30_000,
  });

  useEffect(() => {
    const handleRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    };
    window.addEventListener("dashboard:refresh", handleRefresh);
    return () => window.removeEventListener("dashboard:refresh", handleRefresh);
  }, [queryClient]);

  return {
    data,
    loading,
    userRole: user?.role,
  };
};
