import { TeamMember } from "@/features/team/types/team.types";
import { AdminReport } from "@/features/admin/types/admin.types";


/**
 * Generic pagination response wrapper from backend
 */
export interface PagedResponse<T> {
  data: T[];
  total: number; // Total record count
  page: number; // Current page (starts from 1)
  limit: number; // Records per page
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number; // Default: 1
  limit?: number; // Default: 10
  search?: string; // Search keyword (optional)
  sortBy?: string; // Sort field (optional)
  sortOrder?: "asc" | "desc"; // Sort direction (optional)
}

/**
 * Activity feed item
 */
export interface DashboardActivity {
  id: string;
  text: string; // Activity description
  time: string; // Relative time (e.g., "2 giờ trước", "Hôm qua")
  type: "info" | "success" | "warning";
}

/**
 * Pending task for lecturers
 */
export interface DashboardPendingTask {
  id: number;
  title: string;
  description: string;
  type: "COMPETITION" | "NEWS" | "RESOURCE" | "TEAM" | "EXAM" | "OTHER";
  priority: "low" | "medium" | "high";
  status: "PENDING" | "DONE" | "IN_PROGRESS" | "CANCELLED";
  dueAt?: string | null; // ISO datetime
}

/**
 * Calendar event
 */
export interface DashboardEvent {
  id: number;
  dateLabel: string; // Month abbreviation (e.g., "Thg 2")
  day: string; // Day number (e.g., "10")
  title: string; // Event title
  time: string; // Time (e.g., "08:00")
  location: string; // Location (e.g., "Phòng A401")
}

/**
 * Team summary for dashboard display (Olympic competition teams)
 * Maps to Team type from team.types.ts
 */
export interface DashboardTeamSummary {
  id: number;
  slug: string;
  name: string; // Team display name (e.g., "Đội tuyển Toán Olympic 2026")
  subject: string; // Subject/discipline (e.g., "Toán", "Vật lý", "Hóa học")
  academicYear: string; // Academic year (e.g., "2025-2026")
  description: string; // Team description
  status: "ACTIVE" | "FINISHED" | "PENDING"; // Team status (from TeamStatus)
  roadmapId?: number; // Associated roadmap ID (if any)
  roadmapName?: string; // Roadmap name for display
  avatarUrl?: string; // Team avatar URL
  members: TeamMember[]; // Team members
  createdAt: string; // Creation timestamp
}

/**
 * Approval request item for admin dashboard
 */
export interface DashboardApprovalItem {
  id: number;
  title: string;
  description: string;
  type: "COMPETITION" | "NEWS" | "RESOURCE" | "TEAM" | "USER";
  priority: "low" | "medium" | "high";
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string; // ISO datetime
}

/**
 * System alert for admin monitoring
 * @deprecated Use AdminReport from admin.types.ts instead
 */
export interface DashboardSystemAlert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

/**
 * Admin-specific dashboard data
 */
export interface DashboardAdminData {
  approvals: DashboardApprovalItem[]; // Pending approval requests
  alerts: DashboardSystemAlert[]; // System alerts (legacy)
  reports?: AdminReport[]; // Forum reports
  audits: DashboardActivity[]; // Activity log/audit trail
  entityCounts?: {                     // Category counts (from backend, eliminates 8 separate API calls)
    badges: number;
    universities: number;
    faculties: number;
    users: number;
    resourceCategories: number;
    subjects: number;
    forumCategories: number;
    heroSlides: number;
  };
}

/**
 * Lecturer-specific dashboard data
 */
export interface DashboardLecturerData {
  pendingTasks: DashboardPendingTask[]; // Tasks requiring attention
}

/**
 * DTO for creating calendar events
 */
export interface CreateEventDTO {
  title: string;
  date: string; // ISO date string or formatted date
  time: string;
  location: string;
  type: string; // Event type/category
}

/**
 * Main dashboard data structure
 * Contains role-specific data based on user type (Student/Lecturer/Admin)
 */
export interface DashboardData {
  activities: DashboardActivity[]; // Recent activity feed
  events: DashboardEvent[]; // Upcoming calendar events
  teams?: DashboardTeamSummary[]; // Olympic teams (for Students/Lecturers)
  lecturer?: DashboardLecturerData; // Lecturer-specific data
  admin?: DashboardAdminData; // Admin-specific data
}
