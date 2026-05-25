import { useState } from 'react';
import {
    CheckCircle2, XCircle, Eye, Clock, Loader2, RefreshCw,
    User, Award, ChevronLeft, ChevronRight, Search
} from 'lucide-react';

import { usePendingBadgeRequests, useBadgeMutations } from '@/features/badges/hooks/useBadgeRequests';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import i18n from '@/i18n';

const getSubjectMap = (): Record<string, string> => ({
    MATH: i18n.t('dashboard:admin.badge.subjectMath'), ALGEBRA: i18n.t('dashboard:admin.badge.subjectAlgebra'), CALCULUS: i18n.t('dashboard:admin.badge.subjectCalculus'),
    PHYSICS: i18n.t('dashboard:admin.badge.subjectPhysics'), CHEMISTRY: i18n.t('dashboard:admin.badge.subjectChemistry'), ENGLISH: i18n.t('dashboard:admin.badge.subjectEnglish'),
});

// Image preview modal
const ImagePreviewModal = ({
    imageUrl, isOpen, onClose,
}: {
    imageUrl: string;
    isOpen: boolean;
    onClose: () => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4" onClick={onClose}>
            <div className="fixed inset-0 bg-black/70" />
            <img
                src={imageUrl}
                alt="Proof"
                className="relative max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

// Reject reason modal
const RejectReasonModal = ({
    isOpen, onClose, onSubmit, isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    isLoading: boolean;
}) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={!isLoading ? onClose : undefined}
            />
            <div
                className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200"
            >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    {i18n.t('dashboard:admin.badgeReview.rejectTitle')}
                </h3>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={i18n.t('dashboard:admin.badgeReview.rejectPlaceholder')}
                    className="w-full h-32 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                />
                <div className="flex gap-3 mt-4 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                    >
                        {i18n.t('common:cancel')}
                    </button>
                    <button
                        onClick={() => onSubmit(reason)}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                {i18n.t('dashboard:admin.processing')}
                            </>
                        ) : (
                            <>
                                <XCircle size={14} />
                                {i18n.t('dashboard:admin.badgeReview.reject')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Skeleton loading
const RequestRowSkeleton = () => (
    <div className="flex items-center gap-4 p-4 animate-pulse">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="flex-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
        </div>
        <div className="flex gap-2">
            <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
    </div>
);

export const AdminBadgeReviewTab = () => {
    const [page, setPage] = useState(1);
    const limit = 10;

    const {
        pendingRequests,
        isLoading,
        fetchPendingRequests,
    } = usePendingBadgeRequests({ page, limit });

    const { reviewRequest: reviewMutation, isSubmitting } = useBadgeMutations();

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [approveConfirm, setApproveConfirm] = useState<number | null>(null);
    const [rejectModal, setRejectModal] = useState<number | null>(null);

    const handleApprove = async (id: number) => {
        await reviewMutation.mutateAsync({ id, approved: true });
        setApproveConfirm(null);
    };

    const handleReject = async (id: number, reason: string) => {
        await reviewMutation.mutateAsync({ id, approved: false, rejectReason: reason || undefined });
        setRejectModal(null);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const totalPages = pendingRequests ? Math.ceil(pendingRequests.total / limit) : 1;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Clock className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {i18n.t('dashboard:admin.badgeReview.title')}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {i18n.t('dashboard:admin.badgeReview.pendingCount', { count: pendingRequests?.total || 0 })}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => fetchPendingRequests()}
                    disabled={isLoading}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                    title={i18n.t('dashboard:admin.refresh')}
                >
                    <RefreshCw size={18} className={`text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                {isLoading && !pendingRequests ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {[1, 2, 3, 4, 5].map(i => <RequestRowSkeleton key={i} />)}
                    </div>
                ) : !pendingRequests?.data.length ? (
                    <div className="text-center py-16">
                        <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                        <p className="font-semibold text-slate-900 dark:text-white">{i18n.t('dashboard:admin.badgeReview.emptyTitle')}</p>
                        <p className="text-sm text-slate-500 mt-1">{i18n.t('dashboard:admin.badgeReview.emptyDesc')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {pendingRequests.data.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                            >
                                {/* Proof Image */}
                                {request.proofImageUrl && (
                                    <button
                                        onClick={() => setPreviewImage(request.proofImageUrl!)}
                                        className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500 transition-colors relative"
                                    >
                                        <img
                                            src={request.proofImageUrl}
                                            alt="Proof"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Eye size={16} className="text-white" />
                                        </div>
                                    </button>
                                )}

                                {/* User & Badge Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <User size={14} className="text-slate-400 flex-shrink-0" />
                                        <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                            {request.userName}
                                        </span>
                                        {request.studentId && (
                                            <span className="text-xs text-slate-400 flex-shrink-0">
                                                {i18n.t('dashboard:admin.badgeReview.studentId', { id: request.studentId })}
                                            </span>
                                        )}
                                    </div>
                                    {request.userEmail && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1.5 truncate pl-[22px]">
                                            {request.userEmail}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Award size={14} className="text-amber-500 flex-shrink-0" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                                            {request.badgeName}
                                        </span>
                                        <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex-shrink-0">
                                            {getSubjectMap()[request.badgeSubject] || request.badgeSubject}
                                        </span>
                                        <span className="text-xs text-slate-400 flex-shrink-0">
                                            • {request.badgeType === 'NATIONAL' ? i18n.t('dashboard:admin.badgeReview.national') : i18n.t('dashboard:admin.badgeReview.school')} Lv.{request.badgeLevel}
                                        </span>
                                    </div>
                                    {request.badgeDescription && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1 pl-[22px]">
                                            {request.badgeDescription}
                                        </p>
                                    )}
                                    <p className="text-[11px] text-slate-400 mt-1 pl-[22px]">
                                        {formatDate(request.requestedAt)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setApproveConfirm(request.id)}
                                        disabled={isSubmitting}
                                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <CheckCircle2 size={14} />
                                        {i18n.t('dashboard:admin.badgeReview.approve')}
                                    </button>
                                    <button
                                        onClick={() => setRejectModal(request.id)}
                                        disabled={isSubmitting}
                                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <XCircle size={14} />
                                        {i18n.t('dashboard:admin.badgeReview.reject')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            {i18n.t('dashboard:admin.page', { current: page, total: totalPages })}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isLoading}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Approve Modal */}
            <ConfirmModal
                isOpen={approveConfirm !== null}
                onClose={() => setApproveConfirm(null)}
                onConfirm={() => approveConfirm && handleApprove(approveConfirm)}
                isLoading={isSubmitting}
                title={i18n.t('dashboard:admin.badgeReview.confirmApproveTitle')}
                message={i18n.t('dashboard:admin.badgeReview.confirmApproveMsg')}
                confirmText={i18n.t('dashboard:admin.badgeReview.confirmApproveBtn')}
                variant="info"
            />

            {/* Reject Reason Modal */}
            <RejectReasonModal
                isOpen={rejectModal !== null}
                onClose={() => setRejectModal(null)}
                onSubmit={(reason) => rejectModal && handleReject(rejectModal, reason)}
                isLoading={isSubmitting}
            />

            {/* Image Preview */}
            {previewImage && (
                <ImagePreviewModal
                    imageUrl={previewImage}
                    isOpen={!!previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </div>
    );
};
