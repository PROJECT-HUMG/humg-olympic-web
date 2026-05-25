import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search, ClipboardList, Filter, X,
    BookOpen, ListChecks, LayoutGrid, List, FileText,
} from 'lucide-react';

import { usePublicExams } from '@/features/exams/hooks/usePublicExams';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { ExamCard } from '@/features/exams/components/ExamCard';
import { ExamListItem } from '@/features/exams/components/ExamListItem';
import { ExamSkeleton } from '@/features/exams/components/ExamSkeleton';
import i18n from '@/i18n';

export const ExamsPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // ── Derive state from URL ──
    const page = Math.max(0, (Number(searchParams.get('page')) || 1) - 1);
    const activeSubjectId = searchParams.get('subject') ? Number(searchParams.get('subject')) : null;
    const activeCategoryId = searchParams.get('category') ? Number(searchParams.get('category')) : null;
    const debouncedSearch = searchParams.get('search') || '';

    const [searchInput, setSearchInput] = useState(debouncedSearch);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const updateParams = useCallback((updates: Record<string, string | null>) => {
        setSearchParams(prev => {
            for (const [key, value] of Object.entries(updates)) {
                if (value === null || value === '' || (key === 'page' && value === '1')) {
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

    const setSubject = useCallback((id: number | null) => {
        updateParams({ subject: id ? String(id) : null, page: null });
    }, [updateParams]);

    const setCategory = useCallback((id: number | null) => {
        updateParams({ category: id ? String(id) : null, page: null });
    }, [updateParams]);

    // Debounced search
    useEffect(() => {
        debounceRef.current = setTimeout(() => {
            updateParams({ search: searchInput || null, page: null });
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [searchInput, updateParams]);

    useEffect(() => {
        setSearchInput(debouncedSearch);
    }, [debouncedSearch]);

    const { exams, loading, totalPages, total, subjects, categories } = usePublicExams({
        page, search: debouncedSearch, subjectId: activeSubjectId, categoryId: activeCategoryId,
    });

    const hasActiveFilters = activeSubjectId !== null || activeCategoryId !== null || debouncedSearch !== '';

    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">

                    {/* ── Header ── */}
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <ClipboardList className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            {i18n.t('exams:listing.title')}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
                            {i18n.t('exams:listing.subtitle')}
                        </p>

                        {/* Search bar */}
                        <div className="relative max-w-2xl mt-5">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder={i18n.t('exams:listing.searchPlaceholder')}
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-sm focus:ring-2 focus:ring-humg-blue/20 focus:border-humg-blue/30 outline-none shadow-sm hover:shadow-md transition-colors placeholder:text-slate-400 dark:text-white"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => setSearchInput('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <X size={14} className="text-slate-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 relative">
                        {/* ── Sidebar Filters (desktop) ── */}
                        <div className="hidden lg:block w-56 shrink-0">
                            <div className="sticky top-28 space-y-5">
                                {/* Subject filter */}
                                <div>
                                    <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
                                        {i18n.t('exams:listing.subjectFilter')}
                                    </h3>
                                    <div className="flex flex-col gap-1">
                                        <SidebarButton
                                            active={!activeSubjectId}
                                            onClick={() => setSubject(null)}
                                            label={i18n.t('exams:listing.allLabel')}
                                        />
                                        {subjects.map(s => (
                                            <SidebarButton
                                                key={s.id}
                                                active={s.id === activeSubjectId}
                                                onClick={() => setSubject(s.id === activeSubjectId ? null : s.id)}
                                                label={s.name}
                                                color={s.color}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Category filter */}
                                {categories.length > 0 && (
                                    <div>
                                        <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
                                            {i18n.t('exams:listing.categoryFilter')}
                                        </h3>
                                        <div className="flex flex-col gap-1">
                                            <SidebarButton
                                                active={!activeCategoryId}
                                                onClick={() => setCategory(null)}
                                                label={i18n.t('exams:listing.allLabel')}
                                            />
                                            {categories.map(c => (
                                                <SidebarButton
                                                    key={c.id}
                                                    active={c.id === activeCategoryId}
                                                    onClick={() => setCategory(c.id === activeCategoryId ? null : c.id)}
                                                    label={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Mobile Filter Drawer ── */}
                        {showMobileFilters && (
                            <>
                                <div
                                    className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
                                    onClick={() => setShowMobileFilters(false)}
                                />
                                <div className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white dark:bg-slate-900 z-[70] lg:hidden shadow-2xl pt-24 p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold dark:text-white">{i18n.t('exams:listing.filters')}</h3>
                                        <button
                                            onClick={() => setShowMobileFilters(false)}
                                            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Subject */}
                                    <div className="mb-6">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <BookOpen size={13} /> {i18n.t('exams:listing.subjectFilter')}
                                        </span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <FilterChip active={!activeSubjectId} onClick={() => { setSubject(null); setShowMobileFilters(false); }} label={i18n.t('exams:listing.allLabel')} />
                                            {subjects.map(s => (
                                                <FilterChip key={s.id} active={s.id === activeSubjectId} onClick={() => { setSubject(s.id === activeSubjectId ? null : s.id); setShowMobileFilters(false); }} label={s.name} color={s.color} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Category */}
                                    {categories.length > 0 && (
                                        <div className="mb-6">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <ListChecks size={13} /> {i18n.t('exams:listing.categoryFilter')}
                                            </span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <FilterChip active={!activeCategoryId} onClick={() => { setCategory(null); setShowMobileFilters(false); }} label={i18n.t('exams:listing.allLabel')} />
                                                {categories.map(c => (
                                                    <FilterChip key={c.id} active={c.id === activeCategoryId} onClick={() => { setCategory(c.id === activeCategoryId ? null : c.id); setShowMobileFilters(false); }} label={c.name} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {hasActiveFilters && (
                                        <button
                                            onClick={() => { setSubject(null); setCategory(null); setSearchInput(''); setShowMobileFilters(false); }}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                        >
                                            <X size={14} /> {i18n.t('exams:listing.clearFilters')}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ── Main Content ── */}
                        <div className="flex-1 min-w-0">
                            {/* Controls bar */}
                            <div className="flex justify-between items-center mb-5 bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowMobileFilters(true)}
                                        className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        <Filter size={14} /> {i18n.t('exams:listing.filterBtn')}
                                    </button>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {loading ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="w-3 h-3 border-2 border-humg-blue border-t-transparent rounded-full animate-spin" />
                                                {i18n.t('exams:listing.loading')}
                                            </span>
                                        ) : (
                                            <><span className="font-bold text-slate-800 dark:text-white">{total}</span> {i18n.t('exams:listing.examCount', { count: total }).replace(String(total), '').trim()}</>
                                        )}
                                    </span>
                                </div>

                                <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-humg-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        title={i18n.t('exams:listing.gridView')}
                                    >
                                        <LayoutGrid size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-humg-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        title={i18n.t('exams:listing.listView')}
                                    >
                                        <List size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Loading */}
                            {loading && (
                                <div className={viewMode === 'grid' ? 'grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-3'}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <ExamSkeleton key={i} viewMode={viewMode} />
                                    ))}
                                </div>
                            )}

                            {/* Empty state */}
                            {!loading && exams.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-5 text-slate-400">
                                        <FileText size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">
                                        {hasActiveFilters ? i18n.t('exams:listing.emptySearch') : i18n.t('exams:listing.emptyDefault')}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
                                        {hasActiveFilters ? i18n.t('exams:listing.emptySearchHint') : i18n.t('exams:listing.emptyDefaultHint')}
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={() => { setSubject(null); setCategory(null); setSearchInput(''); }}
                                            className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-humg-blue hover:border-humg-blue/50 transition-colors shadow-sm"
                                        >
                                            {i18n.t('exams:listing.clearFilters')}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            {!loading && exams.length > 0 && (
                                <div className={viewMode === 'grid'
                                    ? 'grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                                    : 'flex flex-col gap-3'
                                }>
                                    {exams.map(exam => (
                                        viewMode === 'grid' ? (
                                            <ExamCard
                                                key={exam.id}
                                                exam={exam}
                                                onClick={() => navigate(`/exams/${exam.slug}`)}
                                            />
                                        ) : (
                                            <ExamListItem
                                                key={exam.id}
                                                exam={exam}
                                                onClick={() => navigate(`/exams/${exam.slug}`)}
                                            />
                                        )
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div className="flex justify-center mt-8">
                                    <PaginationControls current={page} total={totalPages} onChange={setPage} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Sidebar button (desktop) ──
const SidebarButton = ({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color?: string }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 ${active
            ? 'bg-humg-blue text-white shadow-sm shadow-humg-blue/20'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
    >
        {color && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />}
        {label}
    </button>
);

// ── Filter chip (mobile) ──
const FilterChip = ({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color?: string }) => (
    <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors border ${active
            ? 'bg-humg-blue border-humg-blue text-white'
            : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
    >
        {color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
        {label}
    </button>
);
