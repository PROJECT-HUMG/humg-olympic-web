import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HelpCircle, BarChart3 } from 'lucide-react';
import i18n from '@/i18n';

import { useLeaderboard } from '@/features/ranking/hooks/useLeaderboard';
import { useAuth } from '@/contexts/AuthContext';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { LeaderboardEntry } from '@/features/ranking/types/ranking.types';
import { useUserPreview } from '@/hooks/useUserPreview';
import { Author } from '@/features/forum/types/forum.types';
import { RankingCardItem } from '@/features/ranking/components/RankingCardItem';
import { UserRole } from '@/features/auth/types/auth.types';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';

const CAN_HOVER = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

// ─── SKELETON ────────────────────────────────────────────────────
const LeaderboardSkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 sm:w-48 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <div className="flex gap-2">
                        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
                        <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full ml-auto" />
                    <div className="h-3 w-8 bg-slate-100 dark:bg-slate-800 rounded-full ml-auto" />
                </div>
            </div>
        ))}
    </div>
);

// ─── HELP TOOLTIP — CSS transition ──────────────────────────────
const HelpTooltip = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative inline-block ml-1.5 align-middle">
            <button
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onClick={() => setIsOpen(!isOpen)}
                className="w-7 h-7 rounded-full bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors border border-blue-100 dark:border-slate-700"
            >
                <HelpCircle size={15} className="text-blue-600 dark:text-blue-400" />
            </button>
            <div
                className={`absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-64 p-3.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 text-xs text-left transition-all duration-200 origin-top ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-1 scale-95 pointer-events-none'}`}
            >
                <p className="font-bold text-slate-800 dark:text-white mb-1.5 text-[13px]">{i18n.t('ranking:scoring.title')}</p>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li>• <span className="font-semibold text-blue-600">{i18n.t('ranking:scoring.schoolBadge')}</span> {i18n.t('ranking:scoring.schoolMultiplier')}</li>
                    <li>• <span className="font-semibold text-amber-600">{i18n.t('ranking:scoring.nationalBadge')}</span> {i18n.t('ranking:scoring.nationalMultiplier')}</li>
                    <li>• <span className="font-semibold text-purple-600">{i18n.t('ranking:scoring.examScore')}</span> {i18n.t('ranking:scoring.examAccumulate')}</li>
                </ul>
            </div>
        </div>
    );
};

// ─── MAIN PAGE ──────────────────────────────────────────────────
export const RankingPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Sync page state with URL (?page=N)
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const setPage = useCallback((newPage: number) => {
        setSearchParams(prev => {
            if (newPage <= 1) {
                prev.delete('page');
            } else {
                prev.set('page', String(newPage));
            }
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const { entries, loading, totalPages } = useLeaderboard(20, page);

    const [isVisible, setIsVisible] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && entries.length > 0) {
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
        }
    }, [loading, entries, page]);

    // Scroll to top of list on page change (offset for fixed nav)
    useEffect(() => {
        if (!loading && listRef.current) {
            const navHeight = 240;
            const top = listRef.current.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }, [page, loading]);

    const {
        isVisible: showPreview,
        position: previewPosition,
        previewItem: previewEntry,
        handleHoverStart,
        handleHoverEnd,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave
    } = useUserPreview<LeaderboardEntry>();

    const convertToAuthor = (entry: LeaderboardEntry): Author => ({
        id: entry.userId,
        name: entry.fullName,
        avatar: entry.avatarUrl || '',
        role: (entry.role || 'STUDENT_INTERNAL') as UserRole,
        badges: entry.selectedBadges.map(b => ({ ...b, isSelected: true, isEarned: true })),
        xpPoints: entry.xpPoints
    });

    return (
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl min-h-screen">
            <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                <div className="mb-8 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-500">
                            <BarChart3 size={24} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {i18n.t('ranking:page.title')}
                        </h1>
                        <HelpTooltip />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                        {i18n.t('ranking:page.subtitle')}
                    </p>
                </div>

                {/* ── List container with min-height to prevent jank ── */}
                <div ref={listRef} className="scroll-mt-24 min-h-[60vh] mb-8">
                    {loading ? (
                        <LeaderboardSkeleton />
                    ) : (
                        <div className="space-y-3">
                            {entries.length > 0 ? (
                                entries.map((entry, index) => (
                                    <div
                                        key={entry.userId}
                                        className={`transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                                        style={{ transitionDelay: isVisible ? `${index * 30}ms` : '0ms' }}
                                    >
                                        <RankingCardItem
                                            entry={entry}
                                            index={(page - 1) * 20 + index}
                                            isCurrentUser={user?.id === entry.userId}
                                            onHoverStart={handleHoverStart}
                                            onHoverEnd={handleHoverEnd}
                                            layout="row"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">{i18n.t('ranking:page.noData')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <PaginationControls
                            current={page}
                            total={totalPages}
                            onChange={setPage}
                        />
                    </div>
                )}
            </div>

            {/* User Preview Card — only on hover-capable devices */}
            {CAN_HOVER && showPreview && previewEntry && (
                <UserPreviewCard
                    author={convertToAuthor(previewEntry)}
                    isVisible={showPreview}
                    position={previewPosition}
                    onMouseEnter={handlePreviewMouseEnter}
                    onMouseLeave={handlePreviewMouseLeave}
                />
            )}
        </div>
    );
};