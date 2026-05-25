import { type CSSProperties } from 'react';
import { Award } from 'lucide-react';
import { BadgeItem } from '@/features/auth/types/auth.types';
import i18n from '@/i18n';

/* ── Facebook-style verified badge SVG ── */
const FacebookVerifiedIcon = ({ size, fill, title }: { size: number; fill: string; title: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={title}
        role="img"
    >
        <title>{title}</title>
        {/* Starburst polygon background */}
        <path
            d="M12 1.5l2.39 3.07L18.06 3.6l.47 3.82 3.55 1.45-1.78 3.4L22 15.53l-3.27 2.02-.02 3.86-3.82.3L12 24l-2.89-2.29-3.82-.3-.02-3.86L2 15.53l1.7-3.26-1.78-3.4 3.55-1.45.47-3.82 3.67.97L12 1.5z"
            fill={fill}
        />
        {/* White checkmark */}
        <path
            d="M10.2 16.5l-3.7-3.7 1.4-1.4 2.3 2.3 5.1-5.1 1.4 1.4-6.5 6.5z"
            fill="white"
        />
    </svg>
);

interface VerifiedBadgeProps {
    role: string;
    size?: number;
}

export const VerifiedBadge = ({ role, size = 14 }: VerifiedBadgeProps) => {
    if (['ADMIN'].includes(role)) {
        return (
            <FacebookVerifiedIcon
                size={size + 4}
                fill="#f43f5e"
                title={i18n.t('features:badges.verifiedAdmin')}
            />
        );
    }
    if (['LECTURER', 'COACH', 'HEAD_COACH', 'DEPUTY_COACH'].includes(role)) {
        return (
            <FacebookVerifiedIcon
                size={size + 4}
                fill="#1d9bf0"
                title={i18n.t('features:badges.verifiedLecturer')}
            />
        );
    }

    return null;
};

interface StudentBadgesProps {
    badges?: BadgeItem[];
    maxDisplay?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeConfig = {
    xs: { icon: 14, container: 'w-5 h-5' },
    sm: { icon: 16, container: 'w-[22px] h-[22px]' },
    md: { icon: 20, container: 'w-7 h-7' },
    lg: { icon: 24, container: 'w-8 h-8' },
};

const NATIONAL_GLOW: Record<number, {
    color: string;
    glowColor: string;
    shadowClass: string;
}> = {
    4: {
        color: 'text-yellow-400',
        glowColor: 'rgba(234, 179, 8, 0.75)',
        shadowClass: 'animate-[badge-glow_2s_ease-in-out_infinite] drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]',
    },
    3: {
        color: 'text-slate-300',
        glowColor: 'rgba(203, 213, 225, 0.75)',
        shadowClass: 'animate-[badge-glow_2s_ease-in-out_infinite] drop-shadow-[0_0_5px_rgba(203,213,225,0.8)]',
    },
    2: {
        color: 'text-orange-400',
        glowColor: 'rgba(251, 146, 60, 0.75)',
        shadowClass: 'animate-[badge-glow_2s_ease-in-out_infinite] drop-shadow-[0_0_5px_rgba(251,146,60,0.8)]',
    },
    1: {
        color: 'text-stone-400',
        glowColor: 'rgba(168, 162, 158, 0.6)',
        shadowClass: 'animate-[badge-glow_2.5s_ease-in-out_infinite] drop-shadow-[0_0_4px_rgba(168,162,158,0.7)]',
    },
};

const getNonNationalColor = (level: number) => {
    switch (level) {
        case 4: return 'text-yellow-500 dark:text-yellow-400';
        case 3: return 'text-slate-400 dark:text-slate-300';
        case 2: return 'text-orange-600 dark:text-orange-500';
        default: return 'text-stone-500 dark:text-stone-400';
    }
};

export const StudentBadges = ({ badges, maxDisplay = 3, size = 'sm' }: StudentBadgesProps) => {
    if (!badges || badges.length === 0) return null;

    const selectedBadges = badges.filter(b => b.isSelected && b.isEarned);
    if (selectedBadges.length === 0) return null;

    const displayBadges = selectedBadges.slice(0, maxDisplay);
    const cfg = sizeConfig[size];

    return (
        <div className="flex items-center gap-1">
            {displayBadges.map(badge => {
                const isNational = badge.type === 'NATIONAL';
                const glow = isNational ? NATIONAL_GLOW[badge.level] : null;
                const glowVarStyle = isNational && glow
                    ? { '--glow-color': glow.glowColor } as CSSProperties
                    : undefined;

                return (
                    <div
                        key={badge.id}
                        className={`${cfg.container} rounded-md flex items-center justify-center
                            hover:scale-110 active:scale-95 transition-transform cursor-help
                            ${badge.iconUrl ? '' : (glow ? glow.color : getNonNationalColor(badge.level))}
                            ${glow ? glow.shadowClass : ''}`}
                        style={glowVarStyle}
                        title={badge.name}
                    >
                        {badge.iconUrl ? (
                            <img
                                src={badge.iconUrl}
                                alt={badge.name}
                                className="w-full h-full object-cover rounded-sm"
                            />
                        ) : (
                            <Award
                                size={cfg.icon}
                                strokeWidth={isNational ? 2.5 : 2}
                                className="drop-shadow-sm"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
