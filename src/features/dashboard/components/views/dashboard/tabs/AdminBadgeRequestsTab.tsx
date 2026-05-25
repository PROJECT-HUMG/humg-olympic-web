import { Award, FileSpreadsheet } from 'lucide-react';
import { BentoCard } from '@/features/dashboard/components/DashboardLayout';
import { AdminBadgeReviewTab } from '@/features/dashboard/components/admin/AdminBadgeReviewTab';
import i18n from '@/i18n';

interface AdminBadgeRequestsTabProps {
    onOpenModal: (modal: string) => void;
}

export const AdminBadgeRequestsTab = ({ onOpenModal }: AdminBadgeRequestsTabProps) => (
    <div className="space-y-6">
        <BentoCard className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{i18n.t('dashboard:tabs.manageBadges')}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{i18n.t('dashboard:admin.badgeReview.emptyDesc')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onOpenModal('badge-excel-upload')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        <FileSpreadsheet size={16} />
                        Upload Excel
                    </button>
                    <button
                        onClick={() => onOpenModal('badge-grant')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        <Award size={16} />
                        {i18n.t('dashboard:admin.grantBadge.grantBtn')}
                    </button>
                </div>
            </div>
            <AdminBadgeReviewTab />
        </BentoCard>
    </div>
);
