import { useEffect, useState, memo, type ReactNode, type ReactElement, type ElementType } from 'react';
import { LucideIcon, CheckCircle2, Clock } from 'lucide-react';
import i18n from '@/i18n';

// ============================================
// ANIMATED COUNTER
// ============================================
interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
}

export const AnimatedCounter = memo<AnimatedCounterProps>(({
    value,
    duration = 1000,
    className = '',
    prefix = '',
    suffix = ''
}) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (value === 0) {
            setDisplayValue(0);
            return;
        }

        const startTime = Date.now();
        const startValue = displayValue;
        const diff = value - startValue;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(startValue + diff * easeOutQuart);

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <span className={className}>
            {prefix}{displayValue.toLocaleString()}{suffix}
        </span>
    );
});

AnimatedCounter.displayName = 'AnimatedCounter';

// ============================================
// STATUS BADGE
// ============================================
type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type PriorityType = 'high' | 'medium' | 'low';
type TeamStatusType = 'ACTIVE' | 'PENDING' | 'FINISHED';

interface StatusBadgeProps {
    status?: StatusType;
    priority?: PriorityType;
    teamStatus?: TeamStatusType;
    label: string;
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
    icon?: LucideIcon;
}

const statusColors: Record<StatusType, string> = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
};

const priorityColors: Record<PriorityType, string> = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
};

const teamStatusColors: Record<TeamStatusType, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    FINISHED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
};

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
};

export const StatusBadge = memo<StatusBadgeProps>(({
    status,
    priority,
    teamStatus,
    label,
    size = 'md',
    pulse = false,
    icon: Icon
}) => {
    let colorClass = statusColors.neutral;

    if (priority) {
        colorClass = priorityColors[priority];
    } else if (teamStatus) {
        colorClass = teamStatusColors[teamStatus];
    } else if (status) {
        colorClass = statusColors[status];
    }

    return (
        <span className={`
            inline-flex items-center gap-1.5 font-medium rounded-full
            ${colorClass} ${sizeClasses[size]}
            ${pulse ? 'animate-pulse' : ''}
            transition-colors duration-200
        `}>
            {Icon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
            {label}
        </span>
    );
});

StatusBadge.displayName = 'StatusBadge';

// ============================================
// PROGRESS RING
// ============================================
interface ProgressRingProps {
    progress: number; // 0-100
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
    showLabel?: boolean;
    strokeWidth?: number;
    className?: string;
}

const ringColors = {
    blue: 'stroke-blue-500',
    green: 'stroke-emerald-500',
    amber: 'stroke-amber-500',
    red: 'stroke-red-500',
    purple: 'stroke-purple-500'
};

const ringSizes = {
    sm: { size: 32, stroke: 3 },
    md: { size: 48, stroke: 4 },
    lg: { size: 64, stroke: 5 }
};

export const ProgressRing = memo<ProgressRingProps>(({
    progress,
    size = 'md',
    color = 'blue',
    showLabel = true,
    className = ''
}) => {
    const { size: ringSize, stroke } = ringSizes[size];
    const radius = (ringSize - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg
                width={ringSize}
                height={ringSize}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    className="stroke-slate-200 dark:stroke-slate-700"
                />
                {/* Progress circle */}
                <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    className={`${ringColors[color]} transition-colors duration-500 ease-out`}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset
                    }}
                />
            </svg>
            {showLabel && (
                <span className={`absolute text-${size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'base'} font-semibold text-slate-700 dark:text-slate-300`}>
                    {Math.round(progress)}%
                </span>
            )}
        </div>
    );
});

ProgressRing.displayName = 'ProgressRing';

