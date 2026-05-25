import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import i18n from '@/i18n';

import { useCompetitions } from '@/features/competitions/hooks/useCompetitions';
import { useAuth } from '@/contexts/AuthContext';
import { PaginationControls } from '@/components/ui/PaginationControls';

import { FeaturedHero } from '@/features/competitions/components/CompetitionHero';
import { CompetitionCard } from '@/features/competitions/components/CompetitionCard';
import { SidebarFilter } from '@/components/ui/SidebarFilter';

import { BentoGridSkeleton } from '@/features/competitions/components/CompetitionSkeletons';
import { CreateCompetitionModal } from '@/features/dashboard/components/CreateCompetitionModal';

export const CompetitionsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const canCreate = user?.role === 'LECTURER' || user?.role === 'ADMIN';

    // ── Derive filter state from URL ──
    const uiPage = Math.max(1, Number(searchParams.get('page')) || 1);
    const page = uiPage - 1; // hook uses 0-indexed
    const activeSubject = searchParams.get('subject') || 'all';
    const debouncedSearch = searchParams.get('search') || '';

    // Local search input for responsive typing + debounce
    const [searchInput, setSearchInput] = useState(debouncedSearch);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const updateParams = useCallback((updates: Record<string, string | null>) => {
        setSearchParams(prev => {
            for (const [key, value] of Object.entries(updates)) {
                if (value === null || value === '' || (key === 'page' && value === '1') || (key === 'subject' && value === 'all')) {
                    prev.delete(key);
                } else {
                    prev.set(key, value);
                }
            }
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const setPage = useCallback((p: number) => {
        updateParams({ page: String(p + 1) });
    }, [updateParams]);

    const setSubject = useCallback((id: number | string) => {
        updateParams({ subject: String(id), page: null });
    }, [updateParams]);

    const handleSearch = useCallback((q: string) => {
        setSearchInput(q);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            updateParams({ search: q, page: null });
        }, 300);
    }, [updateParams]);

    // Cleanup debounce on unmount
    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const {
        competitions,
        featuredCompetition,
        loading,
        loadingList,
        subjects,
        totalPages,
        refresh,
    } = useCompetitions({ page, subjectId: activeSubject, search: debouncedSearch });

    const handlePageChange = (newPage: number) => {
        setPage(newPage - 1);
        document.getElementById('competitions-grid-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleDetailClick = (slug: string) => navigate(`/competitions/${slug}`);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        refresh?.();
    };

    const gridCards = useMemo(() => {
        const excludeIds = new Set([featuredCompetition?.id].filter(Boolean));
        return competitions.filter(c => !excludeIds.has(c.id));
    }, [competitions, featuredCompetition]);

    const isInitialLoading = loadingList && competitions.length === 0 && !featuredCompetition;
    if (isInitialLoading) {
        return (
            <div className="min-h-screen pt-24 pb-20 font-sans relative overflow-hidden">
                <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-7xl">
                    <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                        <BentoGridSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 font-sans relative overflow-hidden">

            {/* Ambient background orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
                <div className="absolute -top-48 -right-48 w-140 h-140 bg-linear-to-bl from-blue-100/20 via-transparent to-transparent dark:from-blue-950/10 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-40 w-110 h-110 bg-linear-to-tr from-slate-100/25 via-transparent to-transparent dark:from-slate-950/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-75 h-75 bg-linear-to-tl from-indigo-100/15 via-transparent to-transparent dark:from-indigo-950/8 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl max-w-full">

                    {/* ── HERO BANNER — Full Width ── */}
                    {featuredCompetition && (
                        <div className="mb-8">
                            <FeaturedHero item={featuredCompetition} onClick={handleDetailClick} />
                        </div>
                    )}

                    {/* ── SIDEBAR + CONTENT (Two-column layout) ── */}
                    <div id="competitions-grid-anchor" className="flex flex-col lg:flex-row gap-6">
                        {/* ── Left Sidebar: Filters ── */}
                        <div className="w-full lg:w-[260px] shrink-0">
                            <SidebarFilter
                                items={subjects}
                                activeId={activeSubject}
                                searchQuery={searchInput}
                                onItemChange={setSubject}
                                onSearchChange={handleSearch}
                                loading={loadingList}
                                searchPlaceholder={i18n.t('features:competitions.page.searchPlaceholder')}
                                sectionLabel={i18n.t('features:competitions.page.subjectLabel')}
                                actionLabel={canCreate ? i18n.t('features:competitions.page.createBtn') : undefined}
                                onAction={canCreate ? () => setIsCreateModalOpen(true) : undefined}
                            />
                        </div>

                        {/* ── Right: Content Grid ── */}
                        <div className="flex-1 min-w-0">
                            <div className="min-h-100">
                                {loadingList ? (
                                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-5 animate-pulse">
                                        {[1, 2, 3, 4, 5, 6].map(n => (
                                            <div key={n} className="rounded-[1.5rem] overflow-hidden bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/40 shadow-sm">
                                                <div className="aspect-square bg-slate-200/60 dark:bg-slate-800/60" />
                                                <div className="p-5 space-y-3">
                                                    <div className="h-5 w-3/4 bg-slate-200/60 dark:bg-slate-800 rounded" />
                                                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/40 rounded" />
                                                    <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800/40 rounded" />
                                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                                                            <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                                                        </div>
                                                        <div className="w-10 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : gridCards.length > 0 ? (
                                    <div
                                        key={`grid-${page}-${activeSubject}-${debouncedSearch}`}
                                        className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-5 animate-in fade-in duration-300"
                                    >
                                        {gridCards.map((item) => (
                                            <CompetitionCard key={item.id} item={item} onClick={handleDetailClick} />
                                        ))}
                                    </div>
                                ) : competitions.length === 0 ? (
                                    <div
                                        className="py-24 text-center rounded-2xl lg:rounded-3xl border border-dashed
                                            bg-white/70 border-slate-200/50
                                            dark:bg-slate-900/60 dark:border-slate-700/40
                                            backdrop-blur-xl
                                            animate-in fade-in slide-in-from-bottom-3 duration-300"
                                    >
                                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-500">
                                            <Trophy className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
                                            {i18n.t('features:competitions.page.emptyTitle')}
                                        </h3>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm">
                                            {i18n.t('features:competitions.page.emptyDesc')}
                                        </p>
                                    </div>
                                ) : null}
                            </div>

                            {!loadingList && totalPages > 1 && (
                                <div className="mt-10 flex justify-center">
                                    <PaginationControls
                                        current={uiPage}
                                        total={totalPages}
                                        onChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {canCreate && (
                <CreateCompetitionModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </div>
    );
};
