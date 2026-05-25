import { useState, useEffect, useRef, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle2, XCircle, Clock,
    AlertTriangle, ChevronDown,
    Trophy, BookOpen, Minus, BarChart3, Users, Target, Info, Filter, MessageSquare, ClockAlert, GraduationCap, Upload, X,
    FileImage, FileText, Loader2, TimerOff,
} from 'lucide-react';
import { examAttemptRepository } from '@/features/exams/api';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { LatexRenderer } from '@/features/exams/components/LatexRenderer';
import { ExamResultSkeleton, LeaderboardSkeleton } from '@/features/exams/components/ExamSkeletons';
import { RankingCardItem } from '@/features/ranking/components/RankingCardItem';
import { useUserPreview } from '@/hooks/useUserPreview';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useExamResult } from '@/features/exams/hooks/useExamResult';
import type { LeaderboardEntry as RankingEntry } from '@/features/ranking/types/ranking.types';
import { Author } from '@/features/forum/types/forum.types';
import { UserRole } from '@/features/auth/types/auth.types';
import type { ExamResult, QuestionResultDetail, LeaderboardEntry, LeaderboardResponse } from '@/features/exams/types/attempt.types';

// ─── Helpers ─────────────────────────────────────────────
const fmtTime = (sec: number) => `${Math.floor(sec / 60)}p ${(sec % 60).toString().padStart(2, '0')}s`;

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

