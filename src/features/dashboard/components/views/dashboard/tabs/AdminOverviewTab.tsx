import type { ElementType } from 'react';
import {
    AlertTriangle, BookOpen, CheckCircle2, Clock, XCircle,
    ShieldCheck, Users, Award, Flag, Trash2, Ban,
} from 'lucide-react';
import { BentoCard, SectionHeader } from '@/features/dashboard/components/DashboardLayout';
import { GlowCard, DashboardStatCard, DashboardQuickAction } from '@/features/dashboard/components/DashboardComponents';
import type { AdminReport, ReportStatus } from '@/features/admin/types/admin.types';
import i18n from '@/i18n';

interface ApprovalItem {
    id: number;
    title: string;
    createdAt: string;
    priority?: string;
    _isBadge: boolean;
}

interface AlertItem {
    id: number | string;
    title: string;
    description: string;
    severity: string;
}

interface DataCategory {
    id: string;
    label: string;
    icon: ElementType;
}

interface QuickAction {
    icon: ElementType;
    label: string;
    onClick: () => void;
    color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'cyan';
}

interface QuickLink {
    icon: ElementType;
    label: string;
    path: string;
}

interface AdminOverviewTabProps {
    allApprovals: ApprovalItem[];
    alerts: AlertItem[];
    reports: AdminReport[];
    quickActions: QuickAction[];
    quickLinks: QuickLink[];
    categoryTotals: Record<string, number>;
    dataCategories: DataCategory[];
    isSubmitting: boolean;
    isBadgeSubmitting: boolean;
    onReviewBadgeRequest: (id: number, approved: boolean) => Promise<unknown>;
    onUpdateApprovalStatus: (id: number, status: 'APPROVED' | 'REJECTED') => Promise<unknown>;
    onResolveReport: (reportId: number, status: ReportStatus, action: 'DELETE_POST' | 'WARN_USER' | 'NONE') => Promise<unknown>;
    onRefreshData: () => void;
    onTabChange: (tab: string) => void;
    onCategoryChange: (id: string) => void;
    onNavigate: (path: string) => void;
}

