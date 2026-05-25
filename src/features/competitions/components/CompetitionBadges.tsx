
import { Trophy, Hourglass } from 'lucide-react';
import { CompetitionStatus } from '@/features/competitions/types/competition.types';
import i18n from '@/i18n';

export const SubjectBadge = ({ name }: { name: string }) => (
    <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[11px] font-bold tracking-wide border shadow-sm transition-colors
        bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/50">
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500 dark:bg-blue-400" />
        {name}
    </span>
);

export const StatusBadge = ({ status }: { status: CompetitionStatus }) => {
    switch (status) {
        case 'ONGOING':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold
                    bg-emerald-50/90 dark:bg-emerald-950/50 backdrop-blur-md
                    text-emerald-700 dark:text-emerald-400
                    border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
                    <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    {i18n.t('features:competitions.badges.ongoing')}
                </span>
            );
        case 'UPCOMING':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold
                    bg-blue-50/90 dark:bg-blue-950/50 backdrop-blur-md
                    text-blue-700 dark:text-blue-400
                    border border-blue-200/80 dark:border-blue-800/60 shadow-sm">
                    <Hourglass size={11} className="shrink-0" />
                    {i18n.t('features:competitions.badges.upcoming')}
                </span>
            );
        case 'ENDED':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold
                    bg-slate-100/90 dark:bg-slate-800/50 backdrop-blur-md
                    text-slate-500 dark:text-slate-400
                    border border-slate-200/80 dark:border-slate-700/60 shadow-sm opacity-80">
                    <Trophy size={11} className="shrink-0" />
                    {i18n.t('features:competitions.badges.ended')}
                </span>
            );
        default:
            return null;
    }
};
