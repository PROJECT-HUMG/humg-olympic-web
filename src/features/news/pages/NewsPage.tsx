import { useState, useEffect, useRef, useMemo, useCallback, type RefObject } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useNews } from '@/features/news/hooks/useNews';
import { newsRepository } from '@/features/news/api';
import { Category } from '@/features/news/types/news.types';
import { useAuth } from '@/contexts/AuthContext';
import i18n from '@/i18n';

import { PaginationControls } from '@/components/ui/PaginationControls';

import { NewsHero } from '@/features/news/components/NewsHero';
import { NewsCard } from '@/features/news/components/NewsCard';
import { SidebarFilter } from '@/components/ui/SidebarFilter';
import { EmptyState } from '@/features/news/components/EmptyState';
import { BentoGridSkeleton, GridSkeleton } from '@/features/news/components/NewsSkeletons';

import { PostNewsModal } from '@/features/dashboard/components/PostNewsModal';

export const NewsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const isAllowedToPost = user?.role === 'LECTURER' || user?.role === 'ADMIN';

    // ── Derive filter state from URL ──
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const activeCategory = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';

    const updateParams = useCallback((updates: Record<string, string | null>) => {
        setSearchParams(prev => {
            for (const [key, value] of Object.entries(updates)) {
                if (value === null || value === '' || (key === 'page' && value === '1') || (key === 'category' && value === 'all')) {
                    prev.delete(key);
                } else {
                    prev.set(key, value);
                }
            }
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const setPage = useCallback((p: number) => {
        updateParams({ page: String(p) });
    }, [updateParams]);

    const setCategory = useCallback((id: string) => {
        updateParams({ category: id, page: null });
    }, [updateParams]);

    const setSearch = useCallback((q: string) => {
        updateParams({ search: q, page: null });
    }, [updateParams]);

    const {
        newsItems, featuredNews, loading, currentPage, totalPages,
        refresh
    } = useNews({ itemsPerPage: 8, page, category: activeCategory, search: searchQuery });

    const listRef = useRef<HTMLElement>(null);

    /* ── Derived data ── */
    const regularNews = useMemo(() => {
        const excludeIds = new Set([
            featuredNews?.id,
        ].filter(Boolean));
        return newsItems.filter(n => !excludeIds.has(n.id));
    }, [newsItems, featuredNews]);

    /* ── Categories ── */
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await newsRepository.getCategories();
                setCategories([{ id: 0, name: i18n.t('news:page.allCategories'), description: '' }, ...data]);
            } catch (error) {
            }
        };
        loadCategories();
    }, []);

    /* ── Handlers ── */
    const handleViewDetail = (slug: string) => navigate(`/news/${slug}`);

    const handlePageChange = (p: number) => {
        setPage(p);
        listRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCategoryChange = (id: string) => {
        setCategory(id);
    };

    const handlePostSuccess = () => {
        setIsCreateModalOpen(false);
        if (refresh) refresh();
    };

    /* ── Loading state ── */
    const isInitialLoading = loading && !featuredNews && newsItems.length === 0;

    if (isInitialLoading) {
        return (
            <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">
                <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-7xl">
                    <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                        <BentoGridSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">
            <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">

                    {/* ═══════════════════════════════════════════
                        HERO BANNER
                        Desktop: Featured News Full Width
                    ═══════════════════════════════════════════ */}
                    {featuredNews && (
                        <div className="mb-10 w-full animate-in fade-in duration-400">
                            <NewsHero news={featuredNews} onAction={handleViewDetail} />
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════
                        SIDEBAR + CONTENT (Two-column layout)
                    ═══════════════════════════════════════════ */}
                    <div ref={listRef as RefObject<HTMLDivElement>} className="flex flex-col lg:flex-row gap-6">
                        {/* ── Left Sidebar: Filters ── */}
                        <div className="w-full lg:w-[260px] shrink-0">
                            <SidebarFilter
                                items={categories.map(c => ({ id: c.id === 0 ? 'all' : String(c.id), label: c.name }))}
                                activeId={activeCategory}
                                searchQuery={searchQuery}
                                onItemChange={(id) => handleCategoryChange(String(id))}
                                onSearchChange={setSearch}
                                loading={loading}
                                searchPlaceholder={i18n.t('news:page.searchPlaceholder')}
                                sectionLabel={i18n.t('news:page.categoryLabel')}
                                actionLabel={isAllowedToPost ? i18n.t('news:page.createNews') : undefined}
                                onAction={isAllowedToPost ? () => setIsCreateModalOpen(true) : undefined}
                            />
                        </div>

                        {/* ── Right: Content List ── */}
                        <div className="flex-1 min-w-0">
                            <div className="min-h-[400px]">
                                {loading ? (
                                    <GridSkeleton />
                                ) : regularNews.length > 0 ? (
                                    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                                        {regularNews.map((news, idx) => (
                                            <NewsCard key={news.id} news={news} onAction={handleViewDetail} index={idx} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState />
                                )}
                            </div>

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div className="mt-10">
                                    <PaginationControls
                                        current={currentPage}
                                        total={totalPages}
                                        onChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Modal */}
            {isAllowedToPost && (
                <PostNewsModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handlePostSuccess}
                />
            )}
        </div>
    );
};