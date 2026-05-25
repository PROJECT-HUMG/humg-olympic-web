import { useCallback, useTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { competitionRepository } from "@/features/competitions/api";
import type { CompetitionUpdateRequest } from "@/features/competitions/types/competition.types";
import { extractErrorMessage } from "@/utils/errorUtils";
import i18n from '@/i18n';

export const useCompetitionDetail = (slug: string | null) => {
  const queryClient = useQueryClient();
  const isValidSlug = !!slug;

  /* ── Fetch competition detail ── */
  const {
    data: competition = null,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["competition", slug],
    queryFn: () => competitionRepository.getCompetitionBySlug(slug!),
    enabled: isValidSlug,
  });

  const error = queryError
    ? extractErrorMessage(queryError, i18n.t('features:competitions.hooks.loadError'))
    : null;

  /* ── Mutations ── */
  const [isRegistering, startRegisterTransition] = useTransition();
  const [isSettingFeatured, startFeaturedTransition] = useTransition();

  const invalidateDetail = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["competition", slug] });
    queryClient.invalidateQueries({ queryKey: ["competitions"] });
  }, [queryClient, slug]);

  const register = async () => {
    if (!competition) return { success: false, message: i18n.t('features:competitions.hooks.dataNotReady') };

    return new Promise<{ success: boolean; message: string }>((resolve) => {
      startRegisterTransition(async () => {
        try {
          const response = await competitionRepository.registerCompetition(competition.id);
          invalidateDetail();
          resolve({ success: true, message: response.message });
        } catch (err: unknown) {
          const msg = extractErrorMessage(err, i18n.t('features:competitions.hooks.registerFailed'));
          resolve({ success: false, message: msg });
        }
      });
    });
  };

  const setFeatured = useCallback(
    async (competitionId: number, featured: boolean) => {
      return new Promise<Awaited<ReturnType<typeof competitionRepository.setFeatured>>>((resolve, reject) => {
        startFeaturedTransition(async () => {
          try {
            const updated = await competitionRepository.setFeatured(competitionId, featured);
            invalidateDetail();
            resolve(updated);
          } catch (err) {
            reject(err);
          }
        });
      });
    },
    [invalidateDetail],
  );

  const updateMutation = useMutation({
    mutationFn: ({ data, image }: { data: CompetitionUpdateRequest; image?: File }) => {
      if (!competition) throw new Error(i18n.t('features:competitions.hooks.noData'));
      return competitionRepository.updateCompetition(competition.id, data, image);
    },
    onSuccess: () => invalidateDetail(),
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!competition) throw new Error(i18n.t('features:competitions.hooks.noData'));
      return competitionRepository.deleteCompetition(competition.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
    },
  });

  const updateCompetition = useCallback(
    async (data: CompetitionUpdateRequest, image?: File) => {
      return updateMutation.mutateAsync({ data, image });
    },
    [updateMutation],
  );

  const deleteCompetition = useCallback(async () => {
    return deleteMutation.mutateAsync();
  }, [deleteMutation]);

  return {
    competition,
    loading: loading && isValidSlug,
    error,
    refresh: invalidateDetail,
    register,
    isRegistering,
    isSettingFeatured,
    setFeatured,
    updateCompetition,
    deleteCompetition,
  };
};
