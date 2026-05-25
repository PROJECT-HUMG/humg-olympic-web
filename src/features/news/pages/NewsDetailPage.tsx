import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Eye, Share2, Star, Loader2, Pencil, Trash2, Quote } from 'lucide-react';

import { useNewsDetail } from '../hooks/useNewsDetail';
import { useAuth } from '@/contexts/AuthContext';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import { VerifiedBadge } from '@/features/badges/components/VerifiedBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useUserPreview } from '@/hooks/useUserPreview';
import { newsAuthorToPreviewAuthor } from '@/utils/newsHelpers';
import type { Author } from '@/features/forum/types/forum.types';
import { NewsContentRenderer } from '../components/NewsContentRenderer';
import { NewsDetailSkeleton } from '../components/NewsDetailSkeleton';
import { EditNewsModal } from '../components/EditNewsModal';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ShareButton } from '@/components/ui/ShareButton';

export const NewsDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { news, loading, error, setFeatured, isSettingFeatured, deleteNews, isDeleting, refreshNews } = useNewsDetail(slug || null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const isAdmin = user?.role === 'ADMIN';
    const isOwner = Boolean(user && news?.author && String(user.id) === String(news.author.id));
    const canEdit = isAdmin || isOwner;

    const {
        isVisible: showPreview, position: previewPosition, previewItem,
        handleHoverStart, handleHoverEnd, handlePreviewMouseEnter, handlePreviewMouseLeave,
    } = useUserPreview<Author>();

    useEffect(() => {
        if (news) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (error) {
            showToast(error, 'error');
            navigate('/news');
        }
    }, [news, error, navigate]);

    const handleBack = () => navigate('/news');

    const handleToggleFeatured = async () => {
        if (!news) return;
        try {
            await setFeatured(news.id, !news.isFeatured);
            showToast(news.isFeatured ? i18n.t('news:removeFeatured') : i18n.t('news:toggleFeatured'), 'success');
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message || i18n.t('news:actionFailed');
            showToast(msg, 'error');
        }
    };



    const handleConfirmDelete = async () => {
        if (!news) return;
        try {
            await deleteNews(news.id);
            showToast(i18n.t('news:deleteSuccess'), 'success');
            setIsDeleteOpen(false);
            navigate('/news');
        } catch {
            showToast(i18n.t('news:deleteFailed'), 'error');
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="container mx-auto max-w-5xl px-4 md:px-6">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6 lg:p-10 backdrop-blur-xl">
                    <NewsDetailSkeleton />
                </div>
            </div>
        </div>
    );
    if (!news) return null;

    const dateDisplay = news.created || (news.published ? new Date(news.published).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '');

    // ─── Shared toolbar button class ───
    const toolbarBtn = "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-colors shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-slate-200 dark:border-slate-700/50 shadow-sm";

    return (
        <div className="min-h-screen pt-24 pb-24 transition-colors duration-500 font-sans relative">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl relative z-10">
                <Breadcrumb currentLabel={news.title} />
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">

                    {/* ─── Top Toolbar ─── */}
                    <div
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 animate-in fade-in slide-in-from-top-2 duration-400"
                    >
                        <button
                            onClick={handleBack}
                            className={`${toolbarBtn} text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 w-fit group`}
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            {i18n.t('news:detail.goBack')}
                        </button>

                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
                            <ShareButton title={news.title} variant="full" />

                            {canEdit && (
                                <>
                                    {isAdmin && (
                                        <button
                                            onClick={handleToggleFeatured}
                                            disabled={isSettingFeatured}
                                            className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-colors shrink-0 ${news.isFeatured
                                                ? 'bg-amber-100/80 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                                                : `${toolbarBtn} text-slate-600 dark:text-slate-300 hover:border-amber-300`
                                                } disabled:opacity-70`}
                                        >
                                            {isSettingFeatured ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} className={news.isFeatured ? 'fill-current' : ''} />}
                                            <span className="truncate">{news.isFeatured ? i18n.t('news:detail.featured') : i18n.t('news:detail.setFeatured')}</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsEditOpen(true)}
                                        className={`${toolbarBtn} text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400`}
                                    >
                                        <Pencil size={16} /> {i18n.t('news:detail.edit')}
                                    </button>
                                    <button
                                        onClick={() => setIsDeleteOpen(true)}
                                        className={`${toolbarBtn} text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20`}
                                    >
                                        <Trash2 size={16} /> {i18n.t('news:detail.delete')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ─── Meta: Author + Date/Views ─── */}
                    <div
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-slate-200/60 dark:border-slate-800/60 animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both"
                        style={{ animationDelay: '200ms' }}
                    >
                        {/* ── Author (full row on mobile, left on desktop) ── */}
                        {news.author ? (
                            <Link
                                to={`/profile/${news.author.id}`}
                                onMouseEnter={(e) => handleHoverStart(newsAuthorToPreviewAuthor(news.author!), e)}
                                onMouseLeave={handleHoverEnd}
                                className="flex items-center gap-3 group/author hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
                            >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 ring-2 ring-slate-200 dark:ring-slate-600">
                                    {news.author.avatar ? (
                                        <img src={news.author.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400">
                                            {news.author.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-800 dark:text-slate-200 group-hover/author:text-humg-blue dark:group-hover/author:text-blue-400 transition-colors text-sm sm:text-base">
                                            {news.author.name}
                                        </span>
                                        {news.author.role && <VerifiedBadge role={news.author.role} size={16} />}
                                    </div>
                                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{i18n.t('news:detail.author')}</span>
                                </div>
                            </Link>
                        ) : <div />}

                        {/* ── Date (left) + Views (right) on mobile; stacked right on desktop ── */}
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-1 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5 font-medium">
                                <Calendar size={14} className="text-slate-400" />
                                {news.published
                                    ? `${new Date(news.published).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — ${new Date(news.published).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                                    : dateDisplay || ''}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                                <Eye size={14} className="text-slate-400" />
                                {i18n.t('news:detail.views', { viewCount: news.viewCount.toLocaleString('vi-VN') })}
                            </span>
                        </div>
                    </div>

                    {/* ─── Title ─── */}
                    <h1
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-[1.3] mb-8 animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both"
                        style={{ animationDelay: '300ms' }}
                    >
                        {news.title}
                    </h1>

                    {/* ─── Thumbnail ─── */}
                    {news.thumbnailUrl && (
                        <div
                            className="-mx-4 lg:-mx-8 mb-8 animate-in fade-in zoom-in-[0.98] duration-500 fill-mode-both"
                            style={{ animationDelay: '350ms' }}
                        >
                            <img
                                src={news.thumbnailUrl}
                                alt={news.title}
                                className="w-full max-h-[500px] object-cover"
                            />
                        </div>
                    )}

                    {/* ─── Summary ─── */}
                    {news.summary && (
                        <div
                            className="mb-10 relative animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both"
                            style={{ animationDelay: '400ms' }}
                        >
                            <Quote className="absolute -top-3 -left-2 text-blue-500/15 dark:text-blue-400/10 w-16 h-16 rotate-180" />
                            <div className="relative z-10 pl-6 sm:pl-8 border-l-[4px] border-blue-500 py-3 bg-blue-50/40 dark:bg-blue-900/10 rounded-r-2xl pr-4">
                                <p className="text-lg sm:text-xl font-medium italic text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                                    {news.summary}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ─── Detail Content ─── */}
                    <div
                        className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
                        style={{ animationDelay: '500ms' }}
                    >
                        <div className="font-serif prose prose-base sm:prose-lg md:prose-xl prose-slate dark:prose-invert max-w-none
                            prose-headings:font-sans prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:mb-6
                            prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-6
                            prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-a:font-semibold
                            prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
                            prose-img:rounded-[1.5rem] prose-img:shadow-lg prose-img:w-full prose-img:my-8
                            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-900/15 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic
                            prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:text-rose-500 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                            prose-ul:list-disc prose-ul:pl-6 prose-li:my-2
                        ">
                            <NewsContentRenderer content={news.content || []} />
                        </div>
                    </div>

                    {/* ─── Footer ─── */}
                    <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <ShareButton title={news.title} variant="full" />
                        <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {i18n.t('news:detail.copyright')}
                        </span>
                    </div>

                </div>{/* end panel */}
            </div>

            {/* Hidden Components */}
            <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} isLoading={isDeleting} title={i18n.t('news:detail.deleteTitle')} message={i18n.t('news:detail.deleteMsg', { title: news?.title })} confirmText={i18n.t('news:detail.deleteConfirm')} variant="danger" />
            <EditNewsModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} news={news} onSuccess={refreshNews} />
            {previewItem && (
                <UserPreviewCard author={previewItem} isVisible={showPreview} position={previewPosition} onMouseEnter={handlePreviewMouseEnter} onMouseLeave={handlePreviewMouseLeave} />
            )}
        </div>
    );
};