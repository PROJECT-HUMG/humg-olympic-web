import { useAuth } from '@/contexts/AuthContext';
import { LucideIcon, ChevronRight } from 'lucide-react';
import i18n from '@/i18n';

interface DashboardMenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
    path?: string;
    onClick?: () => void;
}

interface DashboardLayoutProps {
    menuItems?: DashboardMenuItem[];
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    headerAction?: React.ReactNode;
}

export const DashboardLayout = ({
    children,
    title,
    subtitle,
    headerAction
}: DashboardLayoutProps) => {
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 6) return i18n.t('dashboard:greetings.lateNight');
        if (hour < 12) return i18n.t('dashboard:greetings.morning');
        if (hour < 14) return i18n.t('dashboard:greetings.noon');
        if (hour < 18) return i18n.t('dashboard:greetings.afternoon');
        return i18n.t('dashboard:greetings.evening');
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            {title && (
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                    {getGreeting()}, {user?.fullName?.split(' ').pop() || i18n.t('dashboard:greetings.fallbackName')}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        {headerAction && (
                            <div className="flex-shrink-0">
                                {headerAction}
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
};

// Reusable Bento Card component
interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

export const BentoCard = ({
    children,
    className = '',
    onClick,
    hover = false
}: BentoCardProps) => {
    const baseClasses = "bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800";
    const hoverClasses = hover || onClick ? "hover:border-gray-300 dark:hover:border-neutral-700 transition-colors cursor-pointer" : "";

    return (
        <div
            className={`${baseClasses} ${hoverClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

// Section Header component
interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    viewAllHref?: string;
    onViewAll?: () => void;
}

export const SectionHeader = ({
    title,
    subtitle,
    action,
    viewAllHref,
    onViewAll
}: SectionHeaderProps) => {
    return (
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
            </div>
            {action && action}
            {(viewAllHref || onViewAll) && !action && (
                <button
                    onClick={onViewAll}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                >
                    {i18n.t('dashboard:greetings.viewAll')}
                    <ChevronRight size={16} />
                </button>
            )}
        </div>
    );
};

// Empty State component
interface EmptyStateProps {
    icon: React.ElementType;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action
}: EmptyStateProps) => {
    return (
        <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <Icon size={24} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};
