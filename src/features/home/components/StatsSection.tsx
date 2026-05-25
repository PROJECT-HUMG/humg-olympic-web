
import { Zap, HeartHandshake, Award } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import i18n from '@/i18n';

const getHighlights = () => [
    {
        id: 1,
        title: i18n.t('features:landing.stats.card1Title'),
        desc: i18n.t('features:landing.stats.card1Desc'),
        icon: HeartHandshake,
        colorClass: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    },
    {
        id: 2,
        title: i18n.t('features:landing.stats.card2Title'),
        desc: i18n.t('features:landing.stats.card2Desc'),
        icon: Zap,
        colorClass: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
        id: 3,
        title: i18n.t('features:landing.stats.card3Title'),
        desc: i18n.t('features:landing.stats.card3Desc'),
        icon: Award,
        colorClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    },
];

export const StatsSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
            { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={containerRef} className="py-20 md:py-28 relative overflow-hidden bg-transparent">

            <div className="container mx-auto px-4 md:px-6 relative z-10">

                {/* Section Header — CSS transition */}
                <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {i18n.t('features:landing.stats.sectionTitle')}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        {i18n.t('features:landing.stats.sectionSubtitle')}
                    </p>
                </div>

                {/* Grid Cards — CSS stagger */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {getHighlights().map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                className={`group relative h-full bg-white dark:bg-slate-900 rounded-[28px] p-8 border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl hover:shadow-slate-200/80 dark:hover:shadow-slate-900/50 hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col items-center text-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ transitionDelay: isVisible ? `${index * 200}ms` : '0ms' }}
                            >
                                {/* Hover Gradient Border */}
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-humg-blue/10 dark:group-hover:border-blue-500/20 rounded-[28px] transition-colors pointer-events-none" />

                                {/* Icon Box */}
                                <div className={`w-16 h-16 rounded-2xl ${item.colorClass} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm relative z-10`}>
                                    <Icon size={28} strokeWidth={1.8} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 relative z-10">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-humg-blue dark:group-hover:text-blue-400 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};