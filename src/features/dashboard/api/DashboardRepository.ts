import {
  DashboardData,
  CreateEventDTO,
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
import { BadgeItem } from "@/features/auth/types/auth.types";

export interface DashboardRepository {
  getStudentDashboard(): Promise<DashboardData>;
  getLecturerDashboard(): Promise<DashboardData>;
  getAdminDashboard(): Promise<DashboardData>;

  createEvent(data: CreateEventDTO): Promise<{ id: number }>;
  updateEvent(id: number, data: CreateEventDTO): Promise<boolean>;
  deleteEvent(id: number): Promise<boolean>;
  updateApprovalStatus(
    id: number,
    status: "APPROVED" | "REJECTED",
    note?: string,
  ): Promise<boolean>;
  updatePendingTaskStatus(
    id: number,
    status: "DONE" | "IN_PROGRESS" | "CANCELLED",
  ): Promise<boolean>;

  createBadge(data: AdminBadgeUpsertRequest): Promise<BadgeItem>;
  updateBadge(id: number, data: AdminBadgeUpsertRequest): Promise<BadgeItem>;
  deleteBadge(id: number): Promise<boolean>;
  getBadges(params?: PaginationParams): Promise<PagedResponse<BadgeItem>>;

  createUniversity(data: AdminUniversityUpsertRequest): Promise<University>;
  updateUniversity(
    id: number,
    data: AdminUniversityUpsertRequest,
  ): Promise<University>;
  deleteUniversity(id: number): Promise<boolean>;
  getUniversities(
    params?: PaginationParams,
  ): Promise<PagedResponse<University>>;

  createFaculty(data: AdminFacultyUpsertRequest): Promise<FacultyResponse>;
  updateFaculty(
    id: number,
    data: AdminFacultyUpsertRequest,
  ): Promise<FacultyResponse>;
  deleteFaculty(id: number): Promise<boolean>;
  getFaculties(
    params?: PaginationParams,
  ): Promise<PagedResponse<FacultyResponse>>;

  createUser(data: AdminCreateUserRequest): Promise<AdminUserResponse>;
  updateUser(
    id: number,
    data: AdminUpdateUserRequest,
  ): Promise<AdminUserResponse>;
  deleteUser(id: number | string): Promise<boolean>;
  getUsers(
    params?: PaginationParams,
  ): Promise<PagedResponse<AdminUserResponse>>;

  createResourceCategory(
    data: AdminResourceCategoryUpsertRequest,
  ): Promise<ResourceCategory>;
  updateResourceCategory(
    id: number,
    data: AdminResourceCategoryUpsertRequest,
  ): Promise<ResourceCategory>;
  deleteResourceCategory(id: number): Promise<boolean>;
  getResourceCategories(
    params?: PaginationParams,
  ): Promise<PagedResponse<ResourceCategory>>;

  createSubject(data: AdminSubjectUpsertRequest): Promise<Subject>;
  updateSubject(id: number, data: AdminSubjectUpsertRequest): Promise<Subject>;
  deleteSubject(id: number): Promise<boolean>;
  getSubjects(params?: PaginationParams): Promise<PagedResponse<Subject>>;

  createForumCategory(
    data: AdminForumCategoryUpsertRequest,
  ): Promise<ForumCategory>;
  updateForumCategory(
    id: number,
    data: AdminForumCategoryUpsertRequest,
  ): Promise<ForumCategory>;
  deleteForumCategory(id: number): Promise<boolean>;
  getForumCategories(
    params?: PaginationParams,
  ): Promise<PagedResponse<ForumCategory>>;

  createHeroSlide(
    data: AdminHeroSlideUpsertRequest,
  ): Promise<HeroSlideResponse>;
  updateHeroSlide(
    id: number | string,
    data: AdminHeroSlideUpsertRequest,
  ): Promise<HeroSlideResponse>;
  deleteHeroSlide(id: number | string): Promise<boolean>;
  getHeroSlides(
    params?: PaginationParams,
  ): Promise<PagedResponse<HeroSlideResponse>>;

  getReports(
    params?: PaginationParams & { status?: ReportStatus },
  ): Promise<PagedResponse<AdminReport>>;
  resolveReport(
    reportId: number,
    data: { status: ReportStatus; action: 'DELETE_POST' | 'WARN_USER' | 'NONE' },
  ): Promise<{ message: string }>;
}
