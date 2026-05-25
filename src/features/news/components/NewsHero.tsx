import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, ArrowRight } from 'lucide-react';
import { NewsItem } from '@/features/news/types/news.types';
import { VerifiedBadge } from '@/features/badges/components/VerifiedBadge';
import { useUserPreview } from '@/hooks/useUserPreview';
import { newsAuthorToPreviewAuthor } from '@/utils/newsHelpers';
import type { Author } from '@/features/forum/types/forum.types';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import i18n from '@/i18n';

interface NewsHeroProps {
    news: NewsItem;
    onAction: (slug: string) => void;
}

export const NewsHero = ({ news, onAction }: NewsHeroProps) => {
    const [imageError, setImageError] = useState(false);
    const {
        isVisible: showPreview, position: previewPosition, previewItem,
        handleHoverStart, handleHoverEnd, handlePreviewMouseEnter, handlePreviewMouseLeave,
    } = useUserPreview<Author>();

    const imageUrl = news.thumbnailUrl || '';
    const hasImage = !!news.thumbnailUrl && !imageError;

    return (
        <article
            onClick={() => onAction(news.slug)}
            className="group relative w-full rounded-[2rem] overflow-hidden cursor-pointer
                bg-white dark:bg-slate-900
                border border-slate-200/60 dark:border-slate-700/50
                shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]
                hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]
                transition-[transform,box-shadow] duration-500
                animate-in fade-in slide-in-from-bottom-4 duration-600"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onAction(news.slug)}
            aria-label={i18n.t('news:hero.readFeatured', { title: news.title })}
        >

            {/* ── Layout: Left content + Right image ── */}
            <div className="flex flex-col lg:flex-row min-h-[340px] lg:min-h-[400px]">

                {/* ── LEFT: Content (1/3) ── */}
                <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 w-full lg:w-1/3 shrink-0 min-w-0">

                    {/* Category ribbon */}
                    {news.categoryName && (
                        <div className="relative lg:absolute lg:top-0 lg:left-0 z-30 mb-4 lg:mb-0">
                            <div className="relative bg-slate-800 dark:bg-slate-700 text-white/90 dark:text-white/80 pl-4 pr-5 py-1.5
                                font-bold text-[11px] uppercase tracking-wider select-none w-fit">
                                {news.categoryName}
                                <span className="absolute top-0 -right-[13px] w-0 h-0
                                    border-t-[28px] border-t-slate-800 dark:border-t-slate-700
                                    border-r-[14px] border-r-transparent" />
                            </div>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-transparent dark:from-blue-950/10 pointer-events-none rounded-l-[2rem]" />

                    <div className="relative space-y-5">

                        {/* Title & Summary */}
                        <div
                            className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                            style={{ animationDelay: '250ms' }}
                        >
                            <h2 className="text-2xl sm:text-3xl lg:text-[2rem] xl:text-4xl font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white mb-3 line-clamp-3 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                                {news.title}
                            </h2>
                            <p className="text-sm md:text-base line-clamp-2 leading-relaxed text-slate-500 dark:text-slate-400 max-w-lg">
                                {news.summary}
                            </p>
                        </div>

                        {/* CTA + Meta */}
                        <div
                            className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                            style={{ animationDelay: '350ms' }}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); onAction(news.slug); }}
                                className="group/btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap w-fit
                                    bg-blue-600 hover:bg-blue-700 text-white
                                    shadow-md shadow-blue-500/25 hover:shadow-blue-500/40
                                    transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5"
                            >
                                {i18n.t('news:hero.readNow')}
                                <ArrowRight size={15} strokeWidth={2.5} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
                            </button>

                            <div className="flex flex-col gap-2.5 mt-2">
                                {news.author && (
                                    <Link
                                        to={`/profile/${news.author.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseEnter={(e) => handleHoverStart(newsAuthorToPreviewAuthor(news.author!), e)}
                                        onMouseLeave={handleHoverEnd}
                                        className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit"
                                    >
                                        <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 border-2 border-slate-300 dark:border-slate-600">
                                            {news.author.avatar ? (
                                                <img src={news.author.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="w-full h-full flex items-center justify-center text-slate-500 text-[10px] font-bold">
                                                    {news.author.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-200 line-clamp-1">{news.author.name}</span>
                                        {news.author.role && <VerifiedBadge role={news.author.role} size={14} />}
                                    </Link>
                                )}

                                <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                                        <Calendar size={14} />
                                        {news.created || (news.published ? new Date(news.published).toLocaleDateString('vi-VN') : '')}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                                        <Eye size={14} />
                                        {i18n.t('news:hero.views', { viewCount: news.viewCount.toLocaleString() })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── IMAGE ── */}
                {hasImage && (
                    <div
                        className="relative order-first lg:order-last h-[200px] sm:h-[240px] lg:h-auto lg:w-2/3 shrink-0 overflow-hidden animate-in fade-in duration-600 fill-mode-both"
                        style={{ animationDelay: '80ms' }}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center blur-[40px] opacity-40 dark:opacity-25 scale-110 saturate-150"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                        />
                        <img
                            src={imageUrl}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent lg:hidden pointer-events-none" />
                        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none hidden lg:block" />
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent pointer-events-none hidden lg:block" />
                    </div>
                )}
            </div>

            {/* Inner border ring */}
            <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-slate-900/5 dark:ring-white/5 pointer-events-none z-20" />

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