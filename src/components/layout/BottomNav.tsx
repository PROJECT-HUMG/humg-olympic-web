import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, MessageSquare, Newspaper, Files } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import i18n from '@/i18n';

const getNavItems = () => [
    { href: '/competitions', icon: Trophy, label: i18n.t('common:breadcrumb.competitions') },
    { href: '/forum', icon: MessageSquare, label: i18n.t('common:breadcrumb.forum') },
    { href: '/', icon: Home, label: i18n.t('common:breadcrumb.home') },
    { href: '/resources', icon: Files, label: i18n.t('common:breadcrumb.resources') },
    { href: '/news', icon: Newspaper, label: i18n.t('common:breadcrumb.news') },
];

export const BOTTOM_NAV_PATHS = ['/', '/competitions', '/forum', '/resources', '/news'];

export const BottomNav = () => {
    const { pathname } = useLocation();
    const { isAuthenticated } = useAuth();

    const items = useMemo(() => getNavItems(), []);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    if (!isAuthenticated) return null;

    return (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 pb-safe">
            <div className="flex items-center justify-around h-14">
                {items.map(({ href, icon: Icon, label }) => {
                    const active = isActive(href);

                    return (
                        <Link
                            key={href}
                            to={href}
                            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-colors
                                ${active
                                    ? 'text-humg-blue dark:text-blue-400'
                                    : 'text-slate-400 dark:text-slate-500 active:text-slate-600'
                                }`}
                            aria-label={label}
                        >
                            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                            <span className={`text-[10px] leading-none ${active ? 'font-bold' : 'font-medium'}`}>
                                {label}
                            </span>
                            {active && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-humg-blue dark:bg-blue-400 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
