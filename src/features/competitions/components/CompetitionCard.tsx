import { Link } from 'react-router-dom';
import i18n from '@/i18n';

import { Users, User } from 'lucide-react';
import { CompetitionSummary } from '@/features/competitions/types/competition.types';
import { SubjectBadge } from './CompetitionBadges';
import { VerifiedBadge } from '@/features/badges/components/VerifiedBadge';
import { useUserPreview } from '@/hooks/useUserPreview';
import { resourceAuthorToPreviewAuthor } from '@/utils/resourceHelpers';
import type { Author } from '@/features/forum/types/forum.types';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';

interface CompetitionCardProps {
    item: CompetitionSummary;
    onClick: (slug: string) => void;
}


const CompetitionCardComponent = ({ item, onClick }: CompetitionCardProps) => {
    const current = item.currentParticipants || 0;
    const imageUrl = item.imageUrl || '/placeholder-comp.png';

    const {
        isVisible: showPreview,
        position: previewPosition,
        previewItem,
        handleHoverStart,
        handleHoverEnd,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave,
    } = useUserPreview<Author>();

    return (
        <article
            onClick={() => onClick(item.slug)}
            className="group flex flex-col h-full overflow-hidden cursor-pointer relative
                bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl
                rounded-[1.5rem] border border-white/50 dark:border-slate-700/50
                shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
                hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]
                transition-all duration-300 hover:scale-[1.02]
                animate-in fade-in slide-in-from-bottom-2 duration-400"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick(item.slug)}
            aria-label={i18n.t('features:competitions.card.ariaDetail', { title: item.title })}
        >
            {/* ── IMAGE ── */}
            <div className="relative aspect-[3/2] sm:aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                {/* Blurred ambient */}
                <div
                    className="absolute inset-0 bg-cover bg-center blur-2xl scale-125 opacity-40 dark:opacity-20 transition-transform duration-700 group-hover:scale-150"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                />

                {/* Main image — centered, contain */}
                <img
                    src={imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="relative w-full h-full object-contain z-10 p-4 sm:p-6 transition-transform duration-500 group-hover:scale-[1.05]"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=Event'; }}
                />

                {/* Subject badge (top-left) */}
                <div className="absolute top-4 left-4 z-20">
                    <SubjectBadge name={item.subjectName} />
                </div>

                {/* Status badge (top-right) */}
                {item.status && (
                    <div className="absolute top-4 right-4 z-20">
                        {item.isRegistered ? (
                            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wide">
                                {i18n.t('features:competitions.card.participated')}
                            </span>
                        ) : item.status === 'ONGOING' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {i18n.t('features:competitions.card.ongoing')}
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wide">
                                {item.status === 'UPCOMING' ? i18n.t('features:competitions.card.upcoming') : i18n.t('features:competitions.card.ended')}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── BODY ── */}
            <div className="flex flex-col flex-grow p-3.5 sm:p-5 bg-white dark:bg-slate-900">
                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white line-clamp-1 leading-snug mb-1
                    group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                </h3>

                {/* Summary */}
                {(item.summary ?? item.description) && (
                    <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3 sm:mb-4">
                        {item.summary ?? item.description}
                    </p>
                )}

                {/* ── Bottom: Author + Stats ── */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    {/* Author */}
                    {item.author ? (
                        <Link
                            to={`/profile/${item.author.id}`}
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={(e) => handleHoverStart(resourceAuthorToPreviewAuthor(item.author!), e)}
                            onMouseLeave={handleHoverEnd}
                            className="flex items-center gap-2 group/author min-w-0"
                        >
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                                {item.author.avatar ? (
                                    <img src={item.author.avatar} alt={item.author.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-600 text-slate-400">
                                        <User size={12} />
                                    </div>
                                )}
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover/author:text-blue-600 dark:group-hover/author:text-blue-400 truncate transition-colors">
                                {item.author.name}
                            </span>
                            {item.author.role && <VerifiedBadge role={item.author.role} size={12} />}
                        </Link>
                    ) : (
                        <span className="text-slate-400 text-xs">—</span>
                    )}

                    {/* Participants count */}
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0">
                        <Users size={13} />
                        {current.toLocaleString()}
                    </span>
                </div>
            </div>

            {previewItem && (
                <UserPreviewCard
                    author={previewItem}
                    isVisible={showPreview}
                    position={previewPosition}
                    onMouseEnter={handlePreviewMouseEnter}
                    onMouseLeave={handlePreviewMouseLeave}
                />
            )}
        </article>
    );
};

export const CompetitionCard = CompetitionCardComponent;