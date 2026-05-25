
import { Loader2 } from 'lucide-react';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { PrivacySettings } from '@/features/settings/types/settings.types';
import i18n from '@/i18n';

interface Props {
    settings: ReturnType<typeof useSettings>;
}

const PRIVACY_FIELDS: { key: keyof PrivacySettings; label: string; description: string }[] = [
    { key: 'showEmail', label: i18n.t('settings:privacy.showEmail'), description: i18n.t('settings:privacy.showEmailDesc') },
    { key: 'showPhone', label: i18n.t('settings:privacy.showPhone'), description: i18n.t('settings:privacy.showPhoneDesc') },
    { key: 'showUniversity', label: i18n.t('settings:privacy.showUniversity'), description: i18n.t('settings:privacy.showUniversityDesc') },
    { key: 'showClass', label: i18n.t('settings:privacy.showClass'), description: i18n.t('settings:privacy.showClassDesc') },
    { key: 'showExamHistory', label: i18n.t('settings:privacy.showExamHistory'), description: i18n.t('settings:privacy.showExamHistoryDesc') },
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

export const PrivacySection = ({ settings }: Props) => {
    const handleToggle = (key: keyof PrivacySettings) => {
        const newPrivacy = { ...settings.privacy, [key]: !settings.privacy[key] };
        settings.updatePrivacy(newPrivacy);
    };

    if (settings.privacyLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                {i18n.t('settings:privacy.description')}
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {PRIVACY_FIELDS.map(field => (
                    <div key={field.key} className="flex items-center justify-between py-4">
                        <div className="pr-4">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{field.label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{field.description}</p>
                        </div>
                        <Toggle
                            checked={settings.privacy[field.key]}
                            onChange={() => handleToggle(field.key)}
                            disabled={settings.privacySaving}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
