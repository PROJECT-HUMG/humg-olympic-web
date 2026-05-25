import { useCallback, useTransition } from "react";
import { dashboardRepository } from "@/features/dashboard/api";
import {
  AdminBadgeUpsertRequest,
  AdminCreateUserRequest,
  AdminFacultyUpsertRequest,
  AdminUniversityUpsertRequest,
  AdminUpdateUserRequest,
  AdminResourceCategoryUpsertRequest,
  AdminSubjectUpsertRequest,
  AdminForumCategoryUpsertRequest,
  AdminHeroSlideUpsertRequest,
  ReportStatus,
} from "@/features/admin/types/admin.types";
import { CreateEventDTO, PaginationParams } from "../types/dashboard.types";

export const useDashboardActions = () => {
  const [isSubmitting, startTransition] = useTransition();

  const wrap = useCallback(<T>(fn: () => Promise<T>) => {
    return new Promise<T>((resolve, reject) => {
      startTransition(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }, []);

  const createEvent = useCallback(
    (data: CreateEventDTO) => wrap(() => dashboardRepository.createEvent(data)),
    [wrap],
  );
  const updateEvent = useCallback(
    (id: number, data: CreateEventDTO) =>
      wrap(() => dashboardRepository.updateEvent(id, data)),
    [wrap],
  );
  const deleteEvent = useCallback(
    (id: number) => wrap(() => dashboardRepository.deleteEvent(id)),
    [wrap],
  );
  const updateApprovalStatus = useCallback(
    (id: number, status: "APPROVED" | "REJECTED", note?: string) =>
      wrap(() => dashboardRepository.updateApprovalStatus(id, status, note)),
    [wrap],
  );

  const updatePendingTaskStatus = useCallback(
    (id: number, status: "DONE" | "IN_PROGRESS" | "CANCELLED") =>
      wrap(() => dashboardRepository.updatePendingTaskStatus(id, status)),
    [wrap],
  );

  const createBadge = useCallback(
    (data: AdminBadgeUpsertRequest) =>
      wrap(() => dashboardRepository.createBadge(data)),
    [wrap],
  );
  const updateBadge = useCallback(
    (id: number, data: AdminBadgeUpsertRequest) =>
      wrap(() => dashboardRepository.updateBadge(id, data)),
    [wrap],
  );
  const deleteBadge = useCallback(
    (id: number) => wrap(() => dashboardRepository.deleteBadge(id)),
    [wrap],
  );
  const getBadges = useCallback(
    (params?: PaginationParams) =>
      wrap(() => dashboardRepository.getBadges(params)),
    [wrap],
  );

  const createUniversity = useCallback(
    (data: AdminUniversityUpsertRequest) =>
      wrap(() => dashboardRepository.createUniversity(data)),
    [wrap],
  );
  const updateUniversity = useCallback(
    (id: number, data: AdminUniversityUpsertRequest) =>
      wrap(() => dashboardRepository.updateUniversity(id, data)),
    [wrap],
  );
  const deleteUniversity = useCallback(
    (id: number) => wrap(() => dashboardRepository.deleteUniversity(id)),
    [wrap],
  );
  const getUniversities = useCallback(
    (params?: PaginationParams) =>
      wrap(() => dashboardRepository.getUniversities(params)),
    [wrap],
  );

  const createFaculty = useCallback(
    (data: AdminFacultyUpsertRequest) =>
      wrap(() => dashboardRepository.createFaculty(data)),
    [wrap],
  );
  const updateFaculty = useCallback(
    (id: number, data: AdminFacultyUpsertRequest) =>
      wrap(() => dashboardRepository.updateFaculty(id, data)),
    [wrap],
  );
  const deleteFaculty = useCallback(
    (id: number) => wrap(() => dashboardRepository.deleteFaculty(id)),
    [wrap],
  );
  const getFaculties = useCallback(
    (params?: PaginationParams) =>
      wrap(() => dashboardRepository.getFaculties(params)),
    [wrap],
  );

  const createUser = useCallback(
    (data: AdminCreateUserRequest) =>
      wrap(() => dashboardRepository.createUser(data)),
    [wrap],
  );
  const updateUser = useCallback(
    (id: number, data: AdminUpdateUserRequest) =>
      wrap(() => dashboardRepository.updateUser(id, data)),
    [wrap],
  );
  const deleteUser = useCallback(
    (id: number | string) => wrap(() => dashboardRepository.deleteUser(id)),
    [wrap],
  );
  const getUsers = useCallback(
    (params?: PaginationParams) =>
      wrap(() => dashboardRepository.getUsers(params)),
    [wrap],
  );

  const createResourceCategory = useCallback(
    (data: AdminResourceCategoryUpsertRequest) =>
      wrap(() => dashboardRepository.createResourceCategory(data)),
    [wrap],
  );
  const updateResourceCategory = useCallback(
    (id: number, data: AdminResourceCategoryUpsertRequest) =>
      wrap(() => dashboardRepository.updateResourceCategory(id, data)),
    [wrap],
  );
  const deleteResourceCategory = useCallback(
    (id: number) => wrap(() => dashboardRepository.deleteResourceCategory(id)),
    [wrap],
  );

  const createSubject = useCallback(
    (data: AdminSubjectUpsertRequest) =>
      wrap(() => dashboardRepository.createSubject(data)),
    [wrap],
  );
  const updateSubject = useCallback(
    (id: number, data: AdminSubjectUpsertRequest) =>
      wrap(() => dashboardRepository.updateSubject(id, data)),
    [wrap],
  );
  const deleteSubject = useCallback(
    (id: number) => wrap(() => dashboardRepository.deleteSubject(id)),
    [wrap],
  );

  const createForumCategory = useCallback(
    (data: AdminForumCategoryUpsertRequest) =>
      wrap(() => dashboardRepository.createForumCategory(data)),
    [wrap],
  );
  const updateForumCategory = useCallback(
    (id: number, data: AdminForumCategoryUpsertRequest) =>
      wrap(() => dashboardRepository.updateForumCategory(id, data)),
    [wrap],
  );
  const deleteForumCategory = useCallback(
    (id: number) => wrap(() => dashboardRepository.deleteForumCategory(id)),
    [wrap],
  );

  const createHeroSlide = useCallback(
    (data: AdminHeroSlideUpsertRequest) =>
      wrap(() => dashboardRepository.createHeroSlide(data)),
    [wrap],
  );
  const updateHeroSlide = useCallback(
    (id: number | string, data: AdminHeroSlideUpsertRequest) =>
      wrap(() => dashboardRepository.updateHeroSlide(id, data)),
    [wrap],
  );
  const deleteHeroSlide = useCallback(
    (id: number | string) =>
      wrap(() => dashboardRepository.deleteHeroSlide(id)),
    [wrap],
  );

  const getResourceCategories = useCallback(
    (params?: PaginationParams) =>
      wrap(() => dashboardRepository.getResourceCategories(params)),
    [wrap],
  );
  const getSubjects = useCallback(
    (params?: PaginationParams) =>
      wrap(() => dashboardRepository.getSubjects(params)),
    [wrap],
  );
  const getForumCategories = useCallback(
    (params?: PaginationParams) =>
      wrap(() => dashboardRepository.getForumCategories(params)),
    [wrap],
  );
  const getHeroSlides = useCallback(
    (params?: PaginationParams) =>
      wrap(() => dashboardRepository.getHeroSlides(params)),
    [wrap],
  );

  const getReports = useCallback(
    (params?: PaginationParams & { status?: ReportStatus }) =>
      wrap(() => dashboardRepository.getReports(params)),
    [wrap],
  );
  const resolveReport = useCallback(
    (reportId: number, data: { status: ReportStatus; action: 'DELETE_POST' | 'WARN_USER' | 'NONE' }) =>
      wrap(() => dashboardRepository.resolveReport(reportId, data)),
    [wrap],
  );

  return {
    isSubmitting,
    createEvent,
    updateEvent,
    deleteEvent,
    updateApprovalStatus,
    updatePendingTaskStatus,
    createBadge,
    updateBadge,
    deleteBadge,
    getBadges,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    getUniversities,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    getFaculties,
    createUser,
    updateUser,
    deleteUser,
    getUsers,
    createResourceCategory,
    updateResourceCategory,
    deleteResourceCategory,
    createSubject,
    updateSubject,
    deleteSubject,
    createForumCategory,
    updateForumCategory,
    deleteForumCategory,
    createHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    getResourceCategories,
    getSubjects,
    getForumCategories,
    getHeroSlides,
    getReports,
    resolveReport,
  };
};