export const AdminOverviewTab = ({
    allApprovals, alerts, reports, quickActions, quickLinks,
    categoryTotals, dataCategories,
    isSubmitting, isBadgeSubmitting,
    onReviewBadgeRequest, onUpdateApprovalStatus, onResolveReport,
    onRefreshData, onTabChange, onCategoryChange, onNavigate,
}: AdminOverviewTabProps) => {
    const reasonLabels: Record<string, string> = { SPAM: i18n.t('dashboard:tabs.reasonSpam'), OFFENSIVE: i18n.t('dashboard:tabs.reasonOffensive'), MISINFORMATION: i18n.t('dashboard:tabs.reasonMisinfo'), OTHER: i18n.t('dashboard:tabs.reasonOther') };

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardStatCard label={i18n.t('dashboard:tabs.pendingApprovals')} value={allApprovals.length} icon={ShieldCheck} color={allApprovals.length > 0 ? 'amber' : 'green'} />
                <DashboardStatCard label={i18n.t('dashboard:tabs.forumReports')} value={reports.length} icon={Flag} color={reports.length > 0 ? 'red' : 'green'} />
                <DashboardStatCard label={i18n.t('dashboard:views.dataUser')} value={categoryTotals.user} icon={Users} color="blue" />
                <DashboardStatCard label={i18n.t('dashboard:views.dataSubject')} value={categoryTotals.subject} icon={BookOpen} color="purple" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Quick Actions + Links */}
                <div className="lg:col-span-3 space-y-6">
                    <GlowCard glowColor="blue" intensity="soft" className="p-5">
                        <SectionHeader title={i18n.t('dashboard:views.quickActions')} />
                        <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action) => (
                                <DashboardQuickAction key={action.label} icon={action.icon} label={action.label} onClick={action.onClick} color={action.color} />
                            ))}
                        </div>
                    </GlowCard>
                    <BentoCard className="p-5">
                        <SectionHeader title={i18n.t('dashboard:views.quickAccess')} />
                        <div className="space-y-2">
                            {quickLinks.map((link) => (
                                <button
                                    key={link.label}
                                    onClick={() => onNavigate(link.path)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors text-left group"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                        <link.icon size={16} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-white text-sm">{link.label}</span>
                                </button>
                            ))}
                        </div>
                    </BentoCard>
                </div>

                {/* Approvals */}
                <BentoCard className="lg:col-span-5 overflow-hidden">
                    <div className="p-5 pb-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${allApprovals.length > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                                {allApprovals.length > 0
                                    ? <Clock size={18} className="text-amber-600 dark:text-amber-400" />
                                    : <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                                }
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{i18n.t('dashboard:tabs.pendingApprovals')}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {allApprovals.length > 0 ? i18n.t('dashboard:tabs.pendingCount', { count: allApprovals.length }) : i18n.t('dashboard:tabs.allProcessed')}
                                </p>
                            </div>
                        </div>
                        {allApprovals.length > 0 && (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                            </span>
                        )}
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                        {allApprovals.length === 0 ? (
                            <div className="text-center py-12 px-5">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-emerald-500" />
                                </div>
                                <p className="font-semibold text-slate-900 dark:text-white">{i18n.t('dashboard:admin.badgeReview.emptyTitle')}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{i18n.t('dashboard:tabs.allProcessed')}</p>
                            </div>
                        ) : (
                            allApprovals.slice(0, 5).map((item) => (
                                <div
                                    key={`${item._isBadge ? 'badge' : 'approval'}-${item.id}`}
                                    className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors group"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item._isBadge
                                        ? 'bg-amber-50 dark:bg-amber-900/20'
                                        : item.priority === 'high'
                                            ? 'bg-red-50 dark:bg-red-900/20'
                                            : 'bg-blue-50 dark:bg-blue-900/20'
                                        }`}>
                                        {item._isBadge ? (
                                            <Award size={18} className="text-amber-600 dark:text-amber-400" />
                                        ) : (
                                            <ShieldCheck size={18} className={
                                                item.priority === 'high'
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-blue-600 dark:text-blue-400'
                                            } />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate leading-snug">
                                            {item.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md ${item._isBadge
                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                : item.priority === 'high'
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                }`}>
                                                {item._isBadge ? i18n.t('dashboard:tabs.approvalBadge') : item.priority === 'high' ? i18n.t('dashboard:tabs.approvalImportant') : i18n.t('dashboard:tabs.approvalGeneral')}
                                            </span>
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                {item.createdAt}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-colors duration-200">
                                        <button
                                            disabled={isSubmitting || isBadgeSubmitting}
                                            onClick={async () => {
                                                if (item._isBadge) {
                                                    await onReviewBadgeRequest(item.id, true);
                                                } else {
                                                    await onUpdateApprovalStatus(item.id, 'APPROVED');
                                                }
                                                onRefreshData();
                                            }}
                                            className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-colors duration-200 disabled:opacity-50"
                                            title={i18n.t('dashboard:tabs.approveBtn')}
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                        <button
                                            disabled={isSubmitting || isBadgeSubmitting}
                                            onClick={async () => {
                                                if (item._isBadge) {
                                                    await onReviewBadgeRequest(item.id, false);
                                                } else {
                                                    await onUpdateApprovalStatus(item.id, 'REJECTED');
                                                }
                                                onRefreshData();
                                            }}
                                            className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-700 text-slate-500 dark:text-slate-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-colors duration-200 disabled:opacity-50"
                                            title={i18n.t('dashboard:tabs.rejectBtn')}
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {allApprovals.length > 5 && (
                        <div className="px-5 py-3 border-t border-slate-100 dark:border-neutral-800">
                            <button
                                onClick={() => onTabChange('badge-requests')}
                                className="w-full text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-1"
                            >
                                {i18n.t('common:viewAll')} {allApprovals.length} →
                            </button>
                        </div>
                    )}
                </BentoCard>

                <BentoCard className="lg:col-span-4 overflow-hidden">
                    <div className="p-5 pb-4 border-b border-slate-100 dark:border-neutral-800">
                        <SectionHeader title={i18n.t('dashboard:tabs.forumReports')} subtitle={reports.length > 0 ? i18n.t('dashboard:tabs.reportsCount', { count: reports.length }) : i18n.t('dashboard:tabs.noReports')} />
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                        {reports.length === 0 ? (
                            <div className="text-center py-8 px-5">
                                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                                <p className="font-medium text-slate-900 dark:text-white">{i18n.t('dashboard:tabs.noReports')}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{i18n.t('dashboard:tabs.noActivityDesc')}</p>
                            </div>
                        ) : (
                            reports.slice(0, 5).map((report) => (
                                <div key={report.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors group">
                                    <img
                                        src={report.reporter.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reporter.fullName)}&background=random`}
                                        alt={report.reporter.fullName}
                                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{report.postTitle}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                {reasonLabels[report.reason] || report.reason}
                                            </span>
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                {report.reporter.fullName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ── Report actions ── */}
                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            disabled={isSubmitting}
                                            onClick={() => onResolveReport(report.id, 'RESOLVED', 'NONE')}
                                            className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-colors duration-200 disabled:opacity-50"
                                            title={i18n.t('dashboard:tabs.resolveBtn')}
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                        <button
                                            disabled={isSubmitting}
                                            onClick={() => onResolveReport(report.id, 'RESOLVED', 'DELETE_POST')}
                                            className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-colors duration-200 disabled:opacity-50"
                                            title={i18n.t('dashboard:tabs.deletePostBtn')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            disabled={isSubmitting}
                                            onClick={() => onResolveReport(report.id, 'DISMISSED', 'NONE')}
                                            className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-700 text-slate-500 dark:text-slate-400 hover:bg-slate-500 hover:text-white dark:hover:bg-slate-500 transition-colors duration-200 disabled:opacity-50"
                                            title={i18n.t('dashboard:tabs.ignoreBtn')}
                                        >
                                            <Ban size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </BentoCard>

                {/* System Overview */}
                <BentoCard className="lg:col-span-12 p-5">
                    <SectionHeader title={i18n.t('dashboard:tabs.systemOverview')} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                        {dataCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { onCategoryChange(cat.id); onTabChange('data'); }}
                                className="text-center p-4 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors group"
                            >
                                <cat.icon size={20} className="mx-auto text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2" />
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{categoryTotals[cat.id]}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{cat.label}</p>
                            </button>
                        ))}
                    </div>
                </BentoCard>
            </div>
        </div>
    );
};
