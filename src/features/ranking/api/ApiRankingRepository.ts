import { RankingRepository } from "./RankingRepository";
import { api } from "@/lib/api/apiClient";
import {
  LeaderboardResponse,
  LeaderboardQueryParams,
} from "@/features/ranking/types/ranking.types";

export class ApiRankingRepository implements RankingRepository {
  async getLeaderboard(
    params: LeaderboardQueryParams,
  ): Promise<LeaderboardResponse> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append("page", params.page.toString());
    if (params.size !== undefined) query.append("size", params.size.toString());
    return api.get<LeaderboardResponse>(`/ranks?${query.toString()}`);
  }
}
