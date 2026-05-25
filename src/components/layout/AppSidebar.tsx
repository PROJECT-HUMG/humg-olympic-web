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

const canAccessTeams = (role?: string) => Boolean(role && role !== 'STUDENT_EXTERNAL');

export const AppSidebar = () => {
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
        <aside className="hidden lg:block fixed left-5 top-24 bottom-5 z-40 w-[17rem]">
            <div className="h-full rounded-[2rem] border border-white/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 shadow-xl shadow-slate-900/10 dark:shadow-black/20 backdrop-blur-2xl overflow-hidden">
                <div className="h-full flex flex-col p-3">
                    <div className="px-3 pt-2 pb-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                            HUMG Olympic
                        </p>
                    </div>

                    <nav className="flex-1 overflow-y-auto pr-1 space-y-5">
                        {sections.map((section) => (
                            <div key={section.id}>
                                <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                                    {section.label}
                                </p>
                                <div className="space-y-1">
                                    {section.items.map(({ href, label, icon: Icon }) => {
                                        const active = isActive(href);

                                        return (
                                            <Link
                                                key={href}
                                                to={href}
                                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-[background-color,color,transform,box-shadow] min-h-11 ${active
                                                    ? 'bg-humg-blue text-white shadow-lg shadow-blue-900/15 dark:shadow-blue-500/10'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:text-humg-blue dark:hover:text-blue-300'
                                                    }`}
                                            >
                                                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-humg-blue dark:group-hover:text-blue-300'
                                                    }`}>
                                                    <Icon size={18} />
                                                </span>
                                                <span className="truncate">{label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <Link
                        to="/profile"
                        className="mt-3 flex items-center gap-3 rounded-[1.5rem] border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 p-3 hover:border-humg-blue/30 dark:hover:border-blue-400/30 transition-colors"
                    >
                        <img
                            src={getAvatarUrl(user.avatarUrl, user.fullName)}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-2xl object-cover border border-white dark:border-slate-700"
                            onError={(e) => handleAvatarError(e, user.fullName)}
                        />
                        <div className="min-w-0">
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