// ============================================
// GLOW CARD
// ============================================
interface GlowCardProps {
    children: ReactNode;
    glowColor?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'none';
    intensity?: 'soft' | 'medium' | 'strong';
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

const glowColors = {
    blue: 'shadow-blue-500/20 hover:shadow-blue-500/30',
    green: 'shadow-emerald-500/20 hover:shadow-emerald-500/30',
    amber: 'shadow-amber-500/20 hover:shadow-amber-500/30',
    red: 'shadow-red-500/20 hover:shadow-red-500/30',
    purple: 'shadow-purple-500/20 hover:shadow-purple-500/30',
    none: ''
};

const glowIntensity = {
    soft: 'shadow-lg',
    medium: 'shadow-xl',
    strong: 'shadow-2xl'
};

export const GlowCard = memo<GlowCardProps>(({
    children,
    glowColor = 'blue',
    intensity = 'soft',
    className = '',
    onClick,
    hover = true
}) => {
    return (
        <div
            className={`
                bg-white dark:bg-neutral-900 
                rounded-2xl border border-slate-200 dark:border-neutral-800
                ${glowColor !== 'none' ? `${glowIntensity[intensity]} ${glowColors[glowColor]}` : ''}
                ${hover ? 'hover:border-slate-300 dark:hover:border-neutral-700 transition-colors duration-300' : ''}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    );
});

GlowCard.displayName = 'GlowCard';

// ============================================
// SKELETON COMPONENTS
// ============================================
interface SkeletonProps {
    className?: string;
    animate?: boolean;
}

export const Skeleton = ({ className = '', animate = true }: SkeletonProps) => (
    <div className={`
        bg-slate-200 dark:bg-slate-700 rounded
        ${animate ? 'animate-pulse' : ''}
        ${className}
    `} />
);

export const StatCardSkeleton = memo(() => (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5">
        <div className="flex items-start justify-between">
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
    </div>
));

StatCardSkeleton.displayName = 'StatCardSkeleton';

export const TeamCardSkeleton = memo(() => (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 p-4">
        <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
        </div>
    </div>
));

TeamCardSkeleton.displayName = 'TeamCardSkeleton';

export const EventCardSkeleton = memo(() => (
    <div className="flex gap-4 py-4">
        <Skeleton className="h-14 w-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    </div>
));

EventCardSkeleton.displayName = 'EventCardSkeleton';

export const TaskCardSkeleton = memo(() => (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800">
        <Skeleton className="h-3 w-3 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
));

TaskCardSkeleton.displayName = 'TaskCardSkeleton';

// ============================================
// WELCOME HEADER
// ============================================
interface WelcomeHeaderProps {
    userName: string;
    subtitle?: string;
    avatarUrl?: string | null;
    action?: ReactNode;
}

export const WelcomeHeader = memo<WelcomeHeaderProps>(({
    userName,
    subtitle,
    avatarUrl,
    action
}) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 6) return i18n.t('dashboard:greetings.lateNight');
        if (hour < 12) return i18n.t('dashboard:greetings.morning');
        if (hour < 14) return i18n.t('dashboard:greetings.noon');
        if (hour < 18) return i18n.t('dashboard:greetings.afternoon');
        return i18n.t('dashboard:greetings.evening');
    };

    const firstName = userName?.split(' ').pop() || i18n.t('dashboard:greetings.fallbackName');

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 sm:p-8 mb-6">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/4 w-64 h-64 bg-white/5 rounded-full" />
                <div className="absolute -bottom-1/4 -left-1/4 w-48 h-48 bg-blue-400/10 rounded-full" />
            </div>

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={userName}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white/30 object-cover shadow-lg"
                        />
                    ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/10 shadow-lg">
                            <span className="text-2xl font-bold text-white">
                                {firstName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {getGreeting()}, {firstName}!
                        </h1>
                        {subtitle && (
                            <p className="text-blue-100 mt-1 text-sm sm:text-base font-medium opacity-90">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {action && (
                    <div className="flex-shrink-0">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
});

WelcomeHeader.displayName = 'WelcomeHeader';

// ============================================
// COUNTDOWN TIMER
// ============================================
interface CountdownTimerProps {
    targetDate: Date;
    onComplete?: () => void;
    size?: 'sm' | 'md';
}

export const CountdownTimer = memo<CountdownTimerProps>(({
    targetDate,
    onComplete,
    size = 'md'
}) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = targetDate.getTime() - Date.now();

            if (difference <= 0) {
                onComplete?.();
                return { days: 0, hours: 0, minutes: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60)
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);

        return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

    return (
        <div className={`
            inline-flex items-center gap-1 
            ${isUrgent ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}
            ${size === 'sm' ? 'text-xs' : 'text-sm'}
        `}>
            {timeLeft.days > 0 && (
                <span className="font-medium">{timeLeft.days}d</span>
            )}
            <span className="font-medium">{timeLeft.hours}h</span>
            <span className="font-medium">{timeLeft.minutes}m</span>
            {isUrgent && <span className="animate-pulse">⏰</span>}
        </div>
    );
});

CountdownTimer.displayName = 'CountdownTimer';

// ============================================
// PRIORITY INDICATOR
// ============================================
interface PriorityIndicatorProps {
    priority: 'high' | 'medium' | 'low';
    showLabel?: boolean;
    size?: 'sm' | 'md';
}

const priorityConfig = {
    high: { color: 'bg-red-500', label: 'High', ring: 'ring-red-500/30' },
    medium: { color: 'bg-amber-500', label: i18n.t('dashboard:priority.medium'), ring: 'ring-amber-500/30' },
    low: { color: 'bg-emerald-500', label: i18n.t('dashboard:priority.low'), ring: 'ring-emerald-500/30' }
};

export const PriorityIndicator = memo<PriorityIndicatorProps>(({
    priority,
    showLabel = false,
    size = 'md'
}) => {
    const config = priorityConfig[priority];

    return (
        <div className="flex items-center gap-2">
            <span className={`
                ${size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'} 
                rounded-full ${config.color}
                ${priority === 'high' ? 'animate-pulse ring-4 ' + config.ring : ''}
            `} />
            {showLabel && (
                <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-slate-600 dark:text-slate-400`}>
                    {config.label}
                </span>
            )}
        </div>
    );
});

