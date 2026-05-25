import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, ClipboardList, ClockAlert, CheckCircle2, Users,
    Loader2, FileText, GraduationCap, Filter, Clock, Download, Image,
    MessageSquare, XCircle, Send,
} from 'lucide-react';
import { examAttemptRepository } from '@/features/exams/api';
import { showToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/apiClient';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useUserPreview } from '@/hooks/useUserPreview';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import { VerifiedBadge, StudentBadges } from '@/features/badges/components/VerifiedBadge';
import { getUserNameColor } from '@/utils/rankingHelpers';
import type { Author } from '@/features/forum/types/forum.types';
import i18n from '@/i18n';
import type { PendingSubmission, AttemptStatus, GradeAppealResponse, GradeAppealStatus } from '@/features/exams/types/attempt.types';
import { SubmissionsDashboardSkeleton } from '@/features/exams/components/ExamSkeletons';
import type { PagedResponse } from '@/features/exams/types/exam.types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_TABS: { label: string; value: AttemptStatus | 'ALL'; icon: typeof ClockAlert }[] = [
    { label: i18n.t('exams:submissions.filterAll'), value: 'ALL', icon: Filter },
    { label: i18n.t('exams:submissions.filterInProgress'), value: 'IN_PROGRESS', icon: Loader2 },
    { label: i18n.t('exams:submissions.filterPending'), value: 'PENDING_GRADING', icon: ClockAlert },
    { label: i18n.t('exams:submissions.filterGraded'), value: 'GRADED', icon: CheckCircle2 },
];

const PAGE_SIZE = 10;

type DashboardView = 'submissions' | 'appeals';

export const SubmissionsDashboardPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const examId = id ? Number(id) : null;

    const [activeView, setActiveView] = useState<DashboardView>('submissions');

    const [data, setData] = useState<PagedResponse<PendingSubmission> | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<AttemptStatus | 'ALL'>('PENDING_GRADING');
    const [page, setPage] = useState(1);

    const {
        isVisible: showPreview,
        position: previewPosition,
        previewItem: previewStudent,
        handleHoverStart,
        handleHoverEnd,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave,
    } = useUserPreview<Author>();

    useEffect(() => {
        if (!examId) return;
        let cancelled = false;
        setLoading(true);
        const status = statusFilter === 'ALL' ? undefined : statusFilter;
        examAttemptRepository.getSubmissions(examId, status, page, PAGE_SIZE)
            .then(res => { if (!cancelled) setData(res); })
            .catch((err: unknown) => {
                const msg = err instanceof ApiError ? err.message : i18n.t('exams:submissions.loadFailed');
                showToast(msg, 'error');
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [examId, statusFilter, page]);

    const handleTabChange = (value: AttemptStatus | 'ALL') => {
        setStatusFilter(value);
        setPage(1);
    };

    const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

    const toAuthor = (student: PendingSubmission['student']): Author => ({
        id: student.id,
        name: student.name,
        avatar: student.avatar,
        role: student.role as Author['role'],
        badges: student.badges,
        xpPoints: student.xpPoints,
        isDeleted: student.isDeleted,
    });

    return (
        <div className="min-h-screen font-sans">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl pt-24 pb-24">
                <button onClick={() => navigate(-1)} className="mb-6 group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors w-fit">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> {i18n.t('exams:submissions.goBack')}
                </button>

                {/* ── Header ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <ClipboardList size={20} className="text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white">{i18n.t('exams:submissions.title')}</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {data ? i18n.t('exams:submissions.count', { count: data.total }) : i18n.t('exams:submissions.loading')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* View Tabs: Bài nộp / Phúc khảo */}
                    <div className="px-6 py-3 flex gap-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                        <button
                            onClick={() => setActiveView('submissions')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeView === 'submissions'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <ClipboardList size={14} /> {i18n.t('exams:submissions.submissionsTab')}
                        </button>
                        <button
                            onClick={() => setActiveView('appeals')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeView === 'appeals'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <MessageSquare size={14} /> {i18n.t('exams:submissions.appealsTab')}
                        </button>
                    </div>

                    {/* Status Tabs (only for submissions) */}
                    {activeView === 'submissions' && (
                        <div className="px-6 py-3 flex gap-1.5 bg-slate-50 dark:bg-slate-800/30">
                            {STATUS_TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = statusFilter === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        onClick={() => handleTabChange(tab.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${isActive
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <Icon size={14} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {activeView === 'appeals' ? (
                    <AppealsView examId={examId!} />
                ) : (
                    <>

                        {/* ── Submissions List ── */}
                        {loading ? (
                            <div className="animate-pulse space-y-2 mt-2">
                                {/* Table header */}
                                <div className="hidden sm:grid grid-cols-12 gap-3 px-6 py-2">
                                    <div className="col-span-5 h-3 w-16 bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
                                    <div className="col-span-2 h-3 w-20 bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
                                    <div className="col-span-2 h-3 w-16 bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
                                    <div className="col-span-1 h-3 w-10 mx-auto bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
                                    <div className="col-span-2 h-3 w-16 ml-auto bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
                                </div>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-6 py-4 sm:grid sm:grid-cols-12 sm:items-center gap-3">
                                        <div className="sm:col-span-5 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                                            <div className="space-y-1.5 flex-1">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-lg" style={{ width: `${50 + (i % 3) * 15}%` }} />
                                                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700/60 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700/60 rounded-lg" /></div>
                                        <div className="sm:col-span-2"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/60 rounded-lg" /></div>
                                        <div className="sm:col-span-1 flex justify-center"><div className="h-5 w-10 bg-slate-200 dark:bg-slate-700/60 rounded-lg" /></div>
                                        <div className="sm:col-span-2 flex justify-end gap-2">
                                            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
                                            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !data || data.data.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <Users size={28} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-1">{i18n.t('exams:submissions.emptyTitle')}</p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500">{i18n.t('exams:submissions.emptyDesc')}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Table header */}
                                <div className="hidden sm:grid grid-cols-12 gap-3 px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                    <div className="col-span-5">{i18n.t('exams:submissions.colStudent')}</div>
                                    <div className="col-span-2">{i18n.t('exams:submissions.colStatus')}</div>
                                    <div className="col-span-2">{i18n.t('exams:submissions.colTime')}</div>
                                    <div className="col-span-1 text-center">{i18n.t('exams:submissions.colScore')}</div>
                                    <div className="col-span-2 text-right">{i18n.t('exams:submissions.colAction')}</div>
                                </div>

                                <div className="space-y-2">
                                    {data.data.map(sub => {
                                        const author = toAuthor(sub.student);
                                        return (
                                            <div
                                                key={sub.attemptId}
                                                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                                            >
                                                {/* Student info */}
                                                <div className="sm:col-span-5 flex items-center gap-3 min-w-0">
                                                    <Link
                                                        to={`/profile/${author.id}`}
                                                        onMouseEnter={(e) => handleHoverStart(author, e)}
                                                        onMouseLeave={handleHoverEnd}
                                                        className="shrink-0"
                                                    >
                                                        <img
                                                            src={author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random`}
                                                            alt={author.name}
                                                            className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-700 object-cover hover:opacity-90 transition-opacity"
                                                        />
                                                    </Link>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <Link
                                                                to={`/profile/${author.id}`}
                                                                onMouseEnter={(e) => handleHoverStart(author, e)}
                                                                onMouseLeave={handleHoverEnd}
                                                                className={`text-sm font-semibold hover:underline truncate ${getUserNameColor(author.xpPoints ?? 0)}`}
                                                            >
                                                                {author.name}
                                                            </Link>
                                                            <VerifiedBadge role={author.role} size={14} />
                                                            <StudentBadges badges={author.badges} maxDisplay={1} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className="sm:col-span-2">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${sub.status === 'IN_PROGRESS'
                                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/15 dark:text-blue-400'
                                                        : sub.status === 'PENDING_GRADING'
                                                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/15 dark:text-amber-400'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                        }`}>
                                                        {sub.status === 'IN_PROGRESS' ? <Loader2 size={12} className="animate-spin" /> : sub.status === 'PENDING_GRADING' ? <ClockAlert size={12} /> : <CheckCircle2 size={12} />}
                                                        {sub.status === 'IN_PROGRESS' ? i18n.t('exams:submissions.statusInProgress') : sub.status === 'PENDING_GRADING' ? i18n.t('exams:submissions.statusPending') : i18n.t('exams:submissions.statusGraded')}
                                                    </span>
                                                </div>

                                                {/* Time */}
                                                <div className="sm:col-span-2 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                                    <Clock size={14} className="shrink-0 hidden sm:block" />
                                                    {sub.submittedAt
                                                        ? format(new Date(sub.submittedAt), 'HH:mm dd/MM', { locale: vi })
                                                        : <span className="text-slate-400 italic">{i18n.t('exams:submissions.notSubmitted')}</span>
                                                    }
                                                    {sub.hasEvidence && (
                                                        <span className="flex items-center gap-0.5 text-slate-500 ml-1">
                                                            <FileText size={12} /> {sub.evidenceCount}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Score */}
                                                <div className="sm:col-span-1 text-center">
                                                    {sub.score != null ? (
                                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{sub.score}</span>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">—</span>
                                                    )}
                                                </div>

                                                {/* Action */}
                                                <div className="sm:col-span-2 flex justify-end">
                                                    {sub.status === 'IN_PROGRESS' ? (
                                                        <span className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-1.5 cursor-default">
                                                            <Loader2 size={14} className="animate-spin" />
                                                            {i18n.t('exams:submissions.inExam')}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => navigate(`/exams/attempts/${sub.attemptId}/grade`)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${sub.status === 'PENDING_GRADING'
                                                                ? 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                                }`}
                                                        >
                                                            <GraduationCap size={14} />
                                                            {sub.status === 'PENDING_GRADING' ? i18n.t('exams:submissions.grade') : i18n.t('exams:submissions.detail')}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Evidence preview row */}
                                                {sub.evidences && sub.evidences.length > 0 && (
                                                    <div className="sm:col-span-12 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                        <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1"><Image size={12} /> {i18n.t('exams:submissions.evidence', { count: sub.evidences.length })}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {sub.evidences.map(ev => {
                                                                const isImage = ev.contentType.startsWith('image/');
                                                                return isImage ? (
                                                                    <a key={ev.id} href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity">
                                                                        <img src={ev.fileUrl} alt={ev.fileName} className="w-full h-full object-cover" />
                                                                    </a>
                                                                ) : (
                                                                    <a key={ev.id} href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                                        <Download size={12} /> {ev.fileName}
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-6">
                                        <PaginationControls current={page} total={totalPages} onChange={setPage} />
                                    </div>
                                )}
                            </>
                        )}

                        {/* UserPreview */}
                        {previewStudent && (
                            <UserPreviewCard
                                author={previewStudent}
                                isVisible={showPreview}
                                position={previewPosition}
                                onMouseEnter={handlePreviewMouseEnter}
                                onMouseLeave={handlePreviewMouseLeave}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Appeals View ────────────────────────────────────────────
const APPEAL_FILTERS: { label: string; value: GradeAppealStatus | 'ALL' }[] = [
    { label: i18n.t('exams:appeals.filterAll'), value: 'ALL' },
    { label: i18n.t('exams:appeals.filterPending'), value: 'PENDING' },
    { label: i18n.t('exams:appeals.filterApproved'), value: 'APPROVED' },
    { label: i18n.t('exams:appeals.filterRejected'), value: 'REJECTED' },
];

const AppealsView = ({ examId }: { examId: number }) => {
    const navigate = useNavigate();
    const [appeals, setAppeals] = useState<GradeAppealResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<GradeAppealStatus | 'ALL'>('PENDING');
    const [page, setPage] = useState(1);
    const [reviewingId, setReviewingId] = useState<number | null>(null);
    const [reviewComment, setReviewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchAppeals = async () => {
        setLoading(true);
        try {
            const status = filter === 'ALL' ? undefined : filter;
            const res = await examAttemptRepository.getExamAppeals(examId, status, page, PAGE_SIZE);
            setAppeals(res.data);
            setTotal(res.total);
        } catch (err: unknown) {
            const msg = err instanceof ApiError ? err.message : i18n.t('exams:appeals.loadFailed');
            showToast(msg, 'error');
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAppeals(); }, [examId, filter, page]);

    const handleReview = async (appealId: number, status: 'APPROVED' | 'REJECTED') => {
        setSubmitting(true);
        try {
            await examAttemptRepository.reviewAppeal(appealId, { status, comment: reviewComment || null });
            showToast(status === 'APPROVED' ? i18n.t('exams:appeals.approved') : i18n.t('exams:appeals.rejected'), 'success');
            setReviewingId(null);
            setReviewComment('');
            fetchAppeals();
        } catch (err: unknown) {
            const msg = err instanceof ApiError ? err.message : i18n.t('exams:appeals.processFailed');
            showToast(msg, 'error');
        }
        finally { setSubmitting(false); }
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const statusBadge = (status: GradeAppealStatus) => {
        const map: Record<GradeAppealStatus, { label: string; cls: string }> = {
            PENDING: { label: i18n.t('exams:appeals.statusPending'), cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/15 dark:text-amber-400' },
            APPROVED: { label: i18n.t('exams:appeals.statusApproved'), cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/15 dark:text-emerald-400' },
            REJECTED: { label: i18n.t('exams:appeals.statusRejected'), cls: 'bg-rose-50 text-rose-700 dark:bg-rose-900/15 dark:text-rose-400' },
        };
        const b = map[status];
        return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${b.cls}`}>{b.label}</span>;
    };

    return (
        <>
            {/* Filter */}
            <div className="flex gap-1.5 mb-4">
                {APPEAL_FILTERS.map(f => (
                    <button
                        key={f.value}
                        onClick={() => { setFilter(f.value); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === f.value
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                    <p className="text-sm text-slate-500">{i18n.t('exams:appeals.loading')}</p>
                </div>
            ) : appeals.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={28} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-1">{i18n.t('exams:appeals.emptyTitle')}</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">{i18n.t('exams:appeals.emptyDesc')}</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {appeals.map(appeal => (
                            <div key={appeal.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {statusBadge(appeal.status)}
                                            <span className="text-xs text-slate-400">
                                                {format(new Date(appeal.created), 'HH:mm dd/MM/yyyy', { locale: vi })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{appeal.reason}</p>
                                        {appeal.reviewerComment && (
                                            <p className="text-xs text-slate-500 mt-1 italic">→ {appeal.reviewerComment}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => navigate(`/exams/attempts/${appeal.attemptId}/grade`)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            {i18n.t('exams:appeals.viewWork')}
                                        </button>
                                        {appeal.status === 'PENDING' && (
                                            <button
                                                onClick={() => setReviewingId(reviewingId === appeal.id ? null : appeal.id)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                                            >
                                                {i18n.t('exams:appeals.process')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Review form */}
                                {reviewingId === appeal.id && appeal.status === 'PENDING' && (
                                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                                        <textarea
                                            value={reviewComment}
                                            onChange={e => setReviewComment(e.target.value)}
                                            placeholder={i18n.t('exams:appeals.commentPlaceholder')}
                                            rows={2}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleReview(appeal.id, 'REJECTED')}
                                                disabled={submitting}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/15 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/25 transition-colors disabled:opacity-50"
                                            >
                                                <XCircle size={14} /> {i18n.t('exams:appeals.reject')}
                                            </button>
                                            <button
                                                onClick={() => handleReview(appeal.id, 'APPROVED')}
                                                disabled={submitting}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-50"
                                            >
                                                <CheckCircle2 size={14} /> {i18n.t('exams:appeals.approve')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6">
                            <PaginationControls current={page} total={totalPages} onChange={setPage} />
                        </div>
                    )}
                </>
            )}
        </>
    );
};
