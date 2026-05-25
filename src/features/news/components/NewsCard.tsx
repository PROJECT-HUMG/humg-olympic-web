import { type SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye } from 'lucide-react';
import { NewsItem } from '@/features/news/types/news.types';
import { VerifiedBadge } from '@/features/badges/components/VerifiedBadge';
import { useUserPreview } from '@/hooks/useUserPreview';
import { newsAuthorToPreviewAuthor } from '@/utils/newsHelpers';
import type { Author } from '@/features/forum/types/forum.types';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import i18n from '@/i18n';

interface NewsCardProps {
    news: NewsItem;
    onAction: (slug: string) => void;
    index?: number;
}

export const NewsCard = ({ news, onAction, index = 0 }: NewsCardProps) => {
    const {
        isVisible: showPreview,
        position: previewPosition,
        previewItem,
        handleHoverStart,
        handleHoverEnd,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave,
    } = useUserPreview<Author>();

    const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement?.classList.add('bg-slate-200', 'dark:bg-slate-800');
    };

    return (
        <article
            onClick={() => onAction(news.slug)}
            className="group flex flex-col sm:flex-row h-full sm:h-[180px] rounded-2xl overflow-hidden cursor-pointer
                bg-white/70 dark:bg-slate-900/60
                border border-slate-200/50 dark:border-slate-700/40
                shadow-sm hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-slate-950/30
                hover:-translate-y-1
                transition-all duration-300 relative
                animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onAction(news.slug)}
            aria-label={i18n.t('news:card.readArticle', { title: news.title })}
            style={{ animationDelay: `${100 + index * 60}ms`, animationDuration: '400ms' }}
        >
            {/* ── IMAGE SECTION (LEFT) ── */}
            <div className="relative w-full sm:w-[280px] h-48 sm:h-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800/60 p-3">
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm">
                    <div
                        className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-60 dark:opacity-40"
                        style={{ backgroundImage: `url(${news.thumbnailUrl || ''})` }}
                    />
                    <img
                        src={news.thumbnailUrl || ''}
                        alt={news.title}
                        loading="lazy"
                        className="relative w-full h-full object-contain z-10 transition-transform duration-500 group-hover:scale-[1.03]"
                        onError={handleImageError}
                    />
                </div>
            </div>

            {/* ── CONTENT SECTION (RIGHT) ── */}
            <div className="flex flex-col flex-grow p-4 sm:p-5 sm:pl-3 justify-between">
                <div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-snug transition-colors
                        text-slate-800 group-hover:text-humg-blue
                        dark:text-white dark:group-hover:text-blue-400">
                        {news.title}
                    </h3>
                    <p className="text-sm line-clamp-2 leading-relaxed text-slate-500 dark:text-slate-400 mb-4">
                        {news.summary}
                    </p>
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                    {news.author && (
                        <div className="flex items-center gap-2 mt-1">
                            <Link
                                to={`/profile/${news.author.id}`}
                                onClick={(e) => e.stopPropagation()}
                                onMouseEnter={(e) => handleHoverStart(newsAuthorToPreviewAuthor(news.author!), e)}
                                onMouseLeave={handleHoverEnd}
                                className="flex items-center gap-2 group/author w-fit"
                            >
                                <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                                    {news.author.avatar ? (
                                        <img src={news.author.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {news.author.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover/author:text-humg-blue dark:group-hover/author:text-blue-400 transition-colors">
                                    {news.author.name}
                                </span>
                                <VerifiedBadge role={news.author.role} size={12} />
                            </Link>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" /> {i18n.t('news:card.publishDate', { date: news.published ? new Date(news.published).toLocaleDateString('vi-VN') : news.created })}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Eye size={13} className="text-slate-400" /> {i18n.t('news:card.viewed', { viewCount: news.viewCount.toLocaleString() })}
                        </span>
                    </div>
                </div>
            </div>

            {/* User Preview */}
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