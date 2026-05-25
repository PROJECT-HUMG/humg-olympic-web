import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/utils/errorUtils';
import { userBadgeRepository } from '@/features/auth/api';
import type {
    UserBadgeResponse,
    ReviewBadgeRequest,
    BulkGrantBadgeResult,
    PagedUserBadgeResponse,
    UserBadgePaginationParams,
} from '@/features/badges/types/userBadge.types';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import type { BadgeItem } from '@/features/auth/types/auth.types';

/* ── Query keys ── */
const badgeKeys = {
    myRequests: ['badge-requests', 'mine'] as const,
    pending: (params?: UserBadgePaginationParams) => ['badge-requests', 'pending', params] as const,
    userBadges: (userId: number) => ['badge-requests', 'user', userId] as const,
};

/* ── Hook: my requests (auto-fetch) ── */
export const useMyBadgeRequests = () => {
    const { data: myRequests = [], isLoading, refetch } = useQuery({
        queryKey: badgeKeys.myRequests,
        queryFn: () => userBadgeRepository.getMyRequests(),
    });

    return { myRequests, isLoading, fetchMyRequests: refetch };
};

/* ── Hook: pending requests with pagination ── */
export const usePendingBadgeRequests = (params?: UserBadgePaginationParams) => {
    const { data: pendingRequests = null, isLoading, refetch } = useQuery({
        queryKey: badgeKeys.pending(params),
        queryFn: () => userBadgeRepository.getPendingRequests(params),
        enabled: params !== undefined,
    });

    return {
        pendingRequests,
        isLoading,
        fetchPendingRequests: refetch,
    };
};

/* ── Hook: user badges (imperative) ── */
export const useUserBadgesQuery = (userId: number | null) => {
    const { data: badges = null, isLoading, refetch } = useQuery({
        queryKey: badgeKeys.userBadges(userId ?? 0),
        queryFn: () => userBadgeRepository.getUserBadges(userId!),
        enabled: userId !== null,
    });

    return { badges, isLoading, refetch };
};

/* ── Hook: all badge mutations ── */
export const useBadgeMutations = () => {
    const queryClient = useQueryClient();

    const invalidateAll = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['badge-requests'] });
    }, [queryClient]);

    const requestBadgeMutation = useMutation({
        mutationFn: ({ badgeId, proofImage }: { badgeId: number; proofImage: File }) =>
            userBadgeRepository.requestBadge({ badgeId, proofImage }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: badgeKeys.myRequests });
            showToast(i18n.t('features:badges.requestSent'), 'success');
        },
        onError: (error: unknown) => {
            showToast(extractErrorMessage(error, i18n.t('features:badges.error')), 'error');
        },
    });

    const reviewRequestMutation = useMutation({
        mutationFn: ({ id, approved, rejectReason }: { id: number; approved: boolean; rejectReason?: string }) => {
            const payload: ReviewBadgeRequest = {
                approved,
                rejectReason: approved ? null : rejectReason,
            };
            return userBadgeRepository.reviewBadgeRequest(id, payload);
        },
        onSuccess: (_data, variables) => {
            invalidateAll();
            showToast(
                variables.approved ? i18n.t('features:badges.approved') : i18n.t('features:badges.rejected'),
                variables.approved ? 'success' : 'info',
            );
        },
        onError: (error: unknown) => {
            showToast(extractErrorMessage(error, i18n.t('features:badges.error')), 'error');
        },
    });

    const bulkGrantBadgesMutation = useMutation({
        mutationFn: ({ file, badgeType }: { file: File; badgeType: 'SCHOOL' | 'NATIONAL' }) =>
            userBadgeRepository.bulkGrantBadges(file, badgeType),
        onSuccess: (result) => {
            invalidateAll();
            if (result.failedCount === 0) {
                showToast(i18n.t('features:badges.bulkGrantAllSuccess', { count: result.successCount }), 'success');
            } else {
                showToast(
                    i18n.t('features:badges.bulkGrantPartial', { success: result.successCount, total: result.totalRows, failed: result.failedCount }),
                    'warning',
                );
            }
        },
        onError: (error: unknown) => {
            showToast(extractErrorMessage(error, i18n.t('features:badges.error')), 'error');
        },
    });

    const grantBadgeToUserMutation = useMutation({
        mutationFn: ({ userId, badgeId }: { userId: number; badgeId: number }) =>
            userBadgeRepository.grantBadgeToUser(userId, badgeId),
        onSuccess: () => {
            invalidateAll();
            showToast(i18n.t('features:badges.grantSuccess'), 'success');
        },
        onError: (error: unknown) => {
            showToast(extractErrorMessage(error, i18n.t('features:badges.error')), 'error');
        },
    });

    const revokeBadgeMutation = useMutation({
        mutationFn: ({ userId, badgeId }: { userId: number; badgeId: number }) =>
            userBadgeRepository.revokeBadge(userId, badgeId),
        onSuccess: () => {
            invalidateAll();
            showToast(i18n.t('features:badges.revokeSuccess'), 'success');
        },
        onError: (error: unknown) => {
            showToast(extractErrorMessage(error, i18n.t('features:badges.error')), 'error');
        },
    });

    return {
        requestBadge: requestBadgeMutation,
        reviewRequest: reviewRequestMutation,
        bulkGrantBadges: bulkGrantBadgesMutation,
        grantBadgeToUser: grantBadgeToUserMutation,
        revokeBadge: revokeBadgeMutation,
        isSubmitting:
            requestBadgeMutation.isPending ||
            reviewRequestMutation.isPending ||
            bulkGrantBadgesMutation.isPending ||
            grantBadgeToUserMutation.isPending ||
            revokeBadgeMutation.isPending,
    };
};

