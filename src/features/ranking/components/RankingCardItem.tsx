import { useMemo, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { LeaderboardEntry } from '@/features/ranking/types/ranking.types';
import i18n from '@/i18n';
import { VerifiedBadge, StudentBadges } from '@/features/badges/components/VerifiedBadge';
import { getUserNameColor, RankedUsername } from '@/utils/rankingHelpers';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';

const CAN_HOVER = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

const RankIcon = ({ rank }: { rank: number }) => {
    return <span className="text-lg font-black text-slate-700 dark:text-slate-300">#{rank}</span>;
};

const RankBadge = ({ rank }: { rank: number }) => {
    let colorClass = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700";

    if (rank === 1) {
        colorClass = "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 border-yellow-200 dark:border-yellow-700";
    } else if (rank === 2) {
        colorClass = "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 ring-1 ring-slate-300 dark:ring-slate-600";
    } else if (rank === 3) {
        colorClass = "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-500 border-orange-200 dark:border-orange-700";
    }

    const baseClass = "w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center font-extrabold text-sm sm:text-[17px] tracking-tight shadow-sm relative overflow-hidden border";

    return (
        <div className={`${baseClass} ${colorClass}`}>
            {rank}
        </div>
    );
};

export interface RankingCardItemProps {
    entry: LeaderboardEntry;
    index: number;
    isCurrentUser?: boolean;
    onClick?: () => void;
    onHoverStart: (entry: LeaderboardEntry, e: MouseEvent) => void;
    onHoverEnd: () => void;
    layout?: 'card' | 'row';
    displayValue?: number;
}

export const RankingCardItem = ({
    entry,
    index,
    isCurrentUser = false,
    onClick,
    onHoverStart,
    onHoverEnd,
    layout = 'row',
    displayValue,
}: RankingCardItemProps) => {
    const nameColor = useMemo(() => getUserNameColor(entry.xpPoints), [entry.xpPoints]);
    const isTop3 = index < 3;

    // ─── Hover handlers — skip on touch devices ───
    const hoverProps = CAN_HOVER ? {
        onMouseEnter: (e: MouseEvent) => onHoverStart(entry, e),
        onMouseLeave: onHoverEnd,
    } : {};

    // ─── STYLING LOGIC ───

    let backgroundClass = 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md hover:translate-x-1';

    if (layout === 'card') {
        backgroundClass = isTop3
            ? "bg-gradient-to-r from-white/80 to-blue-50/50 dark:from-slate-800/80 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
            : "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1";
    } else {
        if (isCurrentUser) {
            backgroundClass = 'bg-blue-50/60 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-1 ring-blue-200/50';
        } else if (isTop3) {
            backgroundClass = 'bg-gradient-to-r from-white/80 to-blue-50/50 dark:from-slate-800/80 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-700/30 hover:shadow-md hover:-translate-y-0.5';
        }
    }

    let avatarRingClass = 'ring-slate-100 dark:ring-slate-700 group-hover:ring-slate-300';
    if (isCurrentUser) {
        avatarRingClass = 'ring-blue-300 dark:ring-blue-700';
    } else if (isTop3) {
        avatarRingClass = 'ring-blue-100 dark:ring-blue-900/30 border-white dark:border-slate-700';
    } else if (layout === 'card') {
        avatarRingClass = 'border-white dark:border-slate-700 group-hover:border-blue-500';
    }

    const rankBoxClass = `
        w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center
        ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-1 ring-yellow-500' :
            index === 1 ? 'bg-slate-100 dark:bg-slate-800/50 ring-1 ring-slate-400' :
                index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 ring-1 ring-orange-500' :
                    'bg-slate-100 dark:bg-slate-800'}
    `;

    return (
        <div
            onClick={onClick}
            className={`
                group flex items-center gap-2.5 sm:gap-3.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl cursor-pointer
                transition-all duration-200 border relative
                ${backgroundClass}
            `}
        >
            {/* Rank Indicator */}
            {layout === 'card' ? (
                <div className={rankBoxClass}>
                    <RankIcon rank={index + 1} />
                </div>
            ) : (
                <RankBadge rank={entry.rank} />
            )}

            {/* Avatar */}
            <Link
                to={`/profile/${entry.userId}`}
                onClick={(e) => e.stopPropagation()}
                className="relative shrink-0 block"
                {...hoverProps}
            >
                <div className={`
                    ${layout === 'card' ? 'w-10 h-10 sm:w-12 sm:h-12 border-2' : 'w-9 h-9 sm:w-11 sm:h-11 ring-2'} 
                    rounded-full overflow-hidden transition-colors duration-200
                    ${layout === 'card'
                        ? (isTop3 ? 'border-white dark:border-slate-700 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-white dark:border-slate-700 group-hover:border-blue-500')
                        : avatarRingClass
                    }
                `}>
                    <img
                        src={getAvatarUrl(entry.avatarUrl, entry.fullName)}
                        alt={entry.fullName}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => handleAvatarError(e, entry.fullName)}
                    />
                </div>
                {layout === 'card' && index < 3 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800" />
                )}
            </Link>

            {/* User Info */}
            <div className={`flex-1 min-w-0 ${layout === 'row' ? 'flex flex-col justify-center' : ''}`}>
                <div className={`flex items-center gap-x-1 ${layout === 'card' ? 'mb-1 flex-wrap gap-y-1' : 'flex-nowrap overflow-hidden'}`}>
                    <h3 className={`font-bold text-sm sm:text-base ${layout === 'row' ? 'sm:text-lg leading-tight' : ''} truncate ${nameColor}`}>
                        <Link
                            to={`/profile/${entry.userId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline transition-colors block truncate"
                            {...hoverProps}
                        >
                            <RankedUsername
                                name={entry.fullName}
                                points={entry.xpPoints}
                                className="leading-tight"
                            />
                        </Link>
                    </h3>

                    {/* Role Badge */}
                    <div className="flex items-center shrink-0">
                        <VerifiedBadge role={entry.role || 'STUDENT'} size={layout === 'card' ? 14 : 15} />
                    </div>

                    {/* Badges */}
                    {entry.selectedBadges && entry.selectedBadges.length > 0 && (
                        <div className="shrink-0">
                            <StudentBadges badges={entry.selectedBadges} size={layout === 'card' ? 'xs' : 'sm'} maxDisplay={3} />
                        </div>
                    )}
                </div>

                {layout === 'card' && (
                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
                            <Trophy size={11} />
                            {entry.xpPoints} XP
                        </span>
                    </div>
                )}

                {/* XP Points - below name on mobile */}
                {layout === 'row' && (
                    <div className="sm:hidden mt-0.5">
                        <span className={`font-black text-sm ${entry.rank <= 3 ? 'text-humg-blue dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>
                            {displayValue ?? entry.xpPoints} <span className="text-[10px] font-bold text-slate-400 uppercase">{i18n.t('ranking:page.points')}</span>
                        </span>
                    </div>
                )}
            </div>

            {/* Total Points (Row Layout) — desktop only */}
            {layout === 'row' && (
                <div className="text-right shrink-0 min-w-15 hidden sm:block">
                    <span className={`block font-black text-lg leading-none ${entry.rank <= 3 ? 'text-humg-blue dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {displayValue ?? entry.xpPoints}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{i18n.t('ranking:page.points')}</span>
                </div>
            )}
        </div>
    );
};
