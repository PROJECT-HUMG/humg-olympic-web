
import { Loader2, Mail, Bell } from 'lucide-react';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { NotificationPreferences } from '@/features/settings/types/settings.types';
import i18n from '@/i18n';

interface Props {
    settings: ReturnType<typeof useSettings>;
}

interface NotifField {
    key: keyof NotificationPreferences;
    label: string;
    description: string;
    group: 'general' | 'activity';
}

const NOTIF_FIELDS: NotifField[] = [
    { key: 'emailNotifications', label: i18n.t('settings:notifications.emailNotifications'), description: i18n.t('settings:notifications.emailNotificationsDesc'), group: 'general' },
    { key: 'systemNotifications', label: i18n.t('settings:notifications.systemNotifications'), description: i18n.t('settings:notifications.systemNotificationsDesc'), group: 'general' },
    { key: 'badgeApproval', label: i18n.t('settings:notifications.badgeApproval'), description: i18n.t('settings:notifications.badgeApprovalDesc'), group: 'activity' },
    { key: 'teamInvites', label: i18n.t('settings:notifications.teamInvites'), description: i18n.t('settings:notifications.teamInvitesDesc'), group: 'activity' },
    { key: 'competitionUpdates', label: i18n.t('settings:notifications.competitionUpdates'), description: i18n.t('settings:notifications.competitionUpdatesDesc'), group: 'activity' },
    { key: 'resourceUpdates', label: i18n.t('settings:notifications.resourceUpdates'), description: i18n.t('settings:notifications.resourceUpdatesDesc'), group: 'activity' },
];

const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30
            ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

export const NotificationsSection = ({ settings }: Props) => {
    const handleToggle = (key: keyof NotificationPreferences) => {
        const newPrefs = { ...settings.notifications, [key]: !settings.notifications[key] };
        settings.updateNotifications(newPrefs);
    };

    if (settings.notificationsLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
        );
    }

    const generalFields = NOTIF_FIELDS.filter(f => f.group === 'general');
    const activityFields = NOTIF_FIELDS.filter(f => f.group === 'activity');

    return (
        <div className="space-y-6">
            {/* General */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                    <Mail size={14} className="text-slate-400" />
                    Chung
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/30 rounded-xl px-4">
                    {generalFields.map(field => (
                        <div key={field.key} className="flex items-center justify-between py-3.5">
                            <div className="pr-4">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{field.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{field.description}</p>
                            </div>
                            <Toggle
                                checked={settings.notifications[field.key]}
                                onChange={() => handleToggle(field.key)}
                                disabled={settings.notificationsSaving}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                    <Bell size={14} className="text-slate-400" />
                    {i18n.t('settings:notifications.activityGroup')}
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/30 rounded-xl px-4">
                    {activityFields.map(field => (
                        <div key={field.key} className="flex items-center justify-between py-3.5">
                            <div className="pr-4">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{field.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{field.description}</p>
                            </div>
                            <Toggle
                                checked={settings.notifications[field.key]}
                                onChange={() => handleToggle(field.key)}
                                disabled={settings.notificationsSaving}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