/* ── Legacy wrapper: preserves useBadgeRequests() API surface ── */
export const useBadgeRequests = () => {
    const queryClient = useQueryClient();
    const mutations = useBadgeMutations();

    const requestBadge = useCallback(
        async (badgeId: number, proofImage: File): Promise<UserBadgeResponse | null> => {
            try {
                return await mutations.requestBadge.mutateAsync({ badgeId, proofImage });
            } catch {
                return null;
            }
        },
        [mutations.requestBadge],
    );

    const fetchMyRequests = useCallback(async (): Promise<UserBadgeResponse[] | null> => {
        try {
            const data = await queryClient.fetchQuery({
                queryKey: badgeKeys.myRequests,
                queryFn: () => userBadgeRepository.getMyRequests(),
            });
            return data;
        } catch (error: unknown) {
            showToast(extractErrorMessage(error, i18n.t('features:badges.error')), 'error');
            return null;
        }
    }, [queryClient]);

    const fetchPendingRequests = useCallback(
        async (params?: UserBadgePaginationParams): Promise<PagedUserBadgeResponse | null> => {
            try {
                return await queryClient.fetchQuery({
                    queryKey: badgeKeys.pending(params),
                    queryFn: () => userBadgeRepository.getPendingRequests(params),
                });
            } catch (error: unknown) {
                showToast(extractErrorMessage(error, i18n.t('features:badges.error')), 'error');
                return null;
            }
        },
        [queryClient],
    );

    const reviewRequest = useCallback(
        async (id: number, approved: boolean, rejectReason?: string): Promise<UserBadgeResponse | null> => {
            try {
                return await mutations.reviewRequest.mutateAsync({ id, approved, rejectReason });
            } catch {
                return null;
            }
        },
        [mutations.reviewRequest],
    );

    const bulkGrantBadges = useCallback(
        async (file: File, badgeType: 'SCHOOL' | 'NATIONAL'): Promise<BulkGrantBadgeResult | null> => {
            try {
                return await mutations.bulkGrantBadges.mutateAsync({ file, badgeType });
            } catch {
                return null;
            }
        },
        [mutations.bulkGrantBadges],
    );

    const grantBadgeToUser = useCallback(
        async (userId: number, badgeId: number): Promise<UserBadgeResponse | null> => {
            try {
                return await mutations.grantBadgeToUser.mutateAsync({ userId, badgeId });
            } catch {
                return null;
            }
        },
        [mutations.grantBadgeToUser],
    );

    const revokeBadge = useCallback(
        async (userId: number, badgeId: number): Promise<boolean> => {
            try {
                await mutations.revokeBadge.mutateAsync({ userId, badgeId });
                return true;
            } catch {
                return false;
            }
        },
        [mutations.revokeBadge],
    );

    const getUserBadges = useCallback(
        async (userId: number): Promise<BadgeItem[] | null> => {
            try {
                return await queryClient.fetchQuery({
                    queryKey: badgeKeys.userBadges(userId),
                    queryFn: () => userBadgeRepository.getUserBadges(userId),
                });
            } catch (error: unknown) {
                showToast(extractErrorMessage(error, i18n.t('features:badges.error')), 'error');
                return null;
            }
        },
        [queryClient],
    );

    return {
        isLoading: false,
        isSubmitting: mutations.isSubmitting,
        myRequests: [] as UserBadgeResponse[],
        pendingRequests: null as PagedUserBadgeResponse | null,
        requestBadge,
        fetchMyRequests,
        fetchPendingRequests,
        reviewRequest,
        bulkGrantBadges,
        grantBadgeToUser,
        revokeBadge,
        getUserBadges,
    };
};
