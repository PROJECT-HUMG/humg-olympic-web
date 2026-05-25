import { useState, useEffect, useCallback } from "react";
import { rankingRepository } from "@/features/ranking/api";
import { LeaderboardEntry } from "@/features/ranking/types/ranking.types";

export const useLeaderboard = (pageSize: number = 20, page: number = 1) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rankingRepository.getLeaderboard({
        page,
        size: pageSize,
      });
      setEntries(data.data || []);
      const calculatedTotalPages = Math.ceil(
        (data.total || 0) / (data.limit || pageSize),
      );
      setTotalPages(calculatedTotalPages);
      setTotalElements(data.total || 0);
    } catch (error) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    loading,
    totalPages,
    totalElements,
    refresh: fetchLeaderboard,
  };
};
