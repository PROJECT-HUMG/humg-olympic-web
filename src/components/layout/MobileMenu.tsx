import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { getUserNameColor } from '@/utils/rankingHelpers';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';
import { NavEntry, isNavGroup } from './types/header.types';
import { BOTTOM_NAV_PATHS } from './BottomNav';
import i18n from '@/i18n';

interface MobileMenuProps {
    isOpen: boolean;
    isAuthenticated: boolean;
    user: {
        fullName: string;
        email: string;
        avatarUrl?: string | null;
        xpPoints?: number;
    } | null;
    navEntries: NavEntry[];
    isActive: (path: string) => boolean;
    unreadCount: number;
    avatarTimestamp: number;
    onClose: () => void;
    onLogout: () => void;
    menuRef: React.RefObject<HTMLDivElement | null>;
}

export const MobileMenu = ({
    isOpen,
    isAuthenticated,
    user,
    navEntries,
    isActive,
    unreadCount,
    avatarTimestamp,
    onClose,
    onLogout,
    menuRef,
}: MobileMenuProps) => {
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    const toggleGroup = (label: string) => {
        setExpandedGroup(prev => prev === label ? null : label);
    };

    return (
        <div
            ref={menuRef}
            className={`lg:hidden fixed inset-x-0 top-[60px] md:top-[72px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col z-40 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 max-h-[90vh]' : 'opacity-0 max-h-0 pointer-events-none'
                }`}
        >
            <div className="p-3 space-y-2.5 max-h-[90vh] overflow-y-auto">
                {/* ── User Info ── */}
                {isAuthenticated && user && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <img
                            src={`${getAvatarUrl(user.avatarUrl, user.fullName)}?t=${avatarTimestamp}`}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-600"
                            onError={(e) => handleAvatarError(e, user.fullName)}
                        />
                        <div>
                            <p className={`font-bold ${getUserNameColor(user.xpPoints)}`}>{user.fullName}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                    </div>
                )}

                {/* ── Nav Entries ── */}
                <div className="space-y-1">
                    {navEntries.map((entry) => {
                        if (isNavGroup(entry)) {
                            // Filter out children already in bottom nav (only when authenticated, because guests don't see bottom nav)
                            const visibleChildren = isAuthenticated
                                ? entry.children.filter(child => !BOTTOM_NAV_PATHS.includes(child.href))
                                : entry.children;

                            // If all children are in bottom nav, skip this group
                            if (visibleChildren.length === 0) return null;

                            const groupActive = entry.children.some(c => isActive(c.href));
                            const isExpanded = expandedGroup === entry.label;

                            return (
                                <div key={entry.label}>
                                    {/* ── Group Header ── */}
                                    <button
                                        onClick={() => toggleGroup(entry.label)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${groupActive
                                            ? 'text-humg-blue dark:text-blue-400'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {entry.label}
                                        <ChevronDown
                                            size={16}
                                            className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* ── Children (accordion) ── */}
                                    <div
                                        className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="pl-3 space-y-0.5 pb-1">
                                            {visibleChildren.map((child) => (
                                                <Link
                                                    key={child.href}
                                                    to={child.href}
                                                    onClick={onClose}
                                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(child.href)
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-humg-blue dark:text-blue-400'
                                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                                                        }`}
                                                >
                                                    {child.label}
                                                    {isActive(child.href) && <span className="w-1.5 h-1.5 rounded-full bg-humg-blue" />}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Direct item — skip if in bottom nav (only when authenticated)
                        if (isAuthenticated && BOTTOM_NAV_PATHS.includes(entry.href)) return null;

                        return (
                            <Link
                                key={entry.label}
                                to={entry.href}
                                onClick={onClose}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(entry.href)
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-humg-blue dark:text-blue-400'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {entry.label}
                                {isActive(entry.href) && <span className="w-1.5 h-1.5 rounded-full bg-humg-blue" />}
                            </Link>
                        );
                    })}
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                {/* ── Actions ── */}
                {isAuthenticated ? (
                    <div className="flex flex-col gap-2">
                        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-bold active:bg-red-100 transition-colors">
                            <LogOut size={20} /> {i18n.t('common:nav.logout')}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <Link to="/login" onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-sm font-bold text-slate-700 dark:text-slate-200 active:bg-slate-50">
                            {i18n.t('common:nav.login')}
                        </Link>
                        <Link to="/register" onClick={onClose} className="w-full py-2.5 rounded-xl bg-humg-blue text-white text-center text-sm font-bold shadow-lg active:scale-95 transition-transform">
                            {i18n.t('common:nav.register')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
