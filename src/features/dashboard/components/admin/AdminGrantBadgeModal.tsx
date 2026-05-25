import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Search, User, Award, Loader2, CheckCircle2 } from 'lucide-react';

import { useBadgeRequests } from '@/features/badges/hooks/useBadgeRequests';
import { useDashboardActions } from '@/features/dashboard/hooks/useDashboardActions';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { BadgeItem } from '@/features/auth/types/auth.types';
import { BadgeFlat } from '@/features/badges/components/BadgeFlat';
import i18n from '@/i18n';

interface UserOption {
    id: number;
    fullName: string;
    email: string;
    studentId: string;
    avatarUrl: string | null;
}

interface AdminGrantBadgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    // Data có thể được inject từ parent
    users?: UserOption[];
    badges?: BadgeItem[];
}

export const AdminGrantBadgeModal = ({
    isOpen,
    onClose,
    onSuccess,
    users: injectedUsers,
    badges: injectedBadges,
}: AdminGrantBadgeModalProps) => {
    const { grantBadgeToUser, isSubmitting } = useBadgeRequests();
    const { getUsers, getBadges, isSubmitting: isFetching } = useDashboardActions();

    // Local state
    const [users, setUsers] = useState<UserOption[]>([]);
    const [badges, setBadges] = useState<BadgeItem[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
    const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
    const [userSearch, setUserSearch] = useState('');
    const [badgeSearch, setBadgeSearch] = useState('');
    const [userPage, setUserPage] = useState(1);
    const [badgePage, setBadgePage] = useState(1);
    const [hasMoreUsers, setHasMoreUsers] = useState(true);
    const [hasMoreBadges, setHasMoreBadges] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingBadges, setLoadingBadges] = useState(false);

    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showBadgeDropdown, setShowBadgeDropdown] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [success, setSuccess] = useState(false);

    // Refs for click outside
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const badgeDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
            if (badgeDropdownRef.current && !badgeDropdownRef.current.contains(event.target as Node)) {
                setShowBadgeDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Constants
    const LIMIT = 10;

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setSelectedUser(null);
            setSelectedBadge(null);
            setUserSearch('');
            setBadgeSearch('');
            setSuccess(false);
        }
    }, [isOpen]);

    // Load users with pagination and search
    useEffect(() => {
        if (!isOpen || injectedUsers) return;
        // Only fetch if user has typed something OR loading more pages
        if (!userSearch.trim() && userPage === 1) return;

        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const res = await getUsers({
                    page: userPage,
                    limit: LIMIT,
                    search: userSearch
                });
                if (res?.data) {
                    const mappedUsers: UserOption[] = res.data.map((u) => ({
                        id: u.id,
                        fullName: u.fullName,
                        email: u.email,
                        studentId: (u as unknown as { studentId?: string }).studentId || '',
                        avatarUrl: u.avatarUrl ?? null,
                    }));

                    if (userPage === 1) {
                        setUsers(mappedUsers);
                    } else {
                        setUsers(prev => [...prev, ...mappedUsers]);
                    }
                    setHasMoreUsers(mappedUsers.length === LIMIT);
                }
            } finally {
                setLoadingUsers(false);
            }
        };

        const timer = setTimeout(() => {
            fetchUsers();
        }, 600); // Debounce - tăng lên để người dùng nhập xong mới search

        return () => clearTimeout(timer);
    }, [isOpen, userPage, userSearch, injectedUsers, getUsers]);

    // Load badges with pagination and search
    useEffect(() => {
        if (!isOpen || injectedBadges) return;
        // Only fetch if user has typed something OR loading more pages
        if (!badgeSearch.trim() && badgePage === 1) return;

        const fetchBadges = async () => {
            setLoadingBadges(true);
            try {
                const res = await getBadges({
                    page: badgePage,
                    limit: LIMIT,
                    search: badgeSearch
                });
                if (res?.data) {
                    if (badgePage === 1) {
                        setBadges(res.data);
                    } else {
                        setBadges(prev => [...prev, ...res.data]);
                    }
                    setHasMoreBadges(res.data.length === LIMIT);
                }
            } finally {
                setLoadingBadges(false);
            }
        };

        const timer = setTimeout(() => {
            fetchBadges();
        }, 600); // Debounce - tăng lên để người dùng nhập xong mới search

        return () => clearTimeout(timer);
    }, [isOpen, badgePage, badgeSearch, injectedBadges, getBadges]);

    // Reset pagination when search changes
    useEffect(() => {
        setUserPage(1);
        setHasMoreUsers(true);
    }, [userSearch]);

    useEffect(() => {
        setBadgePage(1);
        setHasMoreBadges(true);
    }, [badgeSearch]);

    // Initialize injected data if present
    useEffect(() => {
        if (isOpen && injectedUsers) setUsers(injectedUsers);
        if (isOpen && injectedBadges) setBadges(injectedBadges);
    }, [isOpen, injectedUsers, injectedBadges]);

    // Filtered lists (Client-side filtering only applies when data is injected)
    // When fetching from API, the filtering happens on server side via search param
    const displayUsers = users;
    const displayBadges = badges;

    const handleGrant = async () => {
        if (!selectedUser || !selectedBadge) return;

        const result = await grantBadgeToUser(selectedUser.id, selectedBadge.id);
        if (result) {
            setSuccess(true);
            setConfirmOpen(false);
            if (onSuccess) onSuccess();
        } else {
            setConfirmOpen(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={!isSubmitting ? onClose : undefined}
            />

            <div
                className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Award className="text-purple-600 dark:text-purple-400" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {i18n.t('dashboard:admin.grantBadge.title')}
                        </h3>
                    </div>
                    {!isSubmitting && (
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 min-h-[400px]">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle2 size={32} className="text-emerald-600" />
                            </div>
                            <p className="font-semibold text-lg text-slate-900 dark:text-white">
                                {i18n.t('dashboard:admin.grantBadge.successTitle')}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {selectedBadge?.name} → {selectedUser?.fullName}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* User Selection */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {i18n.t('dashboard:admin.grantBadge.selectUser')} <span className="text-red-500">*</span>
                                </label>

                                {selectedUser ? (
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                            {selectedUser.avatarUrl ? (
                                                <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} className="text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 dark:text-white text-sm">{selectedUser.fullName}</p>
                                            <p className="text-xs text-slate-500">{selectedUser.email}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="p-1 hover:bg-red-100 rounded text-red-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative" ref={userDropdownRef}>
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            onFocus={() => setShowUserDropdown(true)}
                                            placeholder={i18n.t('dashboard:admin.grantBadge.searchUserPlaceholder')}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                        />
                                        {showUserDropdown && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-80 overflow-y-auto custom-scrollbar">
                                                {loadingUsers ? (
                                                    <div className="p-3 text-center text-sm text-slate-500">
                                                        <Loader2 size={16} className="animate-spin inline mr-2" />
                                                        {i18n.t('dashboard:admin.searching')}
                                                    </div>
                                                ) : displayUsers.length === 0 && userSearch.trim() === '' ? (
                                                    <div className="p-3 text-center text-sm text-slate-500">
                                                        {i18n.t('dashboard:admin.grantBadge.searchUserHint')}
                                                    </div>
                                                ) : displayUsers.length === 0 ? (
                                                    <div className="p-3 text-center text-sm text-slate-500">{i18n.t('dashboard:admin.noResults')}</div>
                                                ) : (
                                                    displayUsers.map(user => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowUserDropdown(false);
                                                                setUserSearch('');
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {user.avatarUrl ? (
                                                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <User size={16} className="text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{user.fullName}</p>
                                                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}

                                                {!loadingUsers && hasMoreUsers && displayUsers.length > 0 && !injectedUsers && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setUserPage(prev => prev + 1);
                                                        }}
                                                        className="w-full py-2 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 font-medium transition-colors border-t border-slate-100 dark:border-slate-700"
                                                    >
                                                        {loadingUsers ? (
                                                            <><Loader2 size={14} className="animate-spin inline mr-1" /> {i18n.t('dashboard:admin.loadingMore')}</>
                                                        ) : (
                                                            i18n.t('dashboard:admin.viewMore')
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Badge Selection */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {i18n.t('dashboard:admin.grantBadge.selectBadge')} <span className="text-red-500">*</span>
                                </label>

                                {selectedBadge ? (
                                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                        <BadgeFlat badge={{ ...selectedBadge, isEarned: true, isSelected: false }} onClick={() => { }} size="sm" />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 dark:text-white text-sm">{selectedBadge.name}</p>
                                            <p className="text-xs text-slate-500">{selectedBadge.type} • Level {selectedBadge.level}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedBadge(null)}
                                            className="p-1 hover:bg-red-100 rounded text-red-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative" ref={badgeDropdownRef}>
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={badgeSearch}
                                            onChange={(e) => setBadgeSearch(e.target.value)}
                                            onFocus={() => setShowBadgeDropdown(true)}
                                            placeholder={i18n.t('dashboard:admin.grantBadge.searchBadgePlaceholder')}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                        />
                                        {showBadgeDropdown && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-80 overflow-y-auto custom-scrollbar">
                                                {loadingBadges ? (
                                                    <div className="p-3 text-center text-sm text-slate-500">
                                                        <Loader2 size={16} className="animate-spin inline mr-2" />
                                                        {i18n.t('dashboard:admin.searching')}
                                                    </div>
                                                ) : displayBadges.length === 0 && badgeSearch.trim() === '' ? (
                                                    <div className="p-3 text-center text-sm text-slate-500">
                                                        {i18n.t('dashboard:admin.grantBadge.searchBadgeHint')}
                                                    </div>
                                                ) : displayBadges.length === 0 ? (
                                                    <div className="p-3 text-center text-sm text-slate-500">{i18n.t('dashboard:admin.noResults')}</div>
                                                ) : (
                                                    displayBadges.map(badge => (
                                                        <button
                                                            key={badge.id}
                                                            onClick={() => {
                                                                setSelectedBadge(badge);
                                                                setShowBadgeDropdown(false);
                                                                setBadgeSearch('');
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                                                        >
                                                            <BadgeFlat badge={{ ...badge, isEarned: true, isSelected: false }} onClick={() => { }} size="sm" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{badge.name}</p>
                                                                <p className="text-xs text-slate-400">{badge.type} • Level {badge.level}</p>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}

                                                {!loadingBadges && hasMoreBadges && displayBadges.length > 0 && !injectedBadges && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setBadgePage(prev => prev + 1);
                                                        }}
                                                        className="w-full py-2 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 font-medium transition-colors border-t border-slate-100 dark:border-slate-700"
                                                    >
                                                        {loadingBadges ? (
                                                            <><Loader2 size={14} className="animate-spin inline mr-1" /> {i18n.t('dashboard:admin.loadingMore')}</>
                                                        ) : (
                                                            i18n.t('dashboard:admin.viewMore')
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {success ? i18n.t('dashboard:admin.close') : i18n.t('dashboard:admin.cancel')}
                    </button>
                    {!success && (
                        <button
                            onClick={() => setConfirmOpen(true)}
                            disabled={isSubmitting || !selectedUser || !selectedBadge}
                            className="px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    {i18n.t('dashboard:admin.processing')}
                                </>
                            ) : (
                                <>
                                    <Award size={16} />
                                    {i18n.t('dashboard:admin.grantBadge.grantBtn')}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleGrant}
                isLoading={isSubmitting}
                title={i18n.t('dashboard:admin.grantBadge.confirmTitle')}
                message={i18n.t('dashboard:admin.grantBadge.confirmMsg', { badge: selectedBadge?.name, user: selectedUser?.fullName })}
                confirmText={i18n.t('dashboard:admin.grantBadge.confirmBtn')}
                variant="info"
            />
        </div>
    );
};
