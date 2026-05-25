import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { VerifiedBadge } from '@/features/badges/components/VerifiedBadge';
import { getUserNameColor } from '@/utils/rankingHelpers';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';
import { getRoleLabel } from './headerHelpers';
import i18n from '@/i18n';

interface ProfileDropdownProps {
    user: {
        fullName: string;
        email: string;
        role?: string;
        avatarUrl?: string | null;
        xpPoints?: number;
    };
    isOpen: boolean;
    onToggle: () => void;
    onLogout: () => void;
    onClose: () => void;
    avatarTimestamp: number;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export const ProfileDropdown = ({
    user,
    isOpen,
    onToggle,
    onLogout,
    onClose,
    avatarTimestamp,
    dropdownRef,
}: ProfileDropdownProps) => {
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={onToggle}
                className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-[background-color,border-color,transform] duration-200 hover:scale-[1.02] ${isOpen
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-humg-blue/50'
                    }`}
            >
                <img
                    src={`${getAvatarUrl(user.avatarUrl, user.fullName)}?t=${avatarTimestamp}`}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                    onError={(e) => handleAvatarError(e, user.fullName)}
                />
                <span className={`text-sm font-semibold max-w-[100px] truncate hidden xl:block ${getUserNameColor(user.xpPoints)}`}>
                    {user.fullName?.split(' ').pop()}
                </span>
                <div className="hidden xl:flex items-center gap-1">
                    <VerifiedBadge role={user.role ?? ''} size={12} />
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div
                className={`absolute right-0 top-full mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden origin-top-right z-50 transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}`}
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-bold truncate ${getUserNameColor(user.xpPoints)}`}>{user.fullName}</p>
                        <VerifiedBadge role={user.role ?? ''} size={12} />
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded">
                        {getRoleLabel(user.role)}
                    </span>
                </div>
                <div className="p-2 space-y-1">
                    <Link to="/profile" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <UserIcon size={18} /> {i18n.t('common:nav.profile')}
                    </Link>
                    <Link to="/profile?tab=settings" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Settings size={18} /> {i18n.t('common:nav.settings')}
                    </Link>
                </div>
                <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <LogOut size={18} /> {i18n.t('common:nav.logout')}
                    </button>
                </div>
            </div>
        </div>
    );
};