// ─── Leaderboard ─────────────────────────────────────────
const ExamLeaderboard = ({ examId, currentUserId }: { examId: number; currentUserId?: number }) => {
    const [data, setData] = useState<LeaderboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const {
        isVisible: showPreview, position: previewPosition, previewItem: previewEntry,
        handleHoverStart, handleHoverEnd, handlePreviewMouseEnter, handlePreviewMouseLeave,
    } = useUserPreview<RankingEntry>();

    const convertToAuthor = (entry: RankingEntry): Author => ({
        id: entry.userId, name: entry.fullName, avatar: entry.avatarUrl || '',
        role: (entry.role || 'STUDENT_INTERNAL') as UserRole,
        badges: (entry.selectedBadges ?? []).map(b => ({ ...b, isSelected: true, isEarned: true })),
        xpPoints: entry.xpPoints,
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await examAttemptRepository.getLeaderboard(examId, undefined, 50);
                if (!cancelled) setData(res);
            } catch { /* ignore */ }
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
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{i18n.t('exams:result.leaderboardEmpty')}</h3>
                <p className="text-sm text-slate-400">{i18n.t('exams:result.leaderboardEmptyHint')}</p>
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
                    {i18n.t('exams:result.leaderboard')}
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500">
                    <Users size={12} /> {data.rankings.length}
                </span>
            </div>

            {data.userRank && (
                <div className="mx-5 mt-3 flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-500">{i18n.t('exams:result.yourRank')}</span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-200">#{data.userRank.rank}</span>
                </div>
            )}

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

// ─── Result Detail Card (memoized) ───────────────────────
const ResultDetailCard = memo(({ detail, index }: { detail: QuestionResultDetail; index: number }) => {
    const [expanded, setExpanded] = useState(false);
    const isCorrect = detail.isCorrect;
    const isPending = isCorrect === null;

    // Detect question type from data
    const hasOptions = (detail.correctOptions && detail.correctOptions.length > 0)
        || (detail.userSelectedOptions && detail.userSelectedOptions.length > 0)
        || (detail.options && detail.options.length > 0);
    const isObjective = detail.questionType === 'SINGLE_CHOICE' || detail.questionType === 'MULTIPLE_CHOICE' || (hasOptions && !detail.questionType);
    const isSubjective = !isObjective;

    // Build merged options list
    const allOptions = new Map<number, { id: number; label: string; content: string }>();
    detail.correctOptions?.forEach(o => allOptions.set(o.id, o));
    detail.userSelectedOptions?.forEach(o => { if (!allOptions.has(o.id)) allOptions.set(o.id, o); });
    detail.options?.forEach(o => allOptions.set(o.id, { id: o.id, label: '', content: o.content }));
    const opts = Array.from(allOptions.values()).sort((a, b) => a.label.localeCompare(b.label));
    const correctIds = new Set(detail.correctOptionIds ?? detail.correctOptions?.map(o => o.id) ?? []);
    const selectedIds = new Set(detail.userSelectedOptionIds ?? detail.userSelectedOptions?.map(o => o.id) ?? []);

    const displayPoints = detail.manualPoints != null ? detail.manualPoints : detail.pointsEarned;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Toggle header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">
                    {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        {isPending && <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{i18n.t('exams:result.pendingGrading')}</span>}
                        {!isPending && isCorrect && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{i18n.t('exams:result.correct')}</span>}
                        {!isPending && !isCorrect && <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{i18n.t('exams:result.wrong')}</span>}
                        {detail.manualPoints != null && <span className="text-xs font-semibold text-slate-400">{i18n.t('exams:result.teacherGraded')}</span>}
                        {!isPending && <span className="text-xs font-semibold text-slate-500">{displayPoints}/{detail.questionPoints ?? '?'}{i18n.t('exams:grading.pointsSuffix')}</span>}
                    </div>
                    {detail.questionContent && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate pr-4">
                            <LatexRenderer content={detail.questionContent} />
                        </div>
                    )}
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 shrink-0 ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded content */}
            {expanded && (
                <div className="px-6 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4 bg-slate-50/50 dark:bg-slate-900">
                    {/* Question content */}
                    {detail.questionContent && (
                        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                            <LatexRenderer content={detail.questionContent} block />
                        </div>
                    )}

                    {/* ── Options (objective) ── */}
                    {isObjective && opts.length > 0 && (
                        <div className="space-y-2">
                            {opts.map(opt => {
                                const isRight = correctIds.has(opt.id);
                                const isSelected = selectedIds.has(opt.id);
                                let bgStyle = '';
                                if (isRight) bgStyle = 'bg-emerald-50/50 dark:bg-emerald-900/5';
                                else if (isSelected) bgStyle = 'bg-rose-50/50 dark:bg-rose-900/5';

                                return (
                                    <div key={opt.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 ${bgStyle}`}>
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${isRight ? 'bg-emerald-600 text-white' : isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {opt.label || '?'}
                                        </span>
                                        <span className="flex-1 pt-1 text-sm text-slate-700 dark:text-slate-200">
                                            <LatexRenderer content={opt.content} />
                                        </span>
                                        {isRight && <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-1" />}
                                        {isSelected && !isRight && <XCircle size={18} className="text-rose-500 shrink-0 mt-1" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Text answer (subjective) ── */}
                    {isSubjective && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{i18n.t('exams:result.yourAnswer')}</span>
                            </div>
                            <div className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200">
                                {detail.userTextAnswer
                                    ? <LatexRenderer content={detail.userTextAnswer} block />
                                    : <span className="text-slate-400 italic">{i18n.t('exams:result.noAnswer')}</span>
                                }
                            </div>
                        </div>
                    )}

                    {/* ── Correct answers ── */}
                    {detail.correctAnswer && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-emerald-600" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{i18n.t('exams:result.correctAnswer')}</span>
                            </div>
                            <div className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                                <LatexRenderer content={detail.correctAnswer} />
                            </div>
                        </div>
                    )}
                    {detail.correctAnswers && detail.correctAnswers.length > 0 && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-emerald-600" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{i18n.t('exams:result.correctAnswer')}</span>
                            </div>
                            <div className="px-4 py-3 space-y-2">
                                {detail.correctAnswers.map((ans, i) => (
                                    <div key={i} className="flex items-baseline gap-2">
                                        <span className="text-sm font-bold text-slate-500 shrink-0">{String.fromCharCode(97 + i)})</span>
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                            <LatexRenderer content={ans} />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Instructor comment ── */}
                    {detail.instructorComment && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                                <GraduationCap size={14} className="text-slate-500" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{i18n.t('exams:result.instructorComment')}</span>
                            </div>
                            <div className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                <LatexRenderer content={detail.instructorComment} block />
                            </div>
                        </div>
                    )}

                    {/* ── Explanation ── */}
                    {detail.explanation && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                                <Info size={14} className="text-slate-500" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{i18n.t('exams:result.explanation')}</span>
                            </div>
                            <div className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                <LatexRenderer content={detail.explanation} block />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
ResultDetailCard.displayName = 'ResultDetailCard';

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export const ExamResultPage = () => {
    const { slug, attemptId } = useParams<{ slug: string; attemptId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const numericAttemptId = attemptId ? Number(attemptId) : null;

    const { result, loading, errorState, submitEvidence, setResult } = useExamResult(numericAttemptId);
    const [showDetails, setShowDetails] = useState(false);
    const [filterIncorrect, setFilterIncorrect] = useState(false);
    const [showAppeal, setShowAppeal] = useState(false);
    const [appealReason, setAppealReason] = useState('');
    const [appealSubmitting, setAppealSubmitting] = useState(false);
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
    const [evidenceUploading, setEvidenceUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

    if (loading) return <ExamResultSkeleton />;

    {/* ── Evidence Required Screen ── */ }
    if (errorState?.type === 'evidence_required') {
        const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
            const selected = Array.from(e.target.files || []);
            const valid = selected.filter(f => {
                if (!ALLOWED_TYPES.includes(f.type)) { showToast(i18n.t('exams:result.fileTypeError', { name: f.name }), 'error'); return false; }
                if (f.size > MAX_FILE_SIZE) { showToast(i18n.t('exams:result.fileSizeError', { name: f.name }), 'error'); return false; }
                return true;
            });
            setEvidenceFiles(prev => [...prev, ...valid]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        const handleUpload = async () => {
            if (evidenceFiles.length === 0 || evidenceUploading) return;
            setEvidenceUploading(true);
            try {
                await submitEvidence(evidenceFiles);
                showToast(i18n.t('exams:evidenceSuccess'), 'success');
            } catch {
                showToast(i18n.t('exams:evidenceFailed'), 'error');
            } finally {
                setEvidenceUploading(false);
            }
        };

        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                    <Upload size={40} className="mx-auto text-amber-500 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('exams:result.evidenceTitle')}</h2>
                    <p className="text-sm text-slate-500 mb-6">{i18n.t('exams:result.evidenceDesc')}</p>

                    {/* File list */}
                    {evidenceFiles.length > 0 && (
                        <div className="space-y-2 mb-4 text-left">
                            {evidenceFiles.map((f, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    {f.type.startsWith('image/') ? <FileImage size={16} className="text-amber-500 shrink-0" /> : <FileText size={16} className="text-amber-500 shrink-0" />}
                                    <span className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate">{f.name}</span>
                                    <span className="text-[10px] text-slate-400">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                                    <button onClick={() => setEvidenceFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Select files */}
                    <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-3"
                    >
                        <Upload size={16} /> {i18n.t('exams:result.selectFiles')}
                    </button>

                    {/* Upload button */}
                    {evidenceFiles.length > 0 && (
                        <button
                            onClick={handleUpload}
                            disabled={evidenceUploading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 transition-colors"
                        >
                            {evidenceUploading
                                ? <><Loader2 size={16} className="animate-spin" /> {i18n.t('exams:result.uploading')}</>
                                : <><Upload size={16} /> {i18n.t('exams:result.submitEvidence', { count: evidenceFiles.length })}</>
                            }
                        </button>
                    )}

                    <button onClick={() => navigate(-1)} className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors">
                        {i18n.t('exams:result.goBack')}
                    </button>
                </div>
            </div>
        );
    }

    {/* ── Evidence Window Expired Screen ── */ }
    if (errorState?.type === 'evidence_expired') {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center px-4">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full">
                    <TimerOff size={40} className="mx-auto text-rose-400 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('exams:result.evidenceExpiredTitle')}</h2>
                    <p className="text-sm text-slate-500 mb-5">{i18n.t('exams:result.evidenceExpiredDesc')}</p>
                    <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto">
                        <ArrowLeft size={16} /> {i18n.t('exams:result.backBtn')}
                    </button>
                </div>
            </div>
        );
    }

    {/* ── Generic Error Screen ── */ }
    if (errorState?.type === 'generic') {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full mx-4">
                    <AlertTriangle size={40} className="mx-auto text-slate-400 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('exams:result.loadErrorTitle')}</h2>
                    <p className="text-sm text-slate-500 mb-5">{errorState.message}</p>
                    <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto">
                        <ArrowLeft size={16} /> {i18n.t('exams:result.backBtn')}
                    </button>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full mx-4">
                    <AlertTriangle size={40} className="mx-auto text-slate-400 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('exams:result.notFoundTitle')}</h2>
                    <p className="text-sm text-slate-500 mb-5">{i18n.t('exams:result.notFoundDesc')}</p>
                    <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto">
                        <ArrowLeft size={16} /> {i18n.t('exams:result.backBtn')}
                    </button>
                </div>
            </div>
        );
    }

    const scorePercent = Math.round((result.score / result.totalPoints) * 100);
    const hasUngradedQuestions = result.details.some(d => d.isCorrect === null);
    const isPendingGrading = result.status === 'PENDING_GRADING' || hasUngradedQuestions;
    const isPass = !isPendingGrading && result.passed;

    return (
        <div className="min-h-screen font-sans">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl pt-24 pb-24">
                <button onClick={() => navigate(-1)} className="mb-6 group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors w-fit">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> {i18n.t('exams:result.backBtn')}
                </button>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* ─── Main Column ─── */}
                    <div className="flex-1 min-w-0 space-y-4">

                        {/* ── Pending Grading Banner ── */}
                        {result.status === 'PENDING_GRADING' && (
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                <ClockAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{i18n.t('exams:result.pendingTitle')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{i18n.t('exams:result.pendingDesc')}</p>
                                </div>
                            </div>
                        )}

                        {/* ── Score Card ── */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="px-6 py-6">
                                {/* Result heading */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isPendingGrading ? 'bg-amber-50 dark:bg-amber-900/20' : isPass ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                        {isPendingGrading ? <ClockAlert size={22} className="text-amber-500" /> : isPass ? <Trophy size={22} className="text-emerald-600 dark:text-emerald-400" /> : <Minus size={22} strokeWidth={3} className="text-slate-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                            {isPendingGrading ? i18n.t('exams:result.headingPending') : isPass ? i18n.t('exams:result.headingPass') : i18n.t('exams:result.headingFail')}
                                        </h1>
                                        {result.examTitle && <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{result.examTitle}</p>}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{result.score}</p>
                                        <p className="text-xs font-bold text-slate-400">/ {result.totalPoints} {i18n.t('exams:grading.pointsSuffix')}</p>
                                    </div>
                                </div>

                                {/* Score bar */}
                                <div className="mb-2">
                                    <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
                                        <span className="text-slate-600 dark:text-slate-300">{scorePercent}%</span>
                                        <span className={`text-xs font-semibold ${isPendingGrading ? 'text-amber-500' : isPass ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {isPendingGrading ? i18n.t('exams:result.scorePending') : isPass ? i18n.t('exams:result.scorePass') : i18n.t('exams:result.scoreFail')}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isPass ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                            style={{ width: `${Math.min(scorePercent, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div className="border-t border-slate-100 dark:border-slate-800">
                                {[
                                    { icon: CheckCircle2, label: i18n.t('exams:result.statCorrect'), value: i18n.t('exams:result.statQuestions', { count: result.totalCorrect }), color: 'text-emerald-500' },
                                    { icon: XCircle, label: i18n.t('exams:result.statWrong'), value: i18n.t('exams:result.statQuestions', { count: result.totalWrong }), color: 'text-rose-500' },
                                    { icon: Target, label: i18n.t('exams:result.statSkipped'), value: i18n.t('exams:result.statQuestions', { count: result.totalUnanswered }), color: 'text-slate-400' },
                                    { icon: Clock, label: i18n.t('exams:result.statTime'), value: fmtTime(result.timeSpentSeconds), color: 'text-slate-400' },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between py-3.5 px-6 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <row.icon size={16} className={`${row.color} shrink-0`} />
                                            <span>{row.label}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{row.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Grade Appeal */}
                            <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4">
                                {result.appealStatus === 'APPROVED' ? (
                                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 justify-center py-1">
                                        <CheckCircle2 size={16} /> {i18n.t('exams:result.appealApproved')}
                                    </div>
                                ) : result.appealStatus === 'REJECTED' ? (
                                    <div className="flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-400 justify-center py-1">
                                        <XCircle size={16} /> {i18n.t('exams:result.appealRejected')}
                                    </div>
                                ) : result.appealStatus === 'PENDING' ? (
                                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 justify-center py-1">
                                        <ClockAlert size={16} /> {i18n.t('exams:result.appealPending')}
                                    </div>
                                ) : (
                                    <>
                                        {!showAppeal ? (
                                            <button
                                                onClick={() => setShowAppeal(true)}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                            >
                                                <MessageSquare size={16} /> {i18n.t('exams:result.appealRequest')}
                                            </button>
                                        ) : (
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{i18n.t('exams:result.appealReasonLabel')}</label>
                                                <textarea
                                                    rows={3}
                                                    value={appealReason}
                                                    onChange={e => setAppealReason(e.target.value)}
                                                    placeholder={i18n.t('exams:result.appealReasonPlaceholder')}
                                                    className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setShowAppeal(false); setAppealReason(''); }}
                                                        className="flex-1 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        {i18n.t('exams:result.cancelBtn')}
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (!numericAttemptId || !appealReason.trim()) return;
                                                            setAppealSubmitting(true);
                                                            try {
                                                                await examAttemptRepository.submitGradeAppeal({ attemptId: numericAttemptId, reason: appealReason.trim() });
                                                                showToast(i18n.t('exams:appealSuccess'), 'success');
                                                                setShowAppeal(false);
                                                                // Reload to get updated appealStatus
                                                                const updated = await examAttemptRepository.getAttemptResult(numericAttemptId);
                                                                setResult(updated);
                                                            } catch { showToast(i18n.t('exams:appealFailed'), 'error'); }
                                                            finally { setAppealSubmitting(false); }
                                                        }}
                                                        disabled={appealSubmitting || !appealReason.trim()}
                                                        className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors disabled:opacity-50"
                                                    >
                                                        {appealSubmitting ? i18n.t('exams:result.appealSubmitting') : i18n.t('exams:result.appealSubmitBtn')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ── Detail Toggle ── */}
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <BookOpen size={16} className="text-slate-400" />
                            {showDetails ? i18n.t('exams:result.hideDetails') : i18n.t('exams:result.showDetails')}
                            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
                        </button>

                        {/* ── Question Details ── */}
                        {showDetails && (
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 mb-1">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">{i18n.t('exams:result.questionDetails')}</h3>
                                    <button
                                        onClick={() => setFilterIncorrect(!filterIncorrect)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${filterIncorrect ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <Filter size={14} /> {i18n.t('exams:result.filterWrong', { count: result.totalWrong })}
                                    </button>
                                </div>

                                {result.details.map((detail, index) => ({ detail, index }))
                                    .filter(item => filterIncorrect ? !item.detail.isCorrect : true)
                                    .map((item) => (
                                        <ResultDetailCard key={item.detail.questionId} detail={item.detail} index={item.index} />
                                    ))
                                }

                                {filterIncorrect && result.totalWrong === 0 && (
                                    <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <Trophy size={24} className="text-emerald-500 mx-auto mb-2" />
                                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">{i18n.t('exams:result.perfectTitle')}</h4>
                                        <p className="text-sm text-slate-500">{i18n.t('exams:result.perfectDesc')}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ─── Sidebar: Leaderboard ─── */}
                    <div className="w-full lg:w-[340px] xl:w-[400px] shrink-0">
                        <div className="lg:sticky lg:top-28">
                            <ExamLeaderboard examId={result.examId ?? Number(numericAttemptId)} currentUserId={user?.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};