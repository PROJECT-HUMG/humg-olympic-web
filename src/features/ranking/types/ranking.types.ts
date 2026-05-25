/**
 * Ranking & Leaderboard Types
 * Based on FRONTEND_INTEGRATION_GUIDE.md
 */

import { BadgeItem } from "@/features/auth/types/auth.types";

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  fullName: string;
  avatarUrl: string | null;
  xpPoints: number; // Backend trả về xpPoints (điểm kinh nghiệm)
  role?: string;
  selectedBadges: BadgeItem[]; // Backend trả về BadgeItem structure
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  page: number;
  limit: number;
  total: number;
}

export interface LeaderboardQueryParams {
  page?: number;
  size?: number;
}
