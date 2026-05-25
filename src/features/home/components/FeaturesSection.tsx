
import { Trophy, Files, MessageSquare, Bell, Map, Users, ClipboardList } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { FeatureItem } from '../../../components/layout/types/header.types';
import { FeatureCard } from './FeatureCard';
import i18n from '@/i18n';

const getFeatures = (): FeatureItem[] => [
    {
        id: 'competitions',
        title: i18n.t('features:landing.features.competitions'),
        description: i18n.t('features:landing.features.competitionsDesc'),
        icon: Trophy,
        link: 'competitions',
        colorClass: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    {
        id: 'teams',
        title: i18n.t('features:landing.features.teams'),
        description: i18n.t('features:landing.features.teamsDesc'),
        icon: Users,
        link: 'teams',
        colorClass: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    },
    {
        id: 'exams',
        title: i18n.t('features:landing.features.examBank'),
        description: i18n.t('features:landing.features.examBankDesc'),
        icon: ClipboardList,
        link: 'exams',
        colorClass: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    },
    {
        id: 'resources',
        title: i18n.t('features:landing.features.resources'),
        description: i18n.t('features:landing.features.resourcesDesc'),
        icon: Files,
        link: 'resources',
        colorClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
        id: 'roadmap',
        title: i18n.t('features:landing.features.roadmap'),
        description: i18n.t('features:landing.features.roadmapDesc'),
        icon: Map,
        link: 'roadmap',
        colorClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
        id: 'forum',
        title: i18n.t('features:landing.features.community'),
        description: i18n.t('features:landing.features.communityDesc'),
        icon: MessageSquare,
        link: 'forum',
        colorClass: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
        id: 'news',
        title: i18n.t('features:landing.features.newsEvents'),
        description: i18n.t('features:landing.features.newsEventsDesc'),
        icon: Bell,
        link: 'news',
        colorClass: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    },
];

export const FeaturesSection = () => {
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
        <section ref={containerRef} id="features" className="py-20 md:py-28 relative overflow-hidden bg-transparent">

            <div className="container mx-auto px-4 md:px-6 relative z-10">

                {/* Header — CSS animate-in */}
                <div className={`text-center max-w-3xl mx-auto mb-16 md:mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                        {i18n.t('features:landing.features.sectionTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-humg-blue via-indigo-500 to-humg-blue bg-[length:200%_auto] animate-gradient-text">{i18n.t('features:landing.features.sectionHighlight')}</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        {i18n.t('features:landing.features.sectionSubtitle')}
                    </p>
                </div>

                {/* Grid Cards — CSS stagger */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {getFeatures().map((item, index) => (
                        <div
                            key={item.id}
                            className={`h-full transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                            style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
                        >
                            <FeatureCard item={item} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};