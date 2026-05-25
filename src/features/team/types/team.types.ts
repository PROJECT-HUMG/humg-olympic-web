import { BadgeItem } from "@/features/auth/types/auth.types";

export type TeamStatus = "ACTIVE" | "FINISHED" | "PENDING";
export type MemberRole =
  | "HEAD_COACH"
  | "DEPUTY_COACH"
  | "COACH"
  | "CAPTAIN"
  | "MEMBER";
export type AwardType =
  | "FIRST"
  | "SECOND"
  | "THIRD"
  | "CONSOLATION"
  | "PARTICIPATION";

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface TeamMember {
  userId: number;
  name: string;
  avatar?: string;
  role: MemberRole;
  joinedAt: string;
  award?: AwardType;
  score?: number;
  badges?: BadgeItem[];
  xpPoints?: number;
}

export interface Team {
  id: number;
  slug: string;
  name: string;
  subject: string;
  academicYear: string;
  description: string;
  status: TeamStatus;
  roadmapId?: number;
  avatarUrl?: string;
  members: TeamMember[];
  createdAt: string;
  createdBy: number;
}

export interface CreateTeamPayload {
  name: string;
  subject: string;
  description: string;
  academicYear: string;
  avatarUrl?: string;
}

export interface UpdateTeamPayload {
  name?: string;
  description?: string;
  status?: TeamStatus;
  academicYear?: string;
  avatarUrl?: string;
}

export interface AddMemberPayload {
  email?: string;
  userId?: number;
  role: MemberRole;
}

export interface GetTeamsParams {
  page?: number;
  size?: number;
  userId?: number;
  role?: MemberRole;
  academicYear?: string;
}
