import { useState, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { RankedUsername } from '@/utils/rankingHelpers';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';
import { Author } from '@/features/forum/types/forum.types';
import { VerifiedBadge, StudentBadges } from '@/features/badges/components/VerifiedBadge';
import i18n from '@/i18n';

interface UserPreviewCardProps {
    author: Author;
    isVisible: boolean;
    position: { x: number; y: number; width?: number; height?: number };
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export const UserPreviewCard = ({ author, isVisible, position, onMouseEnter, onMouseLeave }: UserPreviewCardProps) => {
    const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (isVisible && cardRef.current) {
            const card = cardRef.current;
            const rect = card.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const padding = 16;
            const CARD_WIDTH = 320;

            let x = position.x + 20;

            if (x + CARD_WIDTH > viewportWidth - padding) {
                x = position.x - CARD_WIDTH - 20;
            }

            if (x < padding) {
                x = Math.max(padding, Math.min(position.x - CARD_WIDTH / 2, viewportWidth - CARD_WIDTH - padding));
            }
            let y = position.y;

            if (y + rect.height > viewportHeight - padding) {
                y = Math.max(padding, position.y - rect.height - 16);
            }

            setAdjustedPosition({ x, y });
        }
    }, [isVisible, position]);

    if (!isVisible) return null;

    const nameLength = author.name.length;
    let fontSizeClass = 'text-lg';
    let badgeSize = 16;

    if (nameLength > 22) {
        fontSizeClass = 'text-sm';
        badgeSize = 14;
    } else if (nameLength > 15) {
        fontSizeClass = 'text-base';
        badgeSize = 14;
    }

    const card = (
        <div
            ref={cardRef}
            className="fixed z-1000 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-opacity duration-200 animate-in fade-in zoom-in-95"
            style={{
                left: `${adjustedPosition.x}px`,
                top: `${adjustedPosition.y}px`,
                pointerEvents: 'auto',
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Header */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5">
                <div className="flex items-center gap-4">
                    <Link to={`/profile/${author.id}`} className="shrink-0">
                        <img
                            src={getAvatarUrl(author.avatar, author.name)}
                            alt={author.name}
                            className="w-16 h-16 rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-md hover:scale-105 transition-transform"
                            onError={(e) => handleAvatarError(e, author.name)}
                        />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className={`${fontSizeClass} font-bold leading-tight wrap-break-word`}>
                            <Link
                                to={`/profile/${author.id}`}
                                className="inline mr-1.5"
                            >
                                <RankedUsername
                                    name={author.name}
                                    points={author.xpPoints}
                                    className="leading-tight"
                                />
                            </Link>
                            <span className="inline-flex items-center gap-1.5 align-middle whitespace-nowrap">
                                <VerifiedBadge role={author.role} size={badgeSize} />
                                <StudentBadges badges={author.badges} maxDisplay={3} />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 pt-4 space-y-4">
                <div className="flex justify-start">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${['ADMIN', 'LECTURER', 'HEAD_COACH', 'COACH'].includes(author.role)
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                        {author.role === 'ADMIN' && i18n.t('features:profile.roles.admin')}
                        {author.role === 'LECTURER' && i18n.t('features:profile.roles.lecturer')}
                        {author.role === 'HEAD_COACH' && i18n.t('features:profile.roles.headCoach')}
                        {author.role === 'DEPUTY_COACH' && i18n.t('features:profile.roles.deputyCoach')}
                        {author.role === 'COACH' && i18n.t('features:profile.roles.coach')}
                        {author.role === 'CAPTAIN' && i18n.t('features:profile.roles.captain')}
                        {author.role === 'MEMBER' && i18n.t('features:profile.roles.member')}
                        {!['ADMIN', 'LECTURER', 'HEAD_COACH', 'DEPUTY_COACH', 'COACH', 'CAPTAIN', 'MEMBER'].includes(author.role) && i18n.t('features:profile.roles.student')}
                    </span>
                </div>

                {author.badges && author.badges.filter(b => b.isEarned !== false).length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {i18n.t('features:profile.preview.achievements')}
                        </div>
                        <div className="space-y-2.5">
                            {author.badges
                                .filter(b => b.isEarned !== false)
                                .slice(0, 3)
                                .map(badge => (
                                    <div key={badge.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-white leading-tight mb-0.5">
                                                {badge.name}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                                                {badge.description}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                <Link
                    to={`/profile/${author.id}`}
                    className="flex items-center justify-center w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
                >
                    {i18n.t('features:profile.preview.viewProfile')}
                </Link>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(card, document.body) : card;
};
