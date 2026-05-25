import { useState, useEffect, useRef } from 'react';
import { useResourcePreview } from '@/hooks/useResourcePreview';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, LayoutGrid, List, FolderOpen, Filter, X, ChevronLeft, ChevronRight, Files, Loader2 } from 'lucide-react';
import { useResources } from '../hooks/useResources';
import { useAuth } from '@/contexts/AuthContext';
import { UploadResourceModal } from '@/features/dashboard/components/UploadResourceModal';
import { ResourceCard } from '@/features/resources/components/ResourceCard';
import { ResourceListItem } from '@/features/resources/components/ResourceListItem';
import { ResourceSkeleton } from '@/features/resources/components/ResourceSkeleton';
import { ResourceFilters } from '@/features/resources/components/ResourceFilters';
import { ResourceItem } from '@/features/resources/types/resources.types';
import { PreviewModal } from '@/features/resources/components/PreviewModal';
import { UpdateResourceModal } from '@/features/dashboard/components/UpdateResourceModal';
import { useDebounce } from '../components/useDebounce';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { extractErrorMessage } from '@/utils/errorUtils';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export const ResourcesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const PAGE_SIZE = 9;

    const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '');
    const debouncedSearch = useDebounce(localSearch, 500);

    const {
        resources, categories, loading,
        activeCategory, currentPage, totalPages, totalItems,
        setCategory, setSearch, setPage, refresh,
        downloadResource, previewResource, updateResource, deleteResource
    } = useResources(PAGE_SIZE);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const listTopRef = useRef<HTMLDivElement>(null);

    const isLecturer = user?.role === 'LECTURER' || user?.role === 'ADMIN';

    const { previewData, previewLoadingId, openPreview, closePreview } = useResourcePreview();
    const [previewItem, setPreviewItem] = useState<ResourceItem | null>(null);

    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [resourceToUpdate, setResourceToUpdate] = useState<ResourceItem | null>(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<ResourceItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [downloadLoadingId, setDownloadLoadingId] = useState<number | null>(null);


    useEffect(() => {
        setSearch(debouncedSearch);
        setSearchParams(prev => {
            const currentQ = prev.get('q') || '';
            if (currentQ === debouncedSearch) return prev;
            const newParams = new URLSearchParams(prev);
            if (!debouncedSearch) newParams.delete('q');
            else newParams.set('q', debouncedSearch);
            newParams.set('page', '1');
            return newParams;
        });
    }, [debouncedSearch, setSearch, setSearchParams]);

    useEffect(() => {
        const catFromUrl = searchParams.get('category');
        const pageFromUrl = searchParams.get('page');
        if (catFromUrl && catFromUrl !== activeCategory) setCategory(catFromUrl);
        if (pageFromUrl) setPage(Number(pageFromUrl));
    }, []);

    const handleSetCategory = (catId: string | number) => {
        const id = String(catId);
        setCategory(id);
        setShowMobileFilter(false);
        setSearchParams(prev => {
            if (id === 'all') prev.delete('category');
            else prev.set('category', id);
            prev.set('page', '1');
            return prev;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDownload = async (item: ResourceItem) => {
        if (!isAuthenticated) {
            showToast(i18n.t('features:resources.loginRequired'), 'info');
            navigate('/login', { state: { from: location } });
            return;
        }
        setDownloadLoadingId(item.id);
        try {
            await downloadResource(item.id, item.title + '.' + item.fileType.toLowerCase());
            showToast(i18n.t('features:resources.downloadSuccess', { title: item.title }), 'success');
        } catch (error: unknown) {
            showToast(extractErrorMessage(error, i18n.t('features:resources.downloadFailed')), 'error');
        } finally {
            setDownloadLoadingId(null);
        }
    };

    const handlePreview = async (item: ResourceItem) => {
        setPreviewItem(item);
        try {
            await openPreview(item.id, item.title, item.fileType);
        } catch (error: unknown) {
            showToast(extractErrorMessage(error, i18n.t('features:resources.previewFailed')), 'error');
        }
    };

    const canManageResource = (item: ResourceItem) => {
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        if (user.role === 'LECTURER' && item.author && String(item.author.id) === String(user.id)) return true;
        return false;
    };

    const handleEditClick = (item: ResourceItem) => {
        setResourceToUpdate(item);
        setIsUpdateOpen(true);
    };

    const handleDeleteClick = (item: ResourceItem) => {
        setResourceToDelete(item);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!resourceToDelete) return;
        setIsDeleting(true);
        try {
            await deleteResource(resourceToDelete.id);
            showToast(i18n.t('features:resources.deleteSuccess'), 'success');
            setIsDeleteOpen(false);
            setResourceToDelete(null);
        } catch (error: unknown) {
            showToast(extractErrorMessage(error, i18n.t('features:resources.deleteFailed')), 'error');
        } finally {
            setIsDeleting(false);
        }
    };


    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">

            {/* Ambient background orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute -top-40 -right-40 w-125 h-125 bg-linear-to-bl from-blue-100/40 via-transparent to-transparent dark:from-blue-950/20 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-32 w-100 h-100 bg-linear-to-tr from-indigo-100/30 via-transparent to-transparent dark:from-indigo-950/15 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-1/4 w-75 h-75 bg-linear-to-tl from-violet-100/20 via-transparent to-transparent dark:from-violet-950/10 rounded-full blur-3xl" />
            </div>

            {/* Modals */}
            <PreviewModal
                isOpen={previewData.isOpen}
                onClose={closePreview}
                fileUrl={previewData.url}
                fileName={previewData.fileName}
                fileType={previewData.fileType}
                onDownload={() => previewItem && handleDownload(previewItem)}
            />
            <UploadResourceModal
                isOpen={isUploadOpen}
                onClose={() => { setIsUploadOpen(false); refresh(); }}
            />
            <UpdateResourceModal
                isOpen={isUpdateOpen}
                onClose={() => setIsUpdateOpen(false)}
                resource={resourceToUpdate}
                onUpdate={updateResource}
            />
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
                title={i18n.t('resources:page.deleteTitle')}
                message={i18n.t('resources:page.deleteMessage', { title: resourceToDelete?.title })}
                confirmText={i18n.t('resources:page.deleteConfirm')}
                variant="danger"
            />

            {/* Loading overlay for preview / download */}
            {(previewLoadingId !== null || downloadLoadingId !== null) && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white dark:bg-slate-800 px-8 py-6 shadow-2xl border border-slate-200 dark:border-slate-700">
                        <Loader2 className="w-10 h-10 text-humg-blue animate-spin" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {previewLoadingId !== null ? i18n.t('resources:page.openingDoc') : i18n.t('resources:page.downloading')}
                        </p>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl max-w-full">
                    {/* Hero Header Section */}
                    <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                        <Files className="text-blue-600 dark:text-blue-500" size={24} />
                                    </div>
                                    {i18n.t('resources:page.title')}
                                </h1>
                                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
                                    {i18n.t('resources:page.subtitle')}
                                </p>
                            </div>

                            {isLecturer && (
                                <button
                                    onClick={() => setIsUploadOpen(true)}
                                    className="px-5 py-2.5 bg-linear-to-r from-humg-blue to-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-[1.02] active:scale-[0.97] flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Plus size={18} /> {i18n.t('resources:page.upload')}
                                </button>
                            )}
                        </div>

                        {/* Search bar */}
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder={i18n.t('resources:page.searchPlaceholder')}
                                className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-sm focus:ring-2 focus:ring-humg-blue/20 focus:border-humg-blue/30 outline-none shadow-sm hover:shadow-md transition-colors placeholder:text-slate-400"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                            />
                            {loading && localSearch !== debouncedSearch && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-humg-blue border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            {localSearch && !loading && (
                                <button
                                    onClick={() => setLocalSearch('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors animate-in fade-in zoom-in-90 duration-150"
                                >
                                    <X size={14} className="text-slate-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 relative">

                        {/* Sidebar Filters (Desktop) */}
                        <div className="hidden lg:block w-64 shrink-0 sticky top-24 h-fit">
                            <ResourceFilters
                                categories={categories}
                                activeCategory={activeCategory}
                                onSelectCategory={handleSetCategory}
                                totalItems={totalItems}
                            />
                        </div>

                        {/* Mobile Filter Drawer */}
                        {showMobileFilter && (
                            <>
                                <div
                                    className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
                                    onClick={() => setShowMobileFilter(false)}
                                />
                                <div
                                    className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white dark:bg-humg-dark-surface z-[70] lg:hidden shadow-2xl pt-24 p-6 overflow-y-auto animate-in slide-in-from-right duration-300"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold dark:text-white">{i18n.t('resources:page.filters')}</h3>
                                        <button
                                            onClick={() => setShowMobileFilter(false)}
                                            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <ResourceFilters
                                        categories={categories}
                                        activeCategory={activeCategory}
                                        onSelectCategory={handleSetCategory}
                                        totalItems={totalItems}
                                    />
                                </div>
                            </>
                        )}

                        {/* Main Content Area */}
                        <div className="flex-1 min-h-150" ref={listTopRef}>

                            {/* Controls Bar */}
                            <div className="flex justify-between items-center mb-5 bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowMobileFilter(true)}
                                        className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        <Filter size={14} /> {i18n.t('resources:page.filterButton')}
                                    </button>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {loading ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="w-3 h-3 border-2 border-humg-blue border-t-transparent rounded-full animate-spin" />
                                                {i18n.t('resources:page.loading')}
                                            </span>
                                        ) : (
                                            <>
                                                <span className="font-bold text-slate-800 dark:text-white">{totalItems}</span> {i18n.t('resources:page.resultLabel')}
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-humg-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        title={i18n.t('resources:page.gridView')}
                                    >
                                        <LayoutGrid size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-humg-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        title={i18n.t('resources:page.listView')}
                                    >
                                        <List size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Content with AnimatePresence for state transitions */}
                            {loading && (
                                <div
                                    key="loading"
                                    className={`grid gap-5 animate-in fade-in duration-200 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
                                >
                                    {Array.from({ length: PAGE_SIZE }).map((_, n) => <ResourceSkeleton key={n} />)}
                                </div>
                            )}

                            {!loading && resources.length === 0 && (
                                <div
                                    key="empty"
                                    className="flex flex-col items-center justify-center py-24 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-250"
                                >
                                    <div className="w-16 h-16 bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center mb-5 text-slate-400">
                                        <FolderOpen size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">{i18n.t('resources:page.notFound')}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">{i18n.t('resources:page.notFoundHint')}</p>
                                    <button
                                        onClick={() => { setLocalSearch(''); setCategory('all'); }}
                                        className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-humg-blue hover:border-humg-blue/50 transition-colors shadow-sm hover:shadow-md"
                                    >
                                        {i18n.t('resources:page.clearFilters')}
                                    </button>
                                </div>
                            )}

                            {!loading && resources.length > 0 && (
                                <div
                                    key={`${viewMode}-${currentPage}-${activeCategory ?? 'all'}-${debouncedSearch}`}
                                    className={viewMode === 'grid' ? 'grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-3'}
                                >
                                    {resources.map((item, index) => (
                                        viewMode === 'grid' ? (
                                            <ResourceCard
                                                key={item.id}
                                                item={item}
                                                onClick={() => handleDownload(item)}
                                                onPreview={() => handlePreview(item)}
                                                canManage={canManageResource(item)}
                                                onEdit={() => handleEditClick(item)}
                                                onDelete={() => handleDeleteClick(item)}
                                                index={index}
                                            />
                                        ) : (
                                            <ResourceListItem
                                                key={item.id}
                                                item={item}
                                                onDownload={() => handleDownload(item)}
                                                onPreview={() => handlePreview(item)}
                                                canManage={canManageResource(item)}
                                                onEdit={() => handleEditClick(item)}
                                                onDelete={() => handleDeleteClick(item)}
                                                index={index}
                                            />
                                        )
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div className="flex justify-center mt-10">
                                    <PaginationControls
                                        current={currentPage}
                                        total={totalPages}
                                        onChange={(p) => { setPage(p); listTopRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaginationControls = ({ current, total, onChange }: { current: number, total: number, onChange: (p: number) => void }) => {
    const pages = generatePageNumbers(current, total);

    return (
        <nav className="flex items-center gap-1.5" aria-label={i18n.t('resources:page.pagination')}>
            <button
                onClick={() => onChange(Math.max(current - 1, 1))}
                disabled={current === 1}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-humg-blue disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 transition-colors"
                aria-label={i18n.t('resources:page.previousPage')}
            >
                <ChevronLeft size={18} />
            </button>

            {pages.map((page, idx) =>
                page === '...' ? (
                    <span key={`dots-${idx}`} className="px-2 text-slate-400 text-sm select-none">...</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onChange(page as number)}
                        className={`min-w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${current === page
                            ? 'bg-humg-blue text-white shadow-md shadow-blue-500/20'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-humg-blue'
                            }`}
                        aria-current={current === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onChange(Math.min(current + 1, total))}
                disabled={current === total}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-humg-blue disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 transition-colors"
                aria-label="Trang sau"
            >
                <ChevronRight size={18} />
            </button>
        </nav>
    );
};

function generatePageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (current < total - 2) pages.push('...');

    pages.push(total);

    return pages;
}
