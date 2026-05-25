import { SettingsRepository } from './SettingsRepository';
import {
    ChangePasswordRequest,
    PrivacySettings,
    NotificationPreferences,
    LoginHistoryResponse,
    DeviceSession,
    DeleteAccountRequest,
    SettingsApiResponse,
} from '@/features/settings/types/settings.types';
import { api } from '@/lib/api/apiClient';

export class ApiSettingsRepository implements SettingsRepository {

    async changePassword(data: ChangePasswordRequest): Promise<SettingsApiResponse> {
        return api.put<SettingsApiResponse>('/users/settings/password', data);
    }

    async getPrivacySettings(): Promise<PrivacySettings> {
        const res = await api.get<{ data: PrivacySettings }>('/users/settings/privacy');
        return res.data;
    }

    async updatePrivacySettings(data: PrivacySettings): Promise<SettingsApiResponse> {
        return api.put<SettingsApiResponse>('/users/settings/privacy', data);
    }

    async getNotificationPreferences(): Promise<NotificationPreferences> {
        const res = await api.get<{ data: NotificationPreferences }>('/users/settings/notifications');
        return res.data;
    }

    async updateNotificationPreferences(data: NotificationPreferences): Promise<SettingsApiResponse> {
        return api.put<SettingsApiResponse>('/users/settings/notifications', data);
    }

    async getLoginHistory(page = 1, limit = 10): Promise<LoginHistoryResponse> {
        return api.get<LoginHistoryResponse>(`/users/settings/login-history?page=${page}&limit=${limit}`);
    }

    async getDeviceSessions(): Promise<DeviceSession[]> {
        const res = await api.get<{ data: DeviceSession[] }>('/users/settings/devices');
        return res.data;
    }

    async requestAccountDeletion(data: DeleteAccountRequest): Promise<SettingsApiResponse> {
        return api.post<SettingsApiResponse>('/users/settings/delete-account', data);
    }

    async cancelAccountDeletion(): Promise<SettingsApiResponse> {
        return api.post<SettingsApiResponse>('/users/settings/cancel-deletion', {});
    }
}
