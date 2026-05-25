import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Bell, ArrowRight } from 'lucide-react';
import i18n from '@/i18n';

import { Logo } from '../ui/Logo';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';

import { NavEntry } from './types/header.types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../features/notifications/hooks/useNotifications';

import { NotificationDropdown } from './NotificationDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import { LanguageDropdown } from './LanguageDropdown';
import { MobileMenu } from './MobileMenu';
import { DesktopNav } from './DesktopNav';

export const Header = () => {
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
    const [isAiDisabled, setIsAiDisabled] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const profileRef = useRef<HTMLDivElement>(null);
    const notiRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const langRef = useRef<HTMLDivElement>(null);

    const { notifications, loading, unreadCount, markAsRead, fetchNotifications } = useNotifications(5);



    const navEntries: NavEntry[] = useMemo(() => {
        const exploreChildren = [
            { label: i18n.t('common:breadcrumb.rankings'), href: '/rankings' },
            { label: i18n.t('common:breadcrumb.exams'), href: '/exams' },
        ];

        if (isAuthenticated) {
            exploreChildren.push({ label: i18n.t('common:breadcrumb.roadmap'), href: '/roadmap/public' });
            if (user?.role && user.role !== 'STUDENT_EXTERNAL') {
                exploreChildren.push({ label: i18n.t('common:breadcrumb.teams'), href: '/teams' });
            }
        }

        return [
            { label: i18n.t('common:breadcrumb.home'), href: '/' },
            { label: i18n.t('common:breadcrumb.competitions'), href: '/competitions' },
            { label: i18n.t('common:breadcrumb.forum'), href: '/forum' },
            { label: i18n.t('common:breadcrumb.resources'), href: '/resources' },
            { label: i18n.t('common:breadcrumb.news'), href: '/news' },
            { label: i18n.t('common:nav.explore'), children: exploreChildren },
        ];
    }, [isAuthenticated, user]);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
            if (stored) return stored;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    });

    {/* ── Effects ── */ }

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 20);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleProfileUpdate = () => setAvatarTimestamp(Date.now());
        window.addEventListener('profile:updated', handleProfileUpdate);
        return () => window.removeEventListener('profile:updated', handleProfileUpdate);
    }, []);

    useEffect(() => {
        const handleAiState = (e: Event) => {
            const state = (e as CustomEvent).detail?.state;
            setIsAiDisabled(state === 'disabled');
        };
        window.addEventListener('ai:statechange', handleAiState);
        return () => window.removeEventListener('ai:statechange', handleAiState);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const isAiWidget = target.closest?.('[data-ai-widget]');
            if (profileRef.current && !profileRef.current.contains(target)) setIsProfileOpen(false);
            if (notiRef.current && !notiRef.current.contains(target)) setIsNotiOpen(false);
            if (langRef.current && !langRef.current.contains(target)) setIsLangOpen(false);
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(target) && !isAiWidget) setIsMobileMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    // Close dropdown on route change
    useEffect(() => {
        setOpenDropdown(null);
    }, [location.pathname]);

    {/* ── Handlers ── */ }

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const handleLogout = async () => {
        await logout();
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/login');
    };

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    const isGroupActive = (children: { href: string }[]) =>
        children.some(child => isActive(child.href));

    const prefetchMap: Record<string, () => void> = useMemo(() => ({
        '/news': () => import('../../features/news/pages/NewsPage'),
        '/competitions': () => import('../../features/competitions/pages/CompetitionsPage'),
        '/forum': () => import('../../features/forum/pages/ForumPage'),
        '/resources': () => import('../../features/resources/pages/ResourcesPage'),
        '/rankings': () => import('../../features/ranking/pages/RankingPage'),
        '/exams': () => import('../../features/exams/pages/ExamsPage'),
        '/roadmap/public': () => import('../../features/roadmap/pages/RoadmapPage'),
        '/teams': () => import('../../features/team/pages/TeamManagementPage'),
    }), []);

    const handlePrefetch = useCallback((href: string) => {
        prefetchMap[href]?.();
    }, [prefetchMap]);

    const handleDropdownEnter = useCallback((label: string) => {
        if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
        setOpenDropdown(label);
    }, []);

    const handleDropdownLeave = useCallback(() => {
        dropdownTimerRef.current = setTimeout(() => setOpenDropdown(null), 150);
    }, []);

    const toggleNoti = useCallback(() => {
        if (!isNotiOpen) fetchNotifications();
        setIsNotiOpen(prev => !prev);
    }, [isNotiOpen, fetchNotifications]);

    const toggleProfile = useCallback(() => {
        setIsProfileOpen(prev => !prev);
    }, []);

    const toggleLang = useCallback(() => {
        setIsLangOpen(prev => !prev);
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,padding,border-color,box-shadow,backdrop-filter] duration-300 ${isScrolled || isMobileMenuOpen
                ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 py-3'
                : 'bg-transparent py-4 md:py-5'
                }`}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">

                {/* ── Logo ── */}
                <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity z-50 relative">
                    <Logo className="h-9 md:h-10 w-auto" />
                </Link>

                {/* ── Desktop Navigation ── */}
                {!isAuthenticated && (
                    <DesktopNav
                        navEntries={navEntries}
                        isActive={isActive}
                        isGroupActive={isGroupActive}
                        openDropdown={openDropdown}
                        onDropdownEnter={handleDropdownEnter}
                        onDropdownLeave={handleDropdownLeave}
                        onPrefetch={handlePrefetch}
                    />
                )}

                {/* ── Right Actions ── */}
                <div className="flex items-center gap-1.5 md:gap-4">

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        title={`Theme: ${theme === 'light' ? 'Light' : 'Dark'}`}
                        className={`
                            relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0
                            transition-[background-color,border-color,color,transform] duration-500 ease-out overflow-hidden border hover:scale-105
                            ${theme === 'light'
                                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                : 'bg-slate-800 border-slate-700 text-indigo-400 hover:bg-slate-700'
                            }
                        `}
                        aria-label="Toggle Theme"
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Sun
                                size={18}
                                className={`absolute transition-[transform,opacity] duration-700 ease-out ${theme === 'light'
                                    ? 'rotate-0 opacity-100 scale-100'
                                    : 'rotate-180 opacity-0 scale-0'
                                    }`}
                            />
                            <Moon
                                size={18}
                                className={`absolute transition-[transform,opacity] duration-700 ease-out ${theme === 'dark'
                                    ? 'rotate-0 opacity-100 scale-100'
                                    : '-rotate-180 opacity-0 scale-0'
                                    }`}
                            />
                        </div>
                    </button>

                    {/* Language Toggle */}
                    <LanguageDropdown
                        isOpen={isLangOpen}
                        onToggle={toggleLang}
                        onClose={() => setIsLangOpen(false)}
                        dropdownRef={langRef}
                    />

                    {/* AI Re-enable Button */}
                    {isAiDisabled && (
                        <button
                            onClick={() => window.dispatchEvent(new Event('ai:enable'))}
                            title={i18n.t('common:nav.enableAI')}
                            className="relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0
                                transition-all duration-300 overflow-hidden border
                                border-slate-200 dark:border-slate-700 hover:border-humg-blue/50 dark:hover:border-blue-400/50
                                opacity-60 hover:opacity-100 hover:scale-110
                                bg-white dark:bg-slate-800"
                        >
                            <img src="/assets/avatar-chatbot.png" alt="AI" className="w-full h-full object-cover" />
                        </button>
                    )}

                    {/* ── Desktop User Actions ── */}
                    <div className="hidden lg:flex items-center gap-3">
                        {!isLoading && (
                            isAuthenticated && user ? (
                                <>
                                    <NotificationDropdown
                                        isOpen={isNotiOpen}
                                        onToggle={toggleNoti}
                                        notifications={notifications}
                                        unreadCount={unreadCount}
                                        loading={loading}
                                        onMarkAsRead={markAsRead}
                                        onClose={() => setIsNotiOpen(false)}
                                        dropdownRef={notiRef}
                                    />

                                    <ProfileDropdown
                                        user={user}
                                        isOpen={isProfileOpen}
                                        onToggle={toggleProfile}
                                        onLogout={handleLogout}
                                        onClose={() => setIsProfileOpen(false)}
                                        avatarTimestamp={avatarTimestamp}
                                        dropdownRef={profileRef}
                                    />
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="px-5 py-2.5 rounded-full text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm min-w-[6.5rem] whitespace-nowrap text-center">
                                        {i18n.t('common:nav.login')}
                                    </Link>
                                    <Link to="/register" className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 transition-[transform,box-shadow] text-sm flex items-center justify-center gap-2 min-w-[8.5rem] whitespace-nowrap">
                                        {i18n.t('common:nav.register')} <ArrowRight size={16} />
                                    </Link>
                                </div>
                            )
                        )}
                    </div>

                    {/* ── Mobile Notification + Profile ── */}
                    {isAuthenticated && user && (
                        <>
                            <Link
                                to="/notifications"
                                className="lg:hidden relative w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                aria-label="Notifications"
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                            <Link
                                to="/profile"
                                className="lg:hidden flex items-center rounded-full"
                                aria-label="Go to profile"
                            >
                                <img
                                    src={`${getAvatarUrl(user.avatarUrl, user.fullName)}?t=${avatarTimestamp}`}
                                    alt={user.fullName}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                                    onError={(e) => handleAvatarError(e, user.fullName)}
                                />
                            </Link>
                        </>
                    )}

                    {/* ── Mobile Menu Toggle ── */}
                    <button
                        className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95"
                        onClick={toggleMobileMenu}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* ── Mobile Menu Overlay ── */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                isAuthenticated={isAuthenticated}
                user={user}
                navEntries={navEntries}
                isActive={isActive}
                unreadCount={unreadCount}
                avatarTimestamp={avatarTimestamp}
                onClose={() => setIsMobileMenuOpen(false)}
                onLogout={handleLogout}
                menuRef={mobileMenuRef}
            />
        </header>
    );
};
