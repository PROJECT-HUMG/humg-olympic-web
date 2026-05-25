import { BadgeItem, User, UserRole } from "@/features/auth/types/auth.types";

export interface AdminBadgeUpsertRequest {
  name: string;
  description: string;
  type: BadgeItem["type"];
  subject: BadgeItem["subject"];
  level: number;
  iconUrl?: string | null;
}

export interface AdminUniversityUpsertRequest {
  name: string;
}

export interface AdminFacultyUpsertRequest {
  name: string;
  universityId: number;
}

export interface AdminCreateUserRequest {
  fullName: string;
  displayName?: string;
  email: string;
  role: UserRole;
  degree?: string | null;
  universityId?: number | null;
  facultyId?: number | null;
  className?: string | null;
  phone?: string | null;
  password: string;
}

export interface AdminUpdateUserRequest {
  fullName?: string;
  displayName?: string;
  role?: UserRole;
  degree?: string | null;
  universityId?: number | null;
  facultyId?: number | null;
  className?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface AdminUserResponse extends User {
  universityId?: number | null;
  facultyId?: number | null;
  className?: string | null;
  phone?: string | null;
}

export interface AdminResourceCategoryUpsertRequest {
  label: string;
  color: string;
}

export interface AdminSubjectUpsertRequest {
  name: string;
  code: string;
  description?: string;
  color?: string;
}

export interface AdminForumCategoryUpsertRequest {
  name: string;
  icon: string;
}

export interface AdminHeroSlideUpsertRequest {
  label: string;
  title: string;
  imageFile?: File;
}

export interface AdminBulkRequest<T = Record<string, any>> {
  ids: Array<number | string>;
  data?: T;
}

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface AdminReport {
  id: number;
  postId: number;
  postTitle: string;
  reporter: {
    id: number;
    fullName: string;
    avatarUrl: string | null;
  };
  reason: 'SPAM' | 'OFFENSIVE' | 'MISINFORMATION' | 'OTHER';
  description: string | null;
  status: ReportStatus;
  created: string;
}