PriorityIndicator.displayName = 'PriorityIndicator';

// ============================================
// AWARD BADGE
// ============================================
interface AwardBadgeProps {
    award: 'FIRST' | 'SECOND' | 'THIRD' | 'CONSOLATION' | 'PARTICIPATION';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const awardConfig = {
    FIRST: { emoji: '🥇', label: i18n.t('dashboard:prizes.first'), color: 'text-yellow-500' },
    SECOND: { emoji: '🥈', label: i18n.t('dashboard:prizes.second'), color: 'text-slate-400' },
    THIRD: { emoji: '🥉', label: i18n.t('dashboard:prizes.third'), color: 'text-orange-600' },
    CONSOLATION: { emoji: '🏅', label: i18n.t('dashboard:prizes.consolation'), color: 'text-blue-500' },
    PARTICIPATION: { emoji: '🎖️', label: i18n.t('dashboard:participation'), color: 'text-slate-500' }
};

export const AwardBadge = memo<AwardBadgeProps>(({
    award,
    size = 'md',
    showLabel = false
}) => {
    const config = awardConfig[award];
    const sizeClass = size === 'sm' ? 'text-base' : size === 'md' ? 'text-xl' : 'text-2xl';

    return (
        <span className={`inline-flex items-center gap-1.5 ${config.color}`}>
            <span className={sizeClass}>{config.emoji}</span>
            {showLabel && (
                <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium`}>
                    {config.label}
                </span>
            )}
        </span>
    );
});

AwardBadge.displayName = 'AwardBadge';

// ============================================
// COLOR TOKENS (shared across all dashboards)
// ============================================
export const colorTokens = {
    icon: {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
    },
    bg: {
        blue: 'from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/20',
        green: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-900/20',
        purple: 'from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-900/20',
        amber: 'from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-900/20',
        red: 'from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-900/20',
        cyan: 'from-cyan-50 to-cyan-100 dark:from-cyan-900/10 dark:to-cyan-900/20',
    },
    action: {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50',
        green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50',
        red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/50',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50',
    },
} as const;

export type ColorKey = keyof typeof colorTokens.icon;

// ============================================
// DASHBOARD STAT CARD (shared across all dashboards)
// ============================================
interface DashboardStatCardProps {
    label: string;
    value: number;
    icon: ElementType;
    color: ColorKey;
    trend?: { value: string; positive: boolean };
    onClick?: () => void;
}

export const DashboardStatCard = memo<DashboardStatCardProps>(({ label, value, icon: Icon, color, trend, onClick }) => (
    <div
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors duration-300 group ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${colorTokens.bg[color]}`} />
        <div className="relative flex items-start justify-between">
            <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    <AnimatedCounter value={value} duration={800} />
                </p>
                {trend && (
                    <p className={`text-xs mt-1 ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trend.positive ? '↑' : '↓'} {trend.value}
                    </p>
                )}
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorTokens.icon[color]} transform group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={18} />
            </div>
        </div>
    </div>
));

DashboardStatCard.displayName = 'DashboardStatCard';

// ============================================
// DASHBOARD TAB BAR (shared across Admin + Lecturer)
// ============================================
export interface DashboardTab<T extends string = string> {
    key: T;
    label: string;
    icon: ElementType;
    badge?: number;
    urgent?: boolean;
}

interface DashboardTabBarProps<T extends string = string> {
    tabs: DashboardTab<T>[];
    activeTab: T;
    onChange: (tab: T) => void;
}

export const DashboardTabBar = memo(<T extends string>({ tabs, activeTab, onChange }: DashboardTabBarProps<T>) => (
    <div className="mb-6 border-b border-slate-200 dark:border-neutral-800">
        <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <tab.icon size={18} />
                    {tab.label}
                    {tab.badge !== undefined && (
                        <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${tab.urgent
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                            : activeTab === tab.key
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-400'
                            }`}>
                            {tab.badge}
                        </span>
                    )}
                </button>
            ))}
        </nav>
    </div>
)) as <T extends string>(props: DashboardTabBarProps<T>) => ReactElement;

