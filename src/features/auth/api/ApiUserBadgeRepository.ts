import { UserBadgeRepository } from './UserBadgeRepository';
import { BadgeItem, UserProfileResponse } from '../types/auth.types';
import {
    UserBadgeResponse,
    RequestBadgePayload,
    ReviewBadgeRequest,
    BulkGrantBadgeResult,
    PagedUserBadgeResponse,
    UserBadgePaginationParams,
} from '@/features/badges/types/userBadge.types';
import { api, authenticatedFetch } from '@/lib/api/apiClient';
import { API_BASE_URL } from '@/lib/api/apiConfig';

export class ApiUserBadgeRepository implements UserBadgeRepository {
    // ============================================
    // USER ENDPOINTS
    // ============================================

    /**
     * User yêu cầu huy hiệu với ảnh minh chứng
     * POST /api/v1/user-badges/request
     */
    async requestBadge(payload: RequestBadgePayload): Promise<UserBadgeResponse> {
        const formData = new FormData();
        formData.append('badgeId', payload.badgeId.toString());
        formData.append('proofImage', payload.proofImage);

        const response = await authenticatedFetch(`${API_BASE_URL}/user-badges/request`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to request badge');
        }

        return await response.json();
    }

    /**
     * Lấy danh sách yêu cầu huy hiệu của user hiện tại
     * GET /api/v1/user-badges/my-requests
     */
    async getMyRequests(): Promise<UserBadgeResponse[]> {
        return api.get<UserBadgeResponse[]>('/user-badges/my-requests');
    }

    // ============================================
    // ADMIN ENDPOINTS
    // ============================================

    /**
     * Lấy danh sách yêu cầu chờ duyệt (PENDING)
     * GET /api/v1/admin/user-badges/pending
     */
    async getPendingRequests(params?: UserBadgePaginationParams): Promise<PagedUserBadgeResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const queryString = queryParams.toString();
        const url = `/admin/user-badges/pending${queryString ? `?${queryString}` : ''}`;

        return api.get<PagedUserBadgeResponse>(url);
    }

    /**
     * Duyệt hoặc từ chối yêu cầu huy hiệu
     * PUT /api/v1/admin/user-badges/{id}/review
     */
    async reviewBadgeRequest(id: number, payload: ReviewBadgeRequest): Promise<UserBadgeResponse> {
        return api.put<UserBadgeResponse>(`/admin/user-badges/${id}/review`, payload);
    }

    /**
     * Upload file Excel để cấp huy hiệu hàng loạt
     * POST /api/v1/admin/user-badges/bulk-grant
     */
    async bulkGrantBadges(file: File, badgeType: 'SCHOOL' | 'NATIONAL'): Promise<BulkGrantBadgeResult> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('badgeType', badgeType);

        const response = await authenticatedFetch(`${API_BASE_URL}/admin/user-badges/bulk-grant`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to bulk grant badges');
        }

        return await response.json();
    }

    /**
     * Cấp huy hiệu cho một user cụ thể
     * POST /api/v1/admin/user-badges/grant?userId={userId}&badgeId={badgeId}
     */
    async grantBadgeToUser(userId: number, badgeId: number): Promise<UserBadgeResponse> {
        return api.post<UserBadgeResponse>(`/admin/user-badges/grant?userId=${userId}&badgeId=${badgeId}`, {});
    }

    /**
     * Thu hồi huy hiệu đã cấp cho user
     * DELETE /api/v1/admin/user-badges/revoke?userId={userId}&badgeId={badgeId}
     */
    async revokeBadge(userId: number, badgeId: number): Promise<void> {
        return api.delete<void>(`/admin/user-badges/revoke?userId=${userId}&badgeId=${badgeId}`);
    }

    /**
     * Lấy danh sách huy hiệu của user (Admin view)
     * Sử dụng endpoint profile để lấy thông tin chi tiết
     */
    async getUserBadges(userId: number): Promise<BadgeItem[]> {
        const profile = await api.get<UserProfileResponse>(`/users/${userId}/profile`);
        return profile.badges || [];
    }
}

// Singleton cho tiện sử dụng
export const userBadgeRepository = new ApiUserBadgeRepository();
