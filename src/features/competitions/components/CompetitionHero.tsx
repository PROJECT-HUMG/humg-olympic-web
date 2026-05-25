import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, User, Flame } from 'lucide-react';
import i18n from '@/i18n';
import { CompetitionSummary } from '@/features/competitions/types/competition.types';
import { VerifiedBadge } from '@/features/badges/components/VerifiedBadge';
import { useUserPreview } from '@/hooks/useUserPreview';
import { resourceAuthorToPreviewAuthor } from '@/utils/resourceHelpers';
import type { Author } from '@/features/forum/types/forum.types';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';

interface FeaturedHeroProps {
    item: CompetitionSummary;
    onClick: (slug: string) => void;
}

// ─── CSS Countdown timer cell with digit-flip ───
const TimerCell = ({ value, label }: { value: number; label: string }) => {
    const prevRef = useRef(value);
    const [flipKey, setFlipKey] = useState(0);

    useEffect(() => {
        if (prevRef.current !== value) {
            prevRef.current = value;
            setFlipKey(k => k + 1);
        }
    }, [value]);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl overflow-hidden
                bg-white/80 dark:bg-slate-800
                border border-slate-200/80 dark:border-slate-700
                shadow-[0_4px_12px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                {/* Top inner sheen — light mode only */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-transparent pointer-events-none" />
                <span
                    key={flipKey}
                    className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white relative z-10 tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-200"
                >
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {label}
            </span>
        </div>
    );
};

export const FeaturedHero = ({ item, onClick }: FeaturedHeroProps) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [imageError, setImageError] = useState(false);

    const {
        isVisible: showPreview, position: previewPosition, previewItem,
        handleHoverStart, handleHoverEnd, handlePreviewMouseEnter, handlePreviewMouseLeave,
    } = useUserPreview<Author>();

    useEffect(() => {
        const targetDate = new Date(item.startTime).getTime();
        const tick = () => {
            const distance = targetDate - Date.now();
            if (distance < 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }
            setTimeLeft({
                days: Math.floor(distance / 86_400_000),
                hours: Math.floor((distance % 86_400_000) / 3_600_000),
                minutes: Math.floor((distance % 3_600_000) / 60_000),
                seconds: Math.floor((distance % 60_000) / 1_000),
            });
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [item.startTime]);

    const imageUrl = item.imageUrl || '/placeholder-hero.png';


    return (
        <article
            className="group h-full rounded-[2rem] overflow-hidden cursor-pointer relative
                bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl
                border border-slate-200/60 dark:border-slate-700/50
                shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)]
                transition-[box-shadow] duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                animate-in fade-in slide-in-from-bottom-5 duration-600"
            role="button"
            tabIndex={0}
            onClick={() => onClick(item.slug)}
            onKeyDown={(e) => e.key === 'Enter' && onClick(item.slug)}
            aria-label={i18n.t('features:competitions.hero.ariaDetail', { title: item.title })}
        >
            {/* ─── Immersive Background Layer ─── */}
            {!imageError && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                    {/* Deep blurred background for ambient glow */}
                    <div
                        className="absolute inset-0 bg-cover bg-center blur-[60px] opacity-40 dark:opacity-30 scale-125 saturate-200"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                    {/* Main Image — visible on all breakpoints */}
                    <img
                        src={imageUrl}
                        alt=""
                        aria-hidden
                        className="absolute right-0 top-0 w-full sm:w-[75%] md:w-[65%] h-full object-cover object-center sm:object-left transition-transform duration-1000 group-hover:scale-105 opacity-60 sm:opacity-80 md:opacity-90 dark:opacity-50 sm:dark:opacity-60 md:dark:opacity-70"
                        style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 5%, black 50%)' }}
                        onError={() => setImageError(true)}
                    />
                </div>
            )}



            {/* ─── Content ─── */}
            <div className="relative z-10 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center h-full min-h-[340px] sm:min-h-[380px] lg:min-h-[460px] w-full md:w-[70%] lg:w-[60%]">
                <div className="space-y-6">

                    {/* Meta Badges */}
                    <div
                        className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-left-3 duration-500 fill-mode-both"
                        style={{ animationDelay: '200ms' }}
                    >
                        <span
                            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 cursor-default select-none backdrop-blur-sm shadow-sm"
                        >
                            <span
                                className="relative z-10"
                                style={{ animation: 'flame-sway 3s ease-in-out infinite' }}
                            >
                                <Flame size={14} className="fill-amber-500/50" />
                            </span>
                            <span className="relative z-10">{i18n.t('features:competitions.hero.featuredBadge')}</span>
                        </span>
                        <span className="px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 backdrop-blur-sm shadow-sm">
                            {item.subjectName}
                        </span>
                    </div>

                    {/* Title & Description */}
                    <div
                        className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
                        style={{ animationDelay: '300ms' }}
                    >
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white drop-shadow-sm mb-3 sm:mb-4">
                            {item.title}
                        </h1>
                        <p className="text-sm sm:text-base line-clamp-3 leading-relaxed text-slate-600 dark:text-slate-300 font-medium max-w-xl">
                            {item.summary ?? item.description ?? i18n.t('features:competitions.hero.defaultDesc')}
                        </p>

                        {/* Author Bento Pill */}
                        {(item.author != null || item.created) && (
                            <div className="mt-5 flex items-center">
                                {item.author && (
                                    <Link
                                        to={`/profile/${item.author.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseEnter={(e) => handleHoverStart(resourceAuthorToPreviewAuthor(item.author!), e)}
                                        onMouseLeave={handleHoverEnd}
                                        className="flex items-center gap-2.5 p-1.5 pr-4 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 transition-[box-shadow] group/author"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 border-2 border-white dark:border-slate-700">
                                            {item.author.avatar ? (
                                                <img src={item.author.avatar} alt={item.author.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><User size={14} className="text-slate-400" /></div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">{i18n.t('features:competitions.hero.postedBy')}</span>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover/author:text-blue-600 transition-colors leading-none">{item.author.name}</span>
                                                {item.author.role && <VerifiedBadge role={item.author.role} size={12} />}
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Countdown Grid */}
                    <div
                        className="flex items-center gap-2 sm:gap-3 md:gap-4 pt-2 animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
                        style={{ animationDelay: '400ms' }}
                    >
                        <TimerCell value={timeLeft.days} label={i18n.t('features:competitions.hero.days')} />
                        <span className="text-lg sm:text-xl md:text-2xl font-black text-slate-300 dark:text-slate-600 pb-5">:</span>
                        <TimerCell value={timeLeft.hours} label={i18n.t('features:competitions.hero.hours')} />
                        <span className="text-lg sm:text-xl md:text-2xl font-black text-slate-300 dark:text-slate-600 pb-5">:</span>
                        <TimerCell value={timeLeft.minutes} label={i18n.t('features:competitions.hero.minutes')} />
                        <span className="text-lg sm:text-xl md:text-2xl font-black text-slate-300 dark:text-slate-600 pb-5">:</span>
                        <TimerCell value={timeLeft.seconds} label={i18n.t('features:competitions.hero.seconds')} />
                    </div>

                    {/* Glowing CTA Button */}
                    <div
                        className="pt-2 animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
                        style={{ animationDelay: '500ms' }}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick(item.slug); }}
                            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-black text-sm sm:text-base
                                bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden
                                shadow-[0_8px_25px_rgba(79,70,229,0.4)] transition-[box-shadow] duration-300
                                hover:shadow-[0_12px_35px_rgba(79,70,229,0.5)] hover:-translate-y-1 active:translate-y-0"
                        >
                            {/* Shiny overlay effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]" />
                            <span className="relative z-10">{i18n.t('features:landing.hero.joinNow')}</span>
                            <ArrowRight size={18} strokeWidth={3} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Hover Profile Preview */}
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