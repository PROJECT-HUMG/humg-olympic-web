import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import i18n from '@/i18n';
import { useLeaderboard } from '@/features/ranking/hooks/useLeaderboard';
import { LeaderboardEntry } from '@/features/ranking/types/ranking.types';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import { useUserPreview } from '@/hooks/useUserPreview';
import { Author } from '@/features/forum/types/forum.types';
import { RankingCardItem } from '@/features/ranking/components/RankingCardItem';
import { UserRole } from '@/features/auth/types/auth.types';

export const RankingSection = () => {
    const navigate = useNavigate();
    const { entries, loading } = useLeaderboard(5);

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

    const {
        isVisible: showPreview,
        position: previewPosition,
        previewItem: previewEntry,
        handleHoverStart,
        handleHoverEnd,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave
    } = useUserPreview<LeaderboardEntry>();

    const convertToAuthor = (entry: LeaderboardEntry): Author => ({
        id: entry.userId,
        name: entry.fullName,
        avatar: entry.avatarUrl || '',
        role: (entry.role || 'STUDENT_INTERNAL') as UserRole,
        badges: entry.selectedBadges.map(b => ({ ...b, isSelected: true, isEarned: true })),
        xpPoints: entry.xpPoints
    });

    const displayEntries = entries.length > 0 ? entries : [];

    if (!loading && displayEntries.length === 0) return null;

    return (
        <section ref={containerRef} className="py-20 relative overflow-hidden">

            <div className="container mx-auto px-4">
                {/* Header — CSS transition */}
                <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        {i18n.t('features:landing.ranking.titleLine1')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-[length:200%_auto] animate-gradient-text dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400">
                            {i18n.t('features:landing.ranking.titleHighlight')}
                        </span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        {i18n.t('features:landing.ranking.subtitle')}
                    </p>
                </div>

                <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
                    {/* Ranking List */}
                    <div className="relative z-10 w-full">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="bg-slate-100 dark:bg-slate-800/50 h-20 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4 w-full">
                                {displayEntries.map((entry, index) => (
                                    <div
                                        key={entry.userId}
                                        className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                                        style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
                                    >
                                        <RankingCardItem
                                            entry={entry}
                                            index={index}
                                            layout="card"
                                            onHoverStart={handleHoverStart}
                                            onHoverEnd={handleHoverEnd}
                                        />
                                    </div>
                                ))}

                                <div
                                    className={`pt-4 text-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                                    style={{ transitionDelay: isVisible ? `${displayEntries.length * 100}ms` : '0ms' }}
                                >
                                    <button
                                        onClick={() => navigate('/rankings')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                                    >
                                        {i18n.t('features:landing.ranking.viewFullRanking')}
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User Preview Card — keep AnimatePresence (hover UX) */}
            {showPreview && previewEntry && (
                <UserPreviewCard
                    author={convertToAuthor(previewEntry)}
                    isVisible={showPreview}
                    position={previewPosition}
                    onMouseEnter={handlePreviewMouseEnter}
                    onMouseLeave={handlePreviewMouseLeave}
                />
            )}
        </section>
    );
};
