import { Trophy, Star, Award, Calendar } from 'lucide-react';
import type { UserProfileResponse } from '@/features/auth/types/auth.types';
import i18n from '@/i18n';

interface ProfileStatsCardProps {
    user: UserProfileResponse;
    joinedDate: string;
}

export const ProfileStatsCard = ({ user, joinedDate }: ProfileStatsCardProps) => {
    const stats = [
        {
            icon: Star,
            label: i18n.t('features:profile.stats.xpPoints'),
            value: user.xpPoints?.toLocaleString() || '0',
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            icon: Trophy,
            label: i18n.t('features:profile.stats.ranking'),
            value: user.ranking ? `#${user.ranking}` : '—',
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            icon: Award,
            label: i18n.t('features:profile.stats.badges'),
            value: String(user.badges?.filter(b => b.isEarned).length || 0),
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        },
        {
            icon: Calendar,
            label: 'Tham gia',
            value: joinedDate,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={`${stat.bg} rounded-2xl p-4 border border-slate-100 dark:border-slate-800 transition-transform hover:-translate-y-0.5`}
                >
                    <div className={`w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center mb-3 shadow-sm ${stat.color}`}>
                        <stat.icon size={18} strokeWidth={2.5} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</p>
                </div>
            ))}
        </div>
    );
};
