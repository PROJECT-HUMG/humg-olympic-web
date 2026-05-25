import { AlertCircle, Plus } from 'lucide-react';
import { Trans } from 'react-i18next';
import { BadgeFlat } from '@/features/badges/components/BadgeFlat';
import type { BadgeItem } from '@/features/auth/types/auth.types';
import i18n from '@/i18n';

interface ProfileBadgesTabProps {
    badges: BadgeItem[];
    selectedBadges: BadgeItem[];
    isOwnProfile: boolean;
    availableBadgesForRequest: BadgeItem[];
    onToggleBadge: (id: number) => void;
    onOpenRequestModal: () => void;
}

export const ProfileBadgesTab = ({
    badges, selectedBadges, isOwnProfile,
    availableBadgesForRequest,
    onToggleBadge, onOpenRequestModal,
}: ProfileBadgesTabProps) => (
    <div className="space-y-12">
        {/* Info banner + Request button (Only Own Profile) */}
        {isOwnProfile && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><AlertCircle size={16} className="sm:w-[18px] sm:h-[18px]" /></div>
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                        <Trans i18nKey="features:profile.badges.instruction" components={{ 1: <span className="font-bold" /> }} />
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <span className="font-bold text-base sm:text-lg text-humg-blue">{selectedBadges.length}/3</span>
                    {availableBadgesForRequest.length > 0 && (
                        <button
                            onClick={onOpenRequestModal}
                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-humg-blue text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Plus size={14} className="sm:w-4 sm:h-4" />
                            {i18n.t('features:profile.badges.requestBadge')}
                        </button>
                    )}
                </div>
            </div>
        )}

        {['NATIONAL', 'SCHOOL'].map(type => {
            const group = badges.filter(b => b.type === type);
            if (group.length === 0) return null;
            return (
                <div key={type}>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 border-l-4 border-humg-blue pl-2 sm:pl-3">
                        <span className="hidden sm:inline">{type === 'NATIONAL' ? i18n.t('profile:badges.national') : i18n.t('profile:badges.school')}</span>
                        <span className="sm:hidden">{type === 'NATIONAL' ? i18n.t('profile:badges.nationalShort') : i18n.t('profile:badges.schoolShort')}</span>
                        <span className="text-[10px] sm:text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 rounded-full ml-1 sm:ml-2">{group.length}</span>
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10">
                        {group.map(badge => (
                            <div key={badge.id} className="flex justify-center">
                                <BadgeFlat badge={badge} onClick={() => isOwnProfile && badge.isEarned && onToggleBadge(badge.id)} size="lg" />
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
    </div>
);
