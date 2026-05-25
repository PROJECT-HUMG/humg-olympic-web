export interface RankTier {
    id: string;
    label: string;
    minPoints: number;
    maxPoints: number;
    textColor: string;
    firstLetterColor?: string;
    bgColor: string;
    ringColor: string;
}

export const RANK_TIERS: RankTier[] = [
    {
        id: 'NEWBIE',
        label: 'Newbie',
        minPoints: 0,
        maxPoints: 1,
        textColor: 'text-slate-500 dark:text-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        ringColor: 'ring-slate-400',
    },
    {
        id: 'PUPIL',
        label: 'Pupil',
        minPoints: 2,
        maxPoints: 3,
        textColor: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        ringColor: 'ring-green-500',
    },
    {
        id: 'SPECIALIST',
        label: 'Specialist',
        minPoints: 4,
        maxPoints: 6,
        textColor: 'text-cyan-600 dark:text-cyan-400',
        bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
        ringColor: 'ring-cyan-500',
    },
    {
        id: 'EXPERT',
        label: 'Expert',
        minPoints: 7,
        maxPoints: 9,
        textColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        ringColor: 'ring-blue-500',
    },
    {
        id: 'CANDIDATE_MASTER',
        label: 'Candidate Master',
        minPoints: 10,
        maxPoints: 12,
        textColor: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        ringColor: 'ring-purple-500',
    },
    {
        id: 'MASTER',
        label: 'Master',
        minPoints: 13,
        maxPoints: 15,
        textColor: 'text-orange-500 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        ringColor: 'ring-orange-500',
    },
    {
        id: 'GRANDMASTER',
        label: 'Grandmaster',
        minPoints: 16,
        maxPoints: 19,
        textColor: 'text-red-600 dark:text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        ringColor: 'ring-red-500',
    },
    {
        id: 'LEGENDARY_GRANDMASTER',
        label: 'Legendary Grandmaster',
        minPoints: 20,
        maxPoints: Infinity,
        textColor: 'text-red-600 dark:text-red-500',
        firstLetterColor: 'text-slate-900 dark:text-white',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        ringColor: 'ring-red-600',
    },
];

export const getRankTier = (points: number): RankTier => {
    return RANK_TIERS.find(t => points >= t.minPoints && points <= t.maxPoints) || RANK_TIERS[0];
};

export const getUserNameColor = (points?: number): string => {
    if (points === undefined || points === null) return 'text-slate-800 dark:text-slate-300';
    return getRankTier(points).textColor;
};

interface RankedUsernameProps {
    name: string;
    points?: number;
    className?: string;
    truncate?: boolean;
}

export const RankedUsername = ({ name, points = 0, className = '', truncate = false }: RankedUsernameProps) => {
    const tier = getRankTier(points);
    const safeName = name || 'Unknown';
    if (tier.firstLetterColor) {
        return (
            <span className={`inline-flex items-center font-bold tracking-tight ${className}`} title={`${tier.label} (${points} XP)`}>
                <span className={tier.firstLetterColor}>
                    {safeName.charAt(0)}
                </span>
                <span className={`${tier.textColor} ${truncate ? 'truncate' : ''}`}>
                    {safeName.slice(1)}
                </span>
            </span>
        );
    }
    return (
        <span
            className={`font-bold ${tier.textColor} ${className} ${truncate ? 'truncate' : ''}`}
            title={`${tier.label} (${points} XP)`}
        >
            {safeName}
        </span>
    );
};

export const RankBadge = ({ points }: { points: number }) => {
    const tier = getRankTier(points);

    return (
        <span className={`
            inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
            ${tier.bgColor} ${tier.textColor} border border-current/10
        `}>
            {tier.label}
        </span>
    );
};