import {
    UserBadgeResponse,
    RequestBadgePayload,
    ReviewBadgeRequest,
    BulkGrantBadgeResult,
    PagedUserBadgeResponse,
    UserBadgePaginationParams,
} from '@/features/badges/types/userBadge.types';
import { BadgeItem } from '../types/auth.types';

/**
 * Repository interface cho User Badge operations
 */
export interface UserBadgeRepository {
    // === User Endpoints ===

    /**
     * User yêu cầu huy hiệu với ảnh minh chứng
     * POST /api/v1/user-badges/request
     */
    requestBadge(payload: RequestBadgePayload): Promise<UserBadgeResponse>;

    /**
     * Lấy danh sách yêu cầu huy hiệu của user hiện tại
     * GET /api/v1/user-badges/my-requests
     */
    getMyRequests(): Promise<UserBadgeResponse[]>;

    // === Admin Endpoints ===

    /**
     * Lấy danh sách yêu cầu chờ duyệt (PENDING)
     * GET /api/v1/admin/user-badges/pending
     */
    getPendingRequests(params?: UserBadgePaginationParams): Promise<PagedUserBadgeResponse>;

    /**
     * Duyệt hoặc từ chối yêu cầu huy hiệu
     * PUT /api/v1/admin/user-badges/{id}/review
     */
    reviewBadgeRequest(id: number, payload: ReviewBadgeRequest): Promise<UserBadgeResponse>;

    /**
     * Upload file Excel để cấp huy hiệu hàng loạt
     * POST /api/v1/admin/user-badges/bulk-grant
     */
    bulkGrantBadges(file: File, badgeType: 'SCHOOL' | 'NATIONAL'): Promise<BulkGrantBadgeResult>;

    /**
     * Cấp huy hiệu cho một user cụ thể
     * POST /api/v1/admin/user-badges/grant?userId={userId}&badgeId={badgeId}
     */
    grantBadgeToUser(userId: number, badgeId: number): Promise<UserBadgeResponse>;

    /**
     * Thu hồi huy hiệu đã cấp cho user
     * DELETE /api/v1/admin/user-badges/revoke?userId={userId}&badgeId={badgeId}
     */
    revokeBadge(userId: number, badgeId: number): Promise<void>;

    /**
     * Lấy danh sách huy hiệu của user (Admin view)
     * GET /api/v1/users/{userId}/profile (trích xuất badges)
     */
    getUserBadges(userId: number): Promise<BadgeItem[]>;
}
