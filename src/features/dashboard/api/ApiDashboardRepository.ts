import { api, authenticatedFetch } from "@/lib/api/apiClient";
import { DashboardRepository } from "./DashboardRepository";
import {
  CreateEventDTO,
  DashboardData,
  PagedResponse,
  PaginationParams,
} from "../types/dashboard.types";
import {
  AdminBadgeUpsertRequest,
  AdminFacultyUpsertRequest,
  AdminUniversityUpsertRequest,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  AdminUserResponse,
  AdminResourceCategoryUpsertRequest,
  AdminSubjectUpsertRequest,
  AdminForumCategoryUpsertRequest,
  AdminHeroSlideUpsertRequest,
  AdminReport,
  ReportStatus,
} from "@/features/admin/types/admin.types";
import { University, FacultyResponse } from "@/features/university/types/university.types";
import { ResourceCategory } from "@/features/resources/types/resources.types";
import { Subject } from "@/features/competitions/types/competition.types";
import { Category as ForumCategory } from "@/features/forum/types/forum.types";
import { HeroSlideResponse } from "@/features/hero/types/hero.types";
import { API_BASE_URL } from "@/lib/api/apiConfig";
import { BadgeItem } from "@/features/auth/types/auth.types";

/**
 * Build query string from pagination params
 */
const buildQueryString = (params: PaginationParams = {}): string => {
  const queryParams = new URLSearchParams();
  const { page = 1, limit = 10, search, sortBy, sortOrder } = params;

  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));

  if (search?.trim()) {
    queryParams.set("search", search.trim());
  }
  if (sortBy) {
    queryParams.set("sortBy", sortBy);
  }
  if (sortOrder) {
    queryParams.set("sortOrder", sortOrder);
  }

  return queryParams.toString();
};

export class ApiDashboardRepository implements DashboardRepository {
  async getStudentDashboard(): Promise<DashboardData> {
    return api.get<DashboardData>("/dashboard/student");
  }

  async getLecturerDashboard(): Promise<DashboardData> {
    return api.get<DashboardData>("/dashboard/lecturer");
  }

  async getAdminDashboard(): Promise<DashboardData> {
    return api.get<DashboardData>("/dashboard/admin");
  }

  async createEvent(data: CreateEventDTO): Promise<{ id: number }> {
    return api.post<{ id: number }>("/dashboard/events", data);
  }

  async updateEvent(id: number, data: CreateEventDTO): Promise<boolean> {
    await api.put(`/dashboard/events/${id}`, data);
    return true;
  }

  async deleteEvent(id: number): Promise<boolean> {
    await api.delete(`/dashboard/events/${id}`);
    return true;
  }

  async updateApprovalStatus(
    id: number,
    status: "APPROVED" | "REJECTED",
    note?: string,
  ): Promise<boolean> {
    await api.patch(`/dashboard/approvals/${id}`, { status, note });
    return true;
  }

  async updatePendingTaskStatus(
    id: number,
    status: "DONE" | "IN_PROGRESS" | "CANCELLED",
  ): Promise<boolean> {
    await api.patch(`/dashboard/tasks/${id}`, { status });
    return true;
  }

  async createBadge(data: AdminBadgeUpsertRequest): Promise<BadgeItem> {
    return api.post<BadgeItem>("/admin/badges", data);
  }

  async updateBadge(
    id: number,
    data: AdminBadgeUpsertRequest,
  ): Promise<BadgeItem> {
    return api.put<BadgeItem>(`/admin/badges/${id}`, data);
  }

  async deleteBadge(id: number): Promise<boolean> {
    await api.delete(`/admin/badges/${id}`);
    return true;
  }

  async getBadges(
    params: PaginationParams = {},
  ): Promise<PagedResponse<BadgeItem>> {
    return api.get<PagedResponse<BadgeItem>>(
      `/admin/badges?${buildQueryString(params)}`,
    );
  }

  async createUniversity(
    data: AdminUniversityUpsertRequest,
  ): Promise<University> {
    return api.post<University>("/admin/universities", data);
  }

  async updateUniversity(
    id: number,
    data: AdminUniversityUpsertRequest,
  ): Promise<University> {
    return api.put<University>(`/admin/universities/${id}`, data);
  }

  async deleteUniversity(id: number): Promise<boolean> {
    await api.delete(`/admin/universities/${id}`);
    return true;
  }

  async getUniversities(
    params: PaginationParams = {},
  ): Promise<PagedResponse<University>> {
    return api.get<PagedResponse<University>>(
      `/admin/universities?${buildQueryString(params)}`,
    );
  }

  async createFaculty(
    data: AdminFacultyUpsertRequest,
  ): Promise<FacultyResponse> {
    return api.post<FacultyResponse>("/admin/faculties", data);
  }

  async updateFaculty(
    id: number,
    data: AdminFacultyUpsertRequest,
  ): Promise<FacultyResponse> {
    return api.put<FacultyResponse>(`/admin/faculties/${id}`, data);
  }

  async deleteFaculty(id: number): Promise<boolean> {
    await api.delete(`/admin/faculties/${id}`);
    return true;
  }

  async getFaculties(
    params: PaginationParams = {},
  ): Promise<PagedResponse<FacultyResponse>> {
    return api.get<PagedResponse<FacultyResponse>>(
      `/admin/faculties?${buildQueryString(params)}`,
    );
  }