(DashboardTabBar as { displayName?: string }).displayName = 'DashboardTabBar';

// ============================================
// DASHBOARD QUICK ACTION (shared across Admin + Lecturer)
// ============================================
interface DashboardQuickActionProps {
    icon: ElementType;
    label: string;
    onClick: () => void;
    color?: ColorKey;
}

export const DashboardQuickAction = memo<DashboardQuickActionProps>(({ icon: Icon, label, onClick, color = 'blue' }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors duration-200 text-center group"
    >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${colorTokens.action[color]}`}>
            <Icon size={18} />
        </div>
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </button>
));

DashboardQuickAction.displayName = 'DashboardQuickAction';

// ============================================
// DASHBOARD TASK CARD (shared across Lecturer + Admin)
// ============================================

interface DashboardTaskCardProps {
    task: { id: number; title: string; description?: string; dueAt?: string | null; priority: 'high' | 'medium' | 'low' };
    onComplete: () => void;
    isSubmitting: boolean;
    compact?: boolean;
}

export const DashboardTaskCard = memo<DashboardTaskCardProps>(({ task, onComplete, isSubmitting, compact = false }) => (
    <div className={`
        flex items-center gap-3 ${compact ? 'p-3' : 'p-4'}
        rounded-xl bg-slate-50 dark:bg-neutral-800
        ${task.priority === 'high' ? 'ring-1 ring-red-200 dark:ring-red-900/50' : ''}
        transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-neutral-700
    `}>
        <PriorityIndicator priority={task.priority} />
        <div className="flex-1 min-w-0">
            <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-slate-900 dark:text-white truncate`}>
                {task.title}
            </p>
            {!compact && task.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
            )}
            {task.dueAt && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    {task.dueAt}
                </p>
            )}
        </div>
        <button
            disabled={isSubmitting}
            onClick={onComplete}
            className={`
                ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
                font-medium bg-emerald-600 text-white rounded-lg
                hover:bg-emerald-700 transition-colors disabled:opacity-50
                flex items-center gap-1
            `}
        >
            <CheckCircle2 size={compact ? 14 : 16} />
            {compact ? '' : i18n.t('dashboard:taskComplete')}
        </button>
    </div>
));

DashboardTaskCard.displayName = 'DashboardTaskCard';

// ============================================
// DASHBOARD ACTIVITY ITEM (shared across Student + Admin)
// ============================================
interface DashboardActivityItemProps {
    activity: { id: string; text: string; time: string; type: 'info' | 'success' | 'warning' };
}

const activityTypeColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
};

export const DashboardActivityItem = memo<DashboardActivityItemProps>(({ activity }) => (
    <div className="flex gap-4 relative group">
        <div className={`
            w-3 h-3 rounded-full mt-1 flex-shrink-0 z-10
            ring-4 ring-white dark:ring-neutral-900
            ${activityTypeColors[activity.type]}
            group-hover:scale-125 transition-transform duration-200
        `} />
        <div className="flex-1 min-w-0 pb-1">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{activity.text}</p>
            <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
        </div>
    </div>
));

DashboardActivityItem.displayName = 'DashboardActivityItem';
