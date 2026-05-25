import { useMemo } from 'react';
import { TrendingUp, Users } from 'lucide-react';
import i18n from '@/i18n';

import { CompetitionSummary } from '@/features/competitions/types/competition.types';
import { SubjectBadge } from './CompetitionBadges';

interface TrendingListProps {
    competitions: CompetitionSummary[];
    onSelect: (slug: string) => void;
}


export const TrendingList = ({ competitions, onSelect }: TrendingListProps) => {
    const trending = useMemo(() => {
        return [...competitions]
            .sort((a, b) => b.currentParticipants - a.currentParticipants)
            .slice(0, 5);
    }, [competitions]);

    if (trending.length === 0) return null;

    return (
        <div className="h-full rounded-2xl lg:rounded-3xl border
            bg-white/70 border-slate-200/50
            dark:bg-slate-900/60 dark:border-slate-700/40
            backdrop-blur-xl p-5 flex flex-col
            shadow-sm dark:shadow-slate-950/20">

            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                    <TrendingUp size={15} className="text-orange-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    {i18n.t('features:competitions.trending.title')}
                </h3>
            </div>

            {/* List */}
            <div className="flex-1 space-y-1">
                {trending.map((item, idx) => {
                    const max = item.maxParticipants || 1;
                    const percent = Math.min((item.currentParticipants / max) * 100, 100);

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.slug)}
                            className="w-full flex items-start gap-3 p-3 rounded-xl
                                hover:bg-slate-50 dark:hover:bg-slate-800/60
                                transition-colors duration-200 text-left group
                                animate-in fade-in slide-in-from-right-1 duration-300"
                            style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
                        >
                            {/* Rank */}
                            <span className={`text-base font-black tabular-nums shrink-0 mt-0.5 w-5 text-center ${idx === 0 ? 'text-orange-500' :
                                idx === 1 ? 'text-slate-400' :
                                    idx === 2 ? 'text-amber-600 dark:text-amber-500' :
                                        'text-slate-300 dark:text-slate-600'
                                }`}>
                                {idx + 1}
                            </span>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-slate-800 dark:text-white truncate group-hover:text-humg-blue dark:group-hover:text-blue-400 transition-colors">
                                    {item.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <SubjectBadge name={item.subjectName} />
                                </div>
                                {/* Participant mini-bar */}
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-humg-blue/60 dark:bg-blue-500/50 transition-[width] duration-500"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                                        <Users size={9} />
                                        {item.currentParticipants}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