  async createUser(data: AdminCreateUserRequest): Promise<AdminUserResponse> {
    return api.post<AdminUserResponse>("/admin/users", data);
  }

  async updateUser(
    id: number,
    data: AdminUpdateUserRequest,
  ): Promise<AdminUserResponse> {
    return api.put<AdminUserResponse>(`/admin/users/${id}`, data);
  }

  async deleteUser(id: number | string): Promise<boolean> {
    await api.delete(`/admin/users/${id}`);
    return true;
  }

  async getUsers(
    params: PaginationParams = {},
  ): Promise<PagedResponse<AdminUserResponse>> {
    return api.get<PagedResponse<AdminUserResponse>>(
      `/admin/users?${buildQueryString(params)}`,
    );
  }

  async createResourceCategory(
    data: AdminResourceCategoryUpsertRequest,
  ): Promise<ResourceCategory> {
    return api.post<ResourceCategory>("/admin/resource-categories", data);
  }

  async updateResourceCategory(
    id: number,
    data: AdminResourceCategoryUpsertRequest,
  ): Promise<ResourceCategory> {
    return api.put<ResourceCategory>(`/admin/resource-categories/${id}`, data);
  }

  async deleteResourceCategory(id: number): Promise<boolean> {
    await api.delete(`/admin/resource-categories/${id}`);
    return true;
  }

  async createSubject(data: AdminSubjectUpsertRequest): Promise<Subject> {
    return api.post<Subject>("/admin/subjects", data);
  }

  async updateSubject(
    id: number,
    data: AdminSubjectUpsertRequest,
  ): Promise<Subject> {
    return api.put<Subject>(`/admin/subjects/${id}`, data);
  }

  async deleteSubject(id: number): Promise<boolean> {
    await api.delete(`/admin/subjects/${id}`);
    return true;
  }

  async createForumCategory(
    data: AdminForumCategoryUpsertRequest,
  ): Promise<ForumCategory> {
    return api.post<ForumCategory>("/admin/forum-categories", data);
  }

  async updateForumCategory(
    id: number,
    data: AdminForumCategoryUpsertRequest,
  ): Promise<ForumCategory> {
    return api.put<ForumCategory>(`/admin/forum-categories/${id}`, data);
  }

  async deleteForumCategory(id: number): Promise<boolean> {
    await api.delete(`/admin/forum-categories/${id}`);
    return true;
  }

  async createHeroSlide(
    data: AdminHeroSlideUpsertRequest,
  ): Promise<HeroSlideResponse> {
    const formData = new FormData();
    formData.append("label", data.label);
    formData.append("title", data.title);
    if (data.imageFile) {
      formData.append("image", data.imageFile);
    }

    const response = await authenticatedFetch(
      `${API_BASE_URL}/admin/hero-slides`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create hero slide");
    }

    return response.json();
  }

  async updateHeroSlide(
    id: number | string,
    data: AdminHeroSlideUpsertRequest,
  ): Promise<HeroSlideResponse> {
    const formData = new FormData();
    formData.append("label", data.label);
    formData.append("title", data.title);
    if (data.imageFile) {
      formData.append("image", data.imageFile);
    }

    const response = await authenticatedFetch(
      `${API_BASE_URL}/admin/hero-slides/${id}`,
      {
        method: "PUT",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update hero slide");
    }

    return response.json();
  }

  async deleteHeroSlide(id: number | string): Promise<boolean> {
    await api.delete(`/admin/hero-slides/${id}`);
    return true;
  }

  async getResourceCategories(
    params: PaginationParams = {},
  ): Promise<PagedResponse<ResourceCategory>> {
    return api.get<PagedResponse<ResourceCategory>>(
      `/admin/resource-categories?${buildQueryString(params)}`,
    );
  }

  async getSubjects(
    params: PaginationParams = {},
  ): Promise<PagedResponse<Subject>> {
    return api.get<PagedResponse<Subject>>(
      `/admin/subjects?${buildQueryString(params)}`,
    );
  }

  async getForumCategories(
    params: PaginationParams = {},
  ): Promise<PagedResponse<ForumCategory>> {
    return api.get<PagedResponse<ForumCategory>>(
      `/admin/forum-categories?${buildQueryString(params)}`,
    );
  }

  async getHeroSlides(
    params: PaginationParams = {},
  ): Promise<PagedResponse<HeroSlideResponse>> {
    return api.get<PagedResponse<HeroSlideResponse>>(
      `/admin/hero-slides?${buildQueryString(params)}`,
    );
  }

  async getReports(
    params: PaginationParams & { status?: ReportStatus } = {},
  ): Promise<PagedResponse<AdminReport>> {
    const qs = buildQueryString(params);
    const statusParam = params.status ? `&status=${params.status}` : '';
    return api.get<PagedResponse<AdminReport>>(
      `/admin/reports?${qs}${statusParam}`,
    );
  }

  async resolveReport(
    reportId: number,
    data: { status: ReportStatus; action: 'DELETE_POST' | 'WARN_USER' | 'NONE' },
  ): Promise<{ message: string }> {
    return api.put<{ message: string }>(`/admin/reports/${reportId}`, data);
  }
}
