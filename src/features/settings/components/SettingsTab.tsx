import { useState, useEffect, type ReactNode } from 'react';
import { Shield, Eye, Bell, AlertTriangle } from 'lucide-react';
import { AnimatedTabContent, startTabTransition } from '@/components/ui/AnimatedTabContent';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { SecuritySection } from './SecuritySection';
import { PrivacySection } from './PrivacySection';
import { NotificationsSection } from './NotificationsSection';
import { DangerZoneSection } from './DangerZoneSection';
import i18n from '@/i18n';

type SettingsSubTab = 'security' | 'privacy' | 'notifications' | 'danger';

const SUB_TABS: { key: SettingsSubTab; label: string; icon: ReactNode }[] = [
    { key: 'security', label: i18n.t('settings:tabs.security'), icon: <Shield size={16} /> },
    { key: 'privacy', label: i18n.t('settings:tabs.privacy'), icon: <Eye size={16} /> },
    { key: 'notifications', label: i18n.t('settings:tabs.notifications'), icon: <Bell size={16} /> },
    { key: 'danger', label: i18n.t('settings:tabs.danger'), icon: <AlertTriangle size={16} /> },
];

export const SettingsTab = () => {
    const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('security');
    const settings = useSettings();

    useEffect(() => {
        settings.loadPrivacy();
        settings.loadNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-6">
            {/* Sub-tab navigation */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto custom-scrollbar">
                    {SUB_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => startTabTransition(() => setActiveSubTab(tab.key))}
                            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors relative
                                ${activeSubTab === tab.key
                                    ? tab.key === 'danger'
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-blue-600 dark:text-blue-400'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeSubTab === tab.key && (
                                <div
                                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.key === 'danger' ? 'bg-red-500' : 'bg-blue-500'}`}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                    <AnimatedTabContent activeKey={activeSubTab}>
                        {activeSubTab === 'security' && <SecuritySection settings={settings} />}
                        {activeSubTab === 'privacy' && <PrivacySection settings={settings} />}
                        {activeSubTab === 'notifications' && <NotificationsSection settings={settings} />}
                        {activeSubTab === 'danger' && <DangerZoneSection settings={settings} />}
                    </AnimatedTabContent>
                </div>
            </div>
        </div>
    );
};
