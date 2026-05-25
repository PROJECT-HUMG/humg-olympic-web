import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Send, Archive, Clock,
    FileText, Target, BookOpen, CalendarClock, Loader2, RotateCcw, BarChart3, Users, Lock, Pencil, Camera, Copy, GraduationCap, ClipboardList
} from 'lucide-react';
import { examAttemptRepository } from '@/features/exams/api';
import { useAuth } from '@/contexts/AuthContext';
import { ExamQuestionList } from '@/features/exams/components/ExamQuestionList';
import { ExamPreviewSkeleton, LeaderboardSkeleton } from '@/features/exams/components/ExamSkeletons';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { RankingCardItem } from '@/features/ranking/components/RankingCardItem';
import { useUserPreview } from '@/hooks/useUserPreview';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import { ShareButton } from '@/components/ui/ShareButton';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useExamPreview } from '@/features/exams/hooks/useExamPreview';
import type { LeaderboardEntry as RankingEntry } from '@/features/ranking/types/ranking.types';
import { Author } from '@/features/forum/types/forum.types';
import { UserRole } from '@/features/auth/types/auth.types';
import type { ExamStatus } from '@/features/exams/types/exam.types';
import type { LeaderboardEntry, LeaderboardResponse } from '@/features/exams/types/attempt.types';

const statusConfig: Record<ExamStatus, { label: string; icon: typeof FileText }> = {
    DRAFT: { label: i18n.t('exams:preview.statusDraft'), icon: FileText },
    PUBLISHED: { label: i18n.t('exams:preview.statusPublished'), icon: Send },
    ARCHIVED: { label: i18n.t('exams:preview.statusArchived'), icon: Archive },
};

const toRankingEntry = (e: LeaderboardEntry): RankingEntry => ({
    rank: e.rank,
    userId: e.userId,
    fullName: e.userName,
    avatarUrl: e.userAvatar ?? null,
    xpPoints: e.totalXp ?? e.score,
    role: e.role,
    selectedBadges: e.selectedBadges ?? [],
});

const PAGE_SIZE = 10;

