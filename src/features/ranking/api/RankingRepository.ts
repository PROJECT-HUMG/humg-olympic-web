import {
  LeaderboardResponse,
  LeaderboardQueryParams,
} from "@/features/ranking/types/ranking.types";

export interface RankingRepository {
  getLeaderboard(params: LeaderboardQueryParams): Promise<LeaderboardResponse>;
}
