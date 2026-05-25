import { RankingRepository } from "./RankingRepository";
import { ApiRankingRepository } from "./ApiRankingRepository";

export const rankingRepository: RankingRepository = new ApiRankingRepository();