// ─── Leaderboard sidebar ─────────────────────────────────
const PreviewLeaderboard = ({ examId, currentUserId }: { examId: number; currentUserId?: number }) => {
    const [data, setData] = useState<LeaderboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const {
        isVisible: showPreview,
        position: previewPosition,
        previewItem: previewEntry,
        handleHoverStart,
        handleHoverEnd,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave,
    } = useUserPreview<RankingEntry>();

    const convertToAuthor = (entry: RankingEntry): Author => ({
        id: entry.userId,
        name: entry.fullName,
        avatar: entry.avatarUrl || '',
        role: (entry.role || 'STUDENT_INTERNAL') as UserRole,
        badges: (entry.selectedBadges ?? []).map(b => ({ ...b, isSelected: true, isEarned: true })),
        xpPoints: entry.xpPoints,
    });

    useEffect(() => {
        let cancelled = false;
        setPage(1);
        (async () => {
            try {
                const res = await examAttemptRepository.getLeaderboard(examId, undefined, 50);
                if (!cancelled) setData(res);
            } catch { /* non-critical */ }
            finally { if (!cancelled) setLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [examId]);

    if (loading) return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <LeaderboardSkeleton rows={6} />
        </div>
    );

    if (!data || data.rankings.length === 0) return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <Users size={24} className="text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{i18n.t('exams:preview.noData')}</h3>
                <p className="text-sm text-slate-400">{i18n.t('exams:preview.noDataDesc')}</p>
            </div>
        </div>
    );

    const allEntries = data.rankings.map(e => toRankingEntry(e));
    const scoreMap = new Map(data.rankings.map(e => [e.userId, e.score]));
    const totalPages = Math.ceil(allEntries.length / PAGE_SIZE);
    const pageEntries = allEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <BarChart3 size={16} className="text-slate-400" />
                    {i18n.t('exams:preview.leaderboard')}
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500">
                    <Users size={12} /> {data.rankings.length}
                </span>
            </div>

            <div className="p-4 space-y-2">
                {pageEntries.map((entry, idx) => (
                    <RankingCardItem
                        key={entry.userId}
                        entry={entry}
                        index={(page - 1) * PAGE_SIZE + idx}
                        isCurrentUser={currentUserId != null && entry.userId === currentUserId}
                        onHoverStart={handleHoverStart}
                        onHoverEnd={handleHoverEnd}
                        layout="row"
                        displayValue={scoreMap.get(entry.userId)}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <PaginationControls current={page} total={totalPages} onChange={setPage} />
                </div>
            )}

            {showPreview && previewEntry && (
                <UserPreviewCard
                    author={convertToAuthor(previewEntry)}
                    isVisible={showPreview}
                    position={previewPosition}
                    onMouseEnter={handlePreviewMouseEnter}
                    onMouseLeave={handlePreviewMouseLeave}
                />
            )}
        </div>
    );
};

// ─── Action Button ───────────────────────────────────────
const ActionBtn = ({
    onClick, disabled, icon: Icon, label, loadingLabel,
}: {
    onClick: () => void;
    disabled?: boolean;
    icon: typeof Send;
    label: string;
    loadingLabel?: string;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
    >
        {disabled && loadingLabel
            ? <><Loader2 size={14} className="animate-spin" /> {loadingLabel}</>
            : <><Icon size={14} /> {label}</>
        }
    </button>
);

// ─── Main Page ───────────────────────────────────────────
export const ExamPreviewPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const examId = id ? Number(id) : null;
    const { user } = useAuth();

    const { exam, loading, publishing, archiving, reopening, handlePublish, handleArchive, handleReopen } = useExamPreview(examId);
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (exam?.accessCode) {
            navigator.clipboard.writeText(exam.accessCode);
            setCopied(true);
            showToast(i18n.t('exams:accessCodeCopied'), 'success');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return <ExamPreviewSkeleton />;

    if (!exam) {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full mx-4">
                    <FileText size={40} className="mx-auto text-slate-400 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('exams:preview.notFound')}</h2>
                    <p className="text-sm text-slate-500 mb-5">{i18n.t('exams:preview.notFoundDesc')}</p>
                    <button onClick={() => navigate(-1)} className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors">
                        {i18n.t('exams:preview.goBackPrev')}
                    </button>
                </div>
            </div>
        );
    }

    const config = statusConfig[exam.status];
    const StatusIcon = config.icon;
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'LECTURER';

    return (
        <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl pt-24 pb-20">

                {/* ─── Top bar ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors w-fit">
                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> {i18n.t('exams:preview.goBack')}
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                        {exam.status === 'DRAFT' && <ActionBtn onClick={handlePublish} disabled={publishing} icon={Send} label={i18n.t('exams:preview.publish')} loadingLabel={i18n.t('exams:preview.publishing')} />}
                        {exam.status === 'PUBLISHED' && (
                            <>
                                <ShareButton
                                    url={`${window.location.origin}/exams/${exam.slug}`}
                                    title={exam.title}
                                    variant="full"
                                    className="!bg-white !border-slate-200 hover:!bg-slate-50 dark:!bg-slate-800 dark:!border-slate-700 dark:hover:!bg-slate-700 !text-slate-700 dark:!text-slate-300 !font-semibold !text-sm !rounded-xl !py-2.5 !px-4"
                                />
                                <ActionBtn onClick={handleArchive} disabled={archiving} icon={Archive} label={i18n.t('exams:preview.archive')} loadingLabel={i18n.t('exams:preview.archiving')} />
                            </>
                        )}
                        {exam.status === 'ARCHIVED' && <ActionBtn onClick={handleReopen} disabled={reopening} icon={RotateCcw} label={i18n.t('exams:preview.reopen')} loadingLabel={i18n.t('exams:preview.reopening')} />}
                        {isAdmin && <ActionBtn onClick={() => navigate(`/exams/${examId}/edit`)} icon={Pencil} label={i18n.t('exams:preview.edit')} />}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ─── Main Column ─── */}
                    <div className="flex-1 min-w-0 space-y-6">

                        {/* Header Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="px-6 py-6">
                                {/* Tags */}
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        {exam.subjectColor && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: exam.subjectColor }} />}
                                        {exam.subjectName}
                                    </span>
                                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        {exam.categoryName}
                                    </span>
                                    <span className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        <StatusIcon size={12} /> {config.label}
                                    </span>
                                </div>

                                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight mb-2">
                                    {exam.title}
                                </h1>

                                {exam.description && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {exam.description}
                                    </p>
                                )}
                            </div>

                            {/* Stats row */}
                            <div className="border-t border-slate-100 dark:border-slate-800">
                                {[
                                    { icon: Clock, label: i18n.t('exams:preview.duration'), value: i18n.t('exams:preview.durationVal', { count: exam.duration }) },
                                    { icon: BookOpen, label: i18n.t('exams:preview.questions'), value: i18n.t('exams:preview.questionsVal', { count: exam.questionCount }) },
                                    { icon: Target, label: i18n.t('exams:preview.totalPoints'), value: `${exam.totalPoints}`, sub: i18n.t('exams:preview.passLabel', { score: exam.passingScore }) },
                                    { icon: CalendarClock, label: i18n.t('exams:preview.schedule'), value: exam.startDatetime ? i18n.t('exams:preview.limited') : i18n.t('exams:preview.alwaysOpen') },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between py-3.5 px-6 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                            <stat.icon size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                            <span>{stat.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{stat.value}</span>
                                            {stat.sub && <span className="text-xs text-slate-400 ml-2">({stat.sub})</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Info banners */}
                            <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 space-y-2.5">
                                {exam.hasAccessCode && (
                                    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <Lock size={14} className="text-slate-400" />
                                            <span>{i18n.t('exams:preview.accessCodeLabel')}</span>
                                            <code className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-mono tracking-widest text-slate-800 dark:text-slate-200 text-xs">
                                                {exam.accessCode || '••••••'}
                                            </code>
                                        </div>
                                        {exam.accessCode && (
                                            <button onClick={handleCopyCode} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title={i18n.t('exams:preview.copyCode')}>
                                                {copied ? <span className="text-xs font-semibold text-emerald-600">{i18n.t('exams:preview.copied')}</span> : <Copy size={14} />}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {exam.requirePaperSubmission && (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <Camera size={14} className="text-slate-400" /> {i18n.t('exams:preview.requirePaper')}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <GraduationCap size={14} className="text-slate-400" />
                                    {exam.gradingMode === 'MANUAL' ? i18n.t('exams:preview.manualGrading') : i18n.t('exams:preview.autoGrading')}
                                </div>

                                {isAdmin && (
                                    <button
                                        onClick={() => navigate(`/exams/${examId}/submissions`)}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 transition-colors"
                                    >
                                        <ClipboardList size={16} /> {i18n.t('exams:preview.manageSubmissions')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ── Questions List ── */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2.5">
                                <BookOpen size={16} className="text-slate-400" />
                                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                    {i18n.t('exams:preview.questionList')} <span className="text-slate-400 font-normal">({exam.questions.length})</span>
                                </h2>
                            </div>
                            <div className="p-6">
                                <ExamQuestionList questions={exam.questions} />
                            </div>
                        </div>
                    </div>

                    {/* ─── Sidebar: Leaderboard ─── */}
                    <div className="w-full lg:w-[340px] xl:w-[400px] shrink-0">
                        <div className="lg:sticky lg:top-28">
                            {examId && <PreviewLeaderboard examId={examId} currentUserId={user?.id} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};