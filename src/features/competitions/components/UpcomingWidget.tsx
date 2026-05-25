import { useMemo, useState } from 'react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { ArrowRight, ImageOff, Timer } from 'lucide-react';
import i18n from '@/i18n';

import { CompetitionSummary } from '@/features/competitions/types/competition.types';
import { SubjectBadge } from './CompetitionBadges';

interface UpcomingWidgetProps {
    item: CompetitionSummary;
    index?: number;
    onClick: (id: number) => void;
}

export const UpcomingWidget = ({ item, index = 0, onClick }: UpcomingWidgetProps) => {
    const [imageError, setImageError] = useState(false);
    const startDate = useMemo(() => new Date(item.startTime), [item.startTime]);

    const { text: countdown, urgency } = useMemo(() => {
        const now = new Date();
        const days = differenceInDays(startDate, now);
        if (days > 0) return { text: i18n.t('features:competitions.widget.daysLeft', { count: days }), urgency: 'low' };
        const hours = differenceInHours(startDate, now);
        if (hours > 0) return { text: i18n.t('features:competitions.widget.hoursLeft', { count: hours }), urgency: 'medium' };
        return { text: i18n.t('features:competitions.widget.startingSoon'), urgency: 'high' };
    }, [startDate]);

    const day = format(startDate, 'dd');
    const monthYear = format(startDate, 'MM/yyyy');

    const hasImage = !!item.imageUrl && !imageError;

    // Phân loại màu sắc theo độ khẩn cấp (Urgency Colors)
    const urgencyColors = {
        low: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800/50',
        medium: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800/50',
        high: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-800/50 shadow-[0_0_10px_rgba(244,63,94,0.2)] animate-pulse'
    };

    return (
        <article
            onClick={() => onClick(item.id)}
            className="group flex flex-col h-full rounded-[1.25rem] overflow-hidden cursor-pointer relative
                bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl
                border border-white/50 dark:border-slate-700/50
                shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.15)]
                hover:shadow-[0_8px_25px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]
                transition-[transform,box-shadow] duration-300 transform hover:-translate-y-0.5
                animate-in fade-in slide-in-from-bottom-2 duration-400"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick(item.id)}
            aria-label={i18n.t('features:competitions.widget.ariaLabel', { title: item.title })}
            style={{ animationDelay: `${100 + index * 50}ms`, animationFillMode: 'both' }}
        >
            {/* ── IMAGE STRIP ── */}
            <div className="relative h-28 w-full overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">


                {hasImage ? (
                    <>
                        {/* Blurred ambient background */}
                        <div
                            className="absolute inset-0 bg-cover bg-center blur-xl scale-125 opacity-40 dark:opacity-20 transition-transform duration-700 group-hover:scale-150 saturate-150"
                            style={{ backgroundImage: `url(${item.imageUrl})` }}
                        />
                        {/* Main image */}
                        <img
                            src={item.imageUrl!}
                            alt={item.title}
                            className="relative w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                    </>
                ) : (
                    /* Fallback Pattern */
                    <div className="absolute inset-0 flex items-center justify-center opacity-80 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/40">
                        <ImageOff size={24} className="text-slate-400 dark:text-slate-500" />
                    </div>
                )}

                {/* Bottom dark fade for smooth transition to card body */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 dark:from-slate-900/60 to-transparent z-20 pointer-events-none" />
            </div>

            {/* ── BODY ── */}
            <div className="flex flex-col flex-1 px-4 pt-1 pb-4">

                {/* Date Badge & Meta */}
                <div className="flex items-start gap-3 mb-3">
                    {/* Glassmorphism Date Box (Overlapping image) */}
                    <div className="shrink-0 w-12 h-12 rounded-[0.85rem] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/50 dark:border-slate-700/50 flex flex-col items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.08)] -mt-6 z-30 relative transition-transform duration-300 group-hover:-translate-y-1">
                        <span className="text-lg font-black text-slate-800 dark:text-white leading-none">{day}</span>
                        <span className="text-[9px] font-extrabold text-blue-500 dark:text-blue-400 uppercase tracking-widest leading-none mt-0.5">{monthYear}</span>
                    </div>

                    {/* Subject Badge */}
                    <div className="flex-1 min-w-0 pt-1.5 flex justify-end">
                        <SubjectBadge name={item.subjectName} />
                    </div>
                </div>

                {/* Title */}
                <h4 className="text-[14px] md:text-[15px] font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                </h4>

                {/* Spacer to push footer to bottom */}
                <div className="flex-1" />

                {/* Footer: Countdown + Action Arrow */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100/80 dark:border-slate-800/60">
                    {/* Smart Countdown Pill */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold transition-colors ${urgencyColors[urgency as keyof typeof urgencyColors]}`}>
                        <Timer size={12} strokeWidth={2.5} className={urgency === 'high' ? 'animate-pulse' : ''} />
                        {countdown}
                    </div>

                    {/* Glowing Arrow Button */}
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-[transform,box-shadow] duration-300
                        group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] group-hover:scale-110">
                        <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </article>
    );
};