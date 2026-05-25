import {
    ChangePasswordRequest,
    PrivacySettings,
    NotificationPreferences,
    LoginHistoryResponse,
    DeviceSession,
    DeleteAccountRequest,
    SettingsApiResponse,
} from '@/features/settings/types/settings.types';

export interface SettingsRepository {
    changePassword(data: ChangePasswordRequest): Promise<SettingsApiResponse>;

    getPrivacySettings(): Promise<PrivacySettings>;
    updatePrivacySettings(data: PrivacySettings): Promise<SettingsApiResponse>;

    getNotificationPreferences(): Promise<NotificationPreferences>;
    updateNotificationPreferences(data: NotificationPreferences): Promise<SettingsApiResponse>;

    getLoginHistory(page?: number, limit?: number): Promise<LoginHistoryResponse>;

    getDeviceSessions(): Promise<DeviceSession[]>;

    requestAccountDeletion(data: DeleteAccountRequest): Promise<SettingsApiResponse>;
    cancelAccountDeletion(): Promise<SettingsApiResponse>;
}
