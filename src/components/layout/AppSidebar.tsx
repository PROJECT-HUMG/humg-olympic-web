import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Bell,
    FileText,
    Home,
    Library,
    Map,
    MessageSquare,
    Newspaper,
    PanelLeftClose,
    Settings,
    Trophy,
    User,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import i18n from '@/i18n';

import { useAuth } from '@/contexts/AuthContext';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';
import { getUserNameColor } from '@/utils/rankingHelpers';
import { getRoleLabel } from './headerHelpers';

interface SidebarItem {
    href: string;
    label: string;
    icon: LucideIcon;
}

interface SidebarSection {
    id: string;
    label: string;
    items: SidebarItem[];
}

interface AppSidebarProps {
    isPinned?: boolean;
    isExpanded?: boolean;
    onTogglePin?: () => void;
    onHoverChange?: (isHovered: boolean) => void;
}

const canAccessTeams = (role?: string) => Boolean(role && role !== 'STUDENT_EXTERNAL');

export const AppSidebar = ({
    isPinned = true,
    isExpanded = true,
    onTogglePin,
    onHoverChange,
}: AppSidebarProps) => {
    const { user, isAuthenticated } = useAuth();
    const { pathname, search } = useLocation();

    const sections = useMemo<SidebarSection[]>(() => {
        if (!isAuthenticated) return [];

        const communityItems: SidebarItem[] = [
            { href: '/forum', label: i18n.t('common:breadcrumb.forum'), icon: MessageSquare },
            { href: '/rankings', label: i18n.t('common:breadcrumb.rankings'), icon: Trophy },
            { href: '/news', label: i18n.t('common:breadcrumb.news'), icon: Newspaper },
        ];

        if (canAccessTeams(user?.role)) {
            communityItems.push({ href: '/teams', label: i18n.t('common:breadcrumb.teams'), icon: Users });
        }

        return [
            {
                id: 'main',
                label: i18n.t('common:nav.mainNavigation'),
                items: [
                    { href: '/', label: i18n.t('common:nav.dashboard'), icon: Home },
                    { href: '/competitions', label: i18n.t('common:breadcrumb.competitions'), icon: Trophy },
                    { href: '/exams', label: i18n.t('common:breadcrumb.exams'), icon: FileText },
                    { href: '/roadmap/public', label: i18n.t('common:breadcrumb.roadmap'), icon: Map },
                    { href: '/resources', label: i18n.t('common:breadcrumb.resources'), icon: Library },
                ],
            },
            {
                id: 'community',
                label: i18n.t('common:nav.community'),
                items: communityItems,
            },
            {
                id: 'account',
                label: i18n.t('common:nav.account'),
                items: [
                    { href: '/notifications', label: i18n.t('common:breadcrumb.notifications'), icon: Bell },
                    { href: '/profile', label: i18n.t('common:breadcrumb.profile'), icon: User },
                    { href: '/profile?tab=settings', label: i18n.t('common:nav.settings'), icon: Settings },
                ],
            },
        ];
    }, [isAuthenticated, user?.role]);

    const isActive = (href: string) => {
        const [path, query] = href.split('?');
        if (query) return pathname === path && search === `?${query}`;
        if (path === '/') return pathname === '/';
        if (path === '/profile') return pathname.startsWith(path) && search !== '?tab=settings';
        return pathname.startsWith(path);
    };

    if (!isAuthenticated || !user) return null;

    return (
        <aside
            onMouseEnter={() => onHoverChange?.(true)}
            onMouseLeave={() => onHoverChange?.(false)}
            className={`hidden lg:block fixed left-5 top-20 bottom-4 z-40 transition-[width] duration-300 ease-out ${isExpanded ? 'w-[17rem]' : 'w-20'}`}
        >
            <div className="h-full rounded-[2rem] border border-white/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 shadow-xl shadow-slate-900/10 dark:shadow-black/20 backdrop-blur-2xl overflow-hidden">
                <div className="h-full flex flex-col p-2.5">
                    <div className={`flex items-center pt-1.5 pb-2.5 ${isExpanded ? 'justify-between px-3' : 'justify-center px-0'}`}>
                        <p className={`text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 transition-[opacity,width] duration-200 overflow-hidden whitespace-nowrap ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                            HUMG Olympic
                        </p>
                        {onTogglePin && (
                            <button
                                type="button"
                                onClick={onTogglePin}
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-humg-blue dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isPinned ? 'text-humg-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                title={isPinned ? i18n.t('common:nav.unpinSidebar') : i18n.t('common:nav.pinSidebar')}
                                aria-label={isPinned ? i18n.t('common:nav.unpinSidebar') : i18n.t('common:nav.pinSidebar')}
                            >
                                <PanelLeftClose size={18} className={`transition-transform ${isPinned ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>

                    <nav className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
                        {sections.map((section) => (
                            <div key={section.id}>
                                <p className={`px-3 mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 transition-[opacity,height] duration-200 overflow-hidden whitespace-nowrap ${isExpanded ? 'opacity-100 h-4' : 'opacity-0 h-0'}`}>
                                    {section.label}
                                </p>
                                <div className="space-y-0.5">
                                    {section.items.map(({ href, label, icon: Icon }) => {
                                        const active = isActive(href);

                                        return (
                                            <Link
                                                key={href}
                                                to={href}
                                                title={!isExpanded ? label : undefined}
                                                className={`group flex items-center rounded-2xl text-sm font-semibold transition-[background-color,color,transform,box-shadow] min-h-10 ${isExpanded ? 'gap-2.5 px-3 py-1.5' : 'justify-center px-0 py-1.5'} ${active
                                                    ? 'bg-humg-blue text-white shadow-lg shadow-blue-900/15 dark:shadow-blue-500/10'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:text-humg-blue dark:hover:text-blue-300'
                                                    }`}
                                            >
                                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-humg-blue dark:group-hover:text-blue-300'
                                                    }`}>
                                                    <Icon size={18} />
                                                </span>
                                                <span className={`truncate transition-[opacity,width] duration-200 overflow-hidden whitespace-nowrap ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                                                    {label}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <Link
                        to="/profile"
                        title={!isExpanded ? user.fullName : undefined}
                        className={`mt-2.5 flex items-center rounded-[1.25rem] border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 hover:border-humg-blue/30 dark:hover:border-blue-400/30 transition-colors ${isExpanded ? 'gap-2.5 p-2.5' : 'justify-center p-2'}`}
                    >
                        <img
                            src={getAvatarUrl(user.avatarUrl, user.fullName)}
                            alt={user.fullName}
                            className="w-9 h-9 rounded-2xl object-cover border border-white dark:border-slate-700"
                            onError={(e) => handleAvatarError(e, user.fullName)}
                        />
                        <div className={`min-w-0 transition-[opacity,width] duration-200 overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                            <p className={`text-sm font-bold truncate ${getUserNameColor(user.xpPoints)}`}>
                                {user.fullName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {getRoleLabel(user.role)}
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </aside>
    );
};
