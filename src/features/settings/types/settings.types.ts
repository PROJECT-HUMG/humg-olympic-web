// ===== Settings Types =====

// --- Change Password ---
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// --- Privacy Settings ---
export interface PrivacySettings {
    showEmail: boolean;
    showPhone: boolean;
    showUniversity: boolean;
    showClass: boolean;
    showExamHistory: boolean;
}

// --- Notification Preferences ---
export interface NotificationPreferences {
    emailNotifications: boolean;
    systemNotifications: boolean;
    badgeApproval: boolean;
    teamInvites: boolean;
    competitionUpdates: boolean;
    resourceUpdates: boolean;
}

// --- Login History ---
export interface LoginHistoryItem {
    id: number;
    ipAddress: string;
    userAgent: string;
    device: string;
    location: string | null;
    loginAt: string;
    status: 'SUCCESS' | 'FAILED';
}

export interface LoginHistoryResponse {
    data: LoginHistoryItem[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// --- Device Sessions ---
export interface DeviceSession {
    id: number;
    device: string;
    ipAddress: string;
    location: string;
    lastLoginAt: string;
}

// --- Account Deletion ---
export interface DeleteAccountRequest {
    password: string;
    confirmText: string;
    reason?: string;
}

// --- Generic API response ---
export interface SettingsApiResponse {
    success: boolean;
    message: string;
}
