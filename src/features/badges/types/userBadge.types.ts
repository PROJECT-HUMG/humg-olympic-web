export type UserBadgeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type BadgeType = 'NATIONAL' | 'SCHOOL';
export type BadgeSubject =
    | 'MATH'
    | 'PHYSICS'
    | 'CHEMISTRY'
    | 'ENGLISH'
    | 'IT'
    | 'ART'
    | 'GENERAL'
    | 'ALGEBRA'
    | 'CALCULUS';

export interface UserBadgeResponse {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    studentId: string;
    badgeId: number;
    badgeName: string;
    badgeDescription: string;
    badgeType: BadgeType;
    badgeSubject: BadgeSubject;
    badgeLevel: number;
    status: UserBadgeStatus;
    proofImageUrl: string | null;
    rejectReason: string | null;
    requestedAt: string;
    reviewedAt: string | null;
}

export interface RequestBadgePayload {
    badgeId: number;
    proofImage: File;
}

export interface ReviewBadgeRequest {
    approved: boolean;
    rejectReason?: string | null;
}

export interface BulkGrantBadgeResult {
    totalRows: number;
    successCount: number;
    failedCount: number;
    errors: string[];
}

export interface PagedUserBadgeResponse {
    data: UserBadgeResponse[];
    total: number;
    page: number;
    limit: number;
}

export interface UserBadgePaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
