import React, { useEffect, useState } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import { BadgeItem } from '@/features/auth/types/auth.types';
import { AdminUserResponse } from '@/features/admin/types/admin.types';
import { useBadgeRequests } from '@/features/badges/hooks/useBadgeRequests';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { BadgeFlat } from '@/features/badges/components/BadgeFlat';
import { ModalShell } from './ModalShell';
import i18n from '@/i18n';

interface AdminUserBadgesModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: AdminUserResponse | null;
    onSuccess?: () => void;
}

export const AdminUserBadgesModal = ({
    isOpen,
    onClose,
    user,
    onSuccess,
}: AdminUserBadgesModalProps) => {
    const { getUserBadges, revokeBadge, isSubmitting } = useBadgeRequests();
    const [badges, setBadges] = useState<BadgeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const fetchBadges = async () => {
        if (!user) return;
        setLoading(true);
        const result = await getUserBadges(user.id);
        if (result) {
            setBadges(result);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen && user) {
            fetchBadges();
        } else {
            setBadges([]);
        }
    }, [isOpen, user]);

    const handleRevokeClick = (badge: BadgeItem) => {
        setSelectedBadge(badge);
        setConfirmOpen(true);
    };

    const handleConfirmRevoke = async () => {
        if (!user || !selectedBadge) return;

        const success = await revokeBadge(user.id, selectedBadge.id);
        if (success) {
            setConfirmOpen(false);
            setBadges(prev => prev.filter(b => b.id !== selectedBadge.id));
            if (onSuccess) onSuccess();
        }
    };

    if (!isOpen || !user) return null;

    return (
        <ModalShell
            isOpen={isOpen}
            title={i18n.t('dashboard:admin.userBadges.title', { name: user.fullName })}
            onClose={onClose}
        >
            <div className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : badges.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>{i18n.t('dashboard:admin.userBadges.empty')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {badges.map(badge => (
                            <div
                                key={badge.id}
                                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-sm transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="scale-75 origin-left">
                                        <BadgeFlat badge={{ ...badge, isEarned: true, isSelected: false }} onClick={() => { }} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                            {badge.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {badge.type} • Level {badge.level} • {badge.subject}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRevokeClick(badge)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title={i18n.t('dashboard:admin.userBadges.revokeTooltip')}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmRevoke}
                title={i18n.t('dashboard:admin.userBadges.revokeTitle')}
                message={i18n.t('dashboard:admin.userBadges.revokeMsg', { badge: selectedBadge?.name })}
                confirmText={i18n.t('dashboard:admin.userBadges.revokeBtn')}
                variant="danger"
                isLoading={isSubmitting}
            />
        </ModalShell>
    );
};
