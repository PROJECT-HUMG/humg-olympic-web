import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { competitionRepository } from "@/features/competitions/api";
import type { CompetitionSummary, Subject } from "@/features/competitions/types/competition.types";
import i18n from '@/i18n';

export interface FilterOption {
  id: string;
  label: string;
}

const COMPETITIONS_PAGE_SIZE = 10;

interface UseCompetitionsParams {
  page?: number;
  subjectId?: number | string;
  search?: string;
}

export const useCompetitions = ({
  page = 0,
  subjectId = "all",
  search = "",
}: UseCompetitionsParams = {}) => {
  const queryClient = useQueryClient();

  /* ── Featured competition + subjects (loaded once) ── */
  const { data: featuredCompetition = null, isLoading: loadingFeatured } = useQuery({
    queryKey: ["competitions", "featured"],
    queryFn: () => competitionRepository.getFeaturedCompetition(),
  });

  const { data: rawSubjects = [] } = useQuery({
    queryKey: ["competitions", "subjects"],
    queryFn: () => competitionRepository.getSubjects(),
    staleTime: 5 * 60_000,
  });

  const subjects: FilterOption[] = [
    { id: "all", label: i18n.t('features:competitions.page.filterAll') },
    ...rawSubjects.map((s: Subject) => ({ id: String(s.id), label: s.name })),
  ];

  /* ── Paginated competition list ── */
  const {
    data: listResponse,
    isLoading: loadingList,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["competitions", "list", { subjectId, search, page }],
    queryFn: () =>
      competitionRepository.getCompetitions({
        subjectId,
        search,
        page,
        limit: COMPETITIONS_PAGE_SIZE,
      }),
    placeholderData: (prev) => prev,
  });

  const competitions: CompetitionSummary[] = listResponse?.data ?? [];
  const totalElements = listResponse?.total ?? 0;

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["competitions"] });
  }, [queryClient]);

  return {
    competitions,
    featuredCompetition,
    subjects,
    loading: loadingList || loadingFeatured,
    loadingList: loadingList || isPlaceholderData,
    activeSubject: subjectId,
    searchQuery: search,
    page,
    totalElements,
    totalPages: Math.ceil(totalElements / COMPETITIONS_PAGE_SIZE),
    refresh,
  };
};
