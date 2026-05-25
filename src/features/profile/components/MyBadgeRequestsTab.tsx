import { useState } from 'react';
import {
    Clock, CheckCircle2, XCircle,
    RefreshCw, AlertCircle, ExternalLink
} from 'lucide-react';
import { UserBadgeResponse, UserBadgeStatus } from '@/features/badges/types/userBadge.types';
import { useMyBadgeRequests } from '@/features/badges/hooks/useBadgeRequests';
import i18n from '@/i18n';

// Status badge component
const StatusBadge = ({ status }: { status: UserBadgeStatus }) => {
    const config = {
        PENDING: {
            icon: Clock,
            label: i18n.t('profile:badgeRequests.pending'),
            className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        },
        APPROVED: {
            icon: CheckCircle2,
            label: i18n.t('profile:badgeRequests.approved'),
            className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        },
        REJECTED: {
            icon: XCircle,
            label: i18n.t('profile:badgeRequests.rejected'),
            className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        },
    };

    const { icon: Icon, label, className } = config[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${className}`}>
            <Icon size={12} />
            {label}
        </span>
    );
};

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
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="fixed inset-0 bg-black/70" />
            <img
                src={imageUrl}
                alt="Proof"
                className="relative max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

// Single request card
const RequestCard = ({
    request, onImageClick,
}: {
    request: UserBadgeResponse;
    onImageClick: (url: string) => void;
}) => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
            <div className="flex gap-4">
                {/* Proof Image Thumbnail */}
                {request.proofImageUrl && (
                    <button
                        onClick={() => onImageClick(request.proofImageUrl!)}
                        className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500 transition-colors group relative"
                    >
                        <img
                            src={request.proofImageUrl}
                            alt={i18n.t('profile:badgeRequests.evidenceAlt')}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink size={16} className="text-white" />
                        </div>
                    </button>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                {request.badgeName}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {request.badgeType === 'NATIONAL' ? i18n.t('profile:badgeRequests.typeNational') : i18n.t('profile:badgeRequests.typeSchool')} • Level {request.badgeLevel}
                            </p>
                        </div>
                        <StatusBadge status={request.status} />
                    </div>

                    {/* Date Info */}
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                        <p>{i18n.t('profile:badgeRequests.requestedAt', { date: formatDate(request.requestedAt) })}</p>
                        {request.reviewedAt && (
                            <p>{i18n.t('profile:badgeRequests.reviewedAt', { date: formatDate(request.reviewedAt) })}</p>
                        )}
                    </div>

                    {/* Reject Reason */}
                    {request.status === 'REJECTED' && request.rejectReason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                            <p className="text-xs text-red-700 dark:text-red-400">
                                <span className="font-semibold">{i18n.t('profile:badgeRequests.rejectReason')}</span> {request.rejectReason}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Loading skeleton
const RequestSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 animate-pulse">
        <div className="flex gap-4">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mb-3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
            </div>
        </div>
    </div>
);

export const MyBadgeRequestsTab = () => {
    const { myRequests, isLoading, fetchMyRequests } = useMyBadgeRequests();
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Clock size={20} className="text-blue-500" />
                    {i18n.t('profile:badgeRequests.myRequests')}
                    {myRequests.length > 0 && (
                        <span className="text-sm font-normal text-slate-400">
                            ({myRequests.length})
                        </span>
                    )}
                </h3>
                <button
                    onClick={() => fetchMyRequests()}
                    disabled={isLoading}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                    title={i18n.t('profile:badgeRequests.refresh')}
                >
                    <RefreshCw size={18} className={`text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Content */}
            {isLoading && myRequests.length === 0 ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <RequestSkeleton key={i} />)}
                </div>
            ) : myRequests.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <AlertCircle size={32} className="text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{i18n.t('profile:badgeRequests.noRequests')}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {i18n.t('profile:badgeRequests.sendFromBadgeTab')}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {myRequests.map(request => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onImageClick={setPreviewImage}
                        />
                    ))}
                </div>
            )}

            {/* Image Preview Modal */}
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
