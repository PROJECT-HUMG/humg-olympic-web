import { useState, useCallback } from 'react';
import { extractErrorMessage, extractErrorCode } from '@/utils/errorUtils';
import { settingsRepository } from '@/features/settings/api';
import i18n from '@/i18n';
import {
    ChangePasswordRequest,
    PrivacySettings,
    NotificationPreferences,
    LoginHistoryItem,
    DeviceSession,
    DeleteAccountRequest,
} from '@/features/settings/types/settings.types';
import { showToast } from '@/components/ui/Toast';
import { getSettingsMessage } from '@/features/settings/constants/settingsMessages';
import { useAuth } from '@/contexts/AuthContext';

// Default values — matches backend defaults (all true)
const DEFAULT_PRIVACY: PrivacySettings = {
    showEmail: true,
    showPhone: true,
    showUniversity: true,
    showClass: true,
    showExamHistory: true,
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
    emailNotifications: true,
    systemNotifications: true,
    badgeApproval: true,
    teamInvites: true,
    competitionUpdates: true,
    resourceUpdates: true,
};

export function useSettings() {
    const { logout } = useAuth();

    // --- Password ---
    const [changingPassword, setChangingPassword] = useState(false);

    const changePassword = useCallback(async (data: ChangePasswordRequest) => {
        setChangingPassword(true);
        try {
            await settingsRepository.changePassword(data);
            showToast(getSettingsMessage('PASSWORD_CHANGED_SUCCESS'), 'success');
            return true;
        } catch (error: unknown) {
            const code = extractErrorCode(error);
            showToast(getSettingsMessage(code, extractErrorMessage(error, i18n.t('settings:passwordChangeFailed'))), 'error');
            return false;
        } finally {
            setChangingPassword(false);
        }
    }, []);

    // --- Privacy Settings ---
    const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
    const [privacyLoading, setPrivacyLoading] = useState(false);
    const [privacySaving, setPrivacySaving] = useState(false);

    const loadPrivacy = useCallback(async () => {
        setPrivacyLoading(true);
        try {
            const data = await settingsRepository.getPrivacySettings();
            setPrivacy(data);
        } catch {
            // API not ready yet, use defaults silently
        } finally {
            setPrivacyLoading(false);
        }
    }, []);

    const updatePrivacy = useCallback(async (newPrivacy: PrivacySettings) => {
        setPrivacy(newPrivacy); // Optimistic update
        setPrivacySaving(true);
        try {
            await settingsRepository.updatePrivacySettings(newPrivacy);
            showToast(getSettingsMessage('PRIVACY_UPDATED_SUCCESS'), 'success');
        } catch (error: unknown) {
            setPrivacy(privacy); // Revert
            showToast(extractErrorMessage(error, i18n.t('settings:updateFailed')), 'error');
        } finally {
            setPrivacySaving(false);
        }
    }, [privacy]);

    // --- Notification Preferences ---
    const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsSaving, setNotificationsSaving] = useState(false);

    const loadNotifications = useCallback(async () => {
        setNotificationsLoading(true);
        try {
            const data = await settingsRepository.getNotificationPreferences();
            setNotifications(data);
        } catch {
            // API not ready yet, use defaults silently
        } finally {
            setNotificationsLoading(false);
        }
    }, []);

    const updateNotifications = useCallback(async (newPrefs: NotificationPreferences) => {
        setNotifications(newPrefs); // Optimistic update
        setNotificationsSaving(true);
        try {
            await settingsRepository.updateNotificationPreferences(newPrefs);
            showToast(getSettingsMessage('NOTIFICATIONS_UPDATED_SUCCESS'), 'success');
        } catch (error: unknown) {
            setNotifications(notifications); // Revert
            showToast(extractErrorMessage(error, i18n.t('settings:updateFailed')), 'error');
        } finally {
            setNotificationsSaving(false);
        }
    }, [notifications]);

    // --- Login History ---
    const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);
    const [historyLoading, setHistoryLoading] = useState(false);

    const loadLoginHistory = useCallback(async (page = 1) => {
        setHistoryLoading(true);
        try {
            const res = await settingsRepository.getLoginHistory(page, 10);
            setLoginHistory(res.data);
            setHistoryPage(res.pagination.page);
            setHistoryTotalPages(res.pagination.totalPages);
        } catch {
            // API not ready
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    // --- Device Sessions ---
    const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([]);
    const [devicesLoading, setDevicesLoading] = useState(false);

    const loadDeviceSessions = useCallback(async () => {
        setDevicesLoading(true);
        try {
            const data = await settingsRepository.getDeviceSessions();
            setDeviceSessions(data);
        } catch {
            // API not ready yet, fail silently
        } finally {
            setDevicesLoading(false);
        }
    }, []);

    // --- Account Deletion ---
    const [deletionLoading, setDeletionLoading] = useState(false);

    const requestDeletion = useCallback(async (data: DeleteAccountRequest) => {
        setDeletionLoading(true);
        try {
            await settingsRepository.requestAccountDeletion(data);
            showToast(getSettingsMessage('DELETION_REQUEST_SUCCESS'), 'success');
            await logout(); // Logout user immediately
            return true;
        } catch (error: unknown) {
            const code = extractErrorCode(error);
            showToast(getSettingsMessage(code, extractErrorMessage(error, i18n.t('settings:actionFailed'))), 'error');
            return false;
        } finally {
            setDeletionLoading(false);
        }
    }, [logout]);

    const cancelDeletion = useCallback(async () => {
        setDeletionLoading(true);
        try {
            await settingsRepository.cancelAccountDeletion();
            showToast(getSettingsMessage('DELETION_CANCELLED_SUCCESS'), 'success');
            return true;
        } catch (error: unknown) {
            const code = extractErrorCode(error);
            showToast(getSettingsMessage(code, extractErrorMessage(error, i18n.t('settings:actionFailed'))), 'error');
            return false;
        } finally {
            setDeletionLoading(false);
        }
    }, []);

    return {
        // Password
        changePassword, changingPassword,
        // Privacy
        privacy, privacyLoading, privacySaving, loadPrivacy, updatePrivacy,
        // Notifications
        notifications, notificationsLoading, notificationsSaving, loadNotifications, updateNotifications,
        // Login History
        loginHistory, historyPage, historyTotalPages, historyLoading, loadLoginHistory,
        // Device Sessions
        deviceSessions, devicesLoading, loadDeviceSessions,
        // Deletion
        deletionLoading, requestDeletion, cancelDeletion,
    };
}
