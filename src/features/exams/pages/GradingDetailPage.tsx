import { useState, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle2, XCircle, ClockAlert, GraduationCap,
    Loader2, AlertTriangle, Send, MessageSquare, Clock,
    ChevronDown, ChevronRight, AlertOctagon, Eye, Clipboard, ExternalLink, MousePointerClick,
    FileImage, Download, RefreshCw,
} from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { LatexRenderer } from '@/features/exams/components/LatexRenderer';
import { useUserPreview } from '@/hooks/useUserPreview';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import { VerifiedBadge, StudentBadges } from '@/features/badges/components/VerifiedBadge';
import { getUserNameColor } from '@/utils/rankingHelpers';
import { useGradingDetail } from '@/features/exams/hooks/useGradingDetail';
import type { Author } from '@/features/forum/types/forum.types';
import type { QuestionResultDetail, ActionLogEntry } from '@/features/exams/types/attempt.types';
import { GradingDetailSkeleton } from '@/features/exams/components/ExamSkeletons';

export const GradingDetailPage = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    const numericAttemptId = attemptId ? Number(attemptId) : null;

    const {
        result, evidences, loading, submitting, actionLogs,
        grades, overallComment, setOverallComment,
        updateGrade, handleSubmitGrades,
    } = useGradingDetail(numericAttemptId);

    const [logsExpanded, setLogsExpanded] = useState(false);

    const {
        isVisible: showPreview,
        position: previewPosition,
        previewItem: previewStudent,
        handleHoverStart,
        handleHoverEnd,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave,
    } = useUserPreview<Author>();

    const onSubmitGrades = async () => {
        const success = await handleSubmitGrades();
        if (success) navigate(-1);
    };

    /* ── Loading / Error states ── */
    if (loading) {
        return <GradingDetailSkeleton />;
    }

    if (!result) {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full mx-4">
                    <AlertTriangle size={40} className="mx-auto text-slate-400 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('exams:grading.notFound')}</h2>
                    <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center justify-center gap-2 mx-auto mt-4">
                        <ArrowLeft size={16} /> {i18n.t('exams:grading.backBtn')}
                    </button>
                </div>
            </div>
        );
    }

    /* ── Derived data ── */
    const isRegrade = result.appealStatus === 'APPROVED' && result.status === 'GRADED';
    const subjectiveCount = result.details.filter(d => d.isCorrect === null).length;
    const autoScore = result.details
        .filter(d => d.isCorrect !== null)
        .reduce((sum, d) => sum + d.pointsEarned, 0);
    const manualScore = Object.values(grades)
        .reduce((sum, g) => sum + (Number(g.points) || 0), 0);

    const studentAuthor: Author | null = result.student ? {
        id: result.student.id,
        name: result.student.name,
        avatar: result.student.avatar,
        role: result.student.role as Author['role'],
        badges: (result.student.badges ?? []) as Author['badges'],
        xpPoints: result.student.xpPoints,
        isDeleted: result.student.isDeleted,
    } : null;

    return (
        <div className="min-h-screen font-sans">
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl pt-24 pb-24">
                <button onClick={() => navigate(-1)} className="mb-6 group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors w-fit">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> {i18n.t('exams:grading.backBtn')}
                </button>

                {/* ── Header Card ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <GraduationCap size={20} className="text-slate-500 dark:text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{i18n.t('exams:grading.title')}</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{result.examTitle || i18n.t('exams:grading.examFallback')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        {/* Student row */}
                        {studentAuthor && (
                            <div className="flex items-center gap-3">
                                <Link
                                    to={`/profile/${studentAuthor.id}`}
                                    onMouseEnter={(e) => handleHoverStart(studentAuthor, e)}
                                    onMouseLeave={handleHoverEnd}
                                    className="shrink-0"
                                >
                                    <img
                                        src={studentAuthor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentAuthor.name)}&background=random`}
                                        alt={studentAuthor.name}
                                        className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-700 object-cover hover:opacity-90 transition-opacity"
                                    />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <Link
                                            to={`/profile/${studentAuthor.id}`}
                                            onMouseEnter={(e) => handleHoverStart(studentAuthor, e)}
                                            onMouseLeave={handleHoverEnd}
                                            className={`text-sm font-semibold hover:underline ${getUserNameColor(studentAuthor.xpPoints ?? 0)}`}
                                        >
                                            {studentAuthor.name}
                                        </Link>
                                        <VerifiedBadge role={studentAuthor.role} size={14} />
                                        <StudentBadges badges={studentAuthor.badges} maxDisplay={2} />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{i18n.t('exams:grading.candidate')}</p>
                                </div>
                            </div>
                        )}

                        {/* Score summary */}
                        <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="font-medium text-slate-500">{i18n.t('exams:grading.autoScore')}</span>
                                <span className="font-bold">{autoScore}{i18n.t('exams:grading.pointsSuffix')}</span>
                            </div>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="font-medium text-slate-500">{i18n.t('exams:grading.teacherScore')}</span>
                                <span className="font-bold">{manualScore}{i18n.t('exams:grading.pointsSuffix')}</span>
                            </div>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="font-medium text-slate-500">{i18n.t('exams:grading.totalScore')}</span>
                                <span className="font-bold">{autoScore + manualScore}/{result.totalPoints}{i18n.t('exams:grading.pointsSuffix')}</span>
                            </div>
                            {subjectiveCount > 0 && (
                                <>
                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                        <ClockAlert size={14} />
                                        <span className="font-semibold">{i18n.t('exams:grading.needsGrading', { count: subjectiveCount })}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Appeal Regrade Badge */}
                        {isRegrade && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-sm">
                                <RefreshCw size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                <span className="font-semibold text-amber-700 dark:text-amber-300">{i18n.t('exams:grading.regradeBanner')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Evidence Files ── */}
                {evidences.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <FileImage size={16} />
                            {i18n.t('exams:grading.evidenceTitle', { count: evidences.length })}
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {evidences.map(ev => {
                                const isImage = ev.contentType.startsWith('image/');
                                return (
                                    <div key={ev.id} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        {isImage ? (
                                            <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                                                <img src={ev.fileUrl} alt={ev.fileName} className="w-full h-48 object-cover hover:opacity-90 transition-opacity" />
                                            </a>
                                        ) : (
                                            <div className="h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                                                <FileImage size={40} className="text-slate-300 dark:text-slate-600" />
                                            </div>
                                        )}
                                        <div className="px-3 py-2 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700">
                                            <span className="flex-1 text-xs text-slate-600 dark:text-slate-300 truncate font-medium">{ev.fileName}</span>
                                            <span className="text-[10px] text-slate-400 shrink-0">{(ev.fileSize / 1024 / 1024).toFixed(1)}MB</span>
                                            <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors shrink-0" title={i18n.t('exams:grading.downloadBtn')}>
                                                <Download size={14} />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Action Logs ── */}
                {actionLogs.length > 0 && (
                    <ActionLogsPanel logs={actionLogs} expanded={logsExpanded} onToggle={() => setLogsExpanded(!logsExpanded)} />
                )}

                {/* ── Questions List ── */}
                <div className="space-y-4 mb-6">
                    {result.details.map((detail, index) => (
                        <QuestionCard
                            key={detail.questionId}
                            detail={detail}
                            index={index}
                            grade={grades[detail.questionId]}
                            onUpdateGrade={(field, value) => updateGrade(detail.questionId, field, value)}
                        />
                    ))}
                </div>

                {/* ── Overall Comment + Submit ── */}
                {(subjectiveCount > 0 || isRegrade) && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <MessageSquare size={16} /> {i18n.t('exams:grading.overallComment')}
                        </div>
                        <div className="p-6 space-y-4">
                            <textarea
                                value={overallComment}
                                onChange={e => setOverallComment(e.target.value)}
                                placeholder={i18n.t('exams:grading.overallPlaceholder')}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors resize-none"
                            />
                            <button
                                onClick={onSubmitGrades}
                                disabled={submitting}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-colors ${isRegrade ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700' : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700'
                                    }`}
                            >
                                {submitting
                                    ? <><Loader2 size={16} className="animate-spin" /> {i18n.t('exams:grading.processing')}</>
                                    : isRegrade
                                        ? <><RefreshCw size={16} /> {i18n.t('exams:grading.regradeComplete')}</>
                                        : <><Send size={16} /> {i18n.t('exams:grading.gradeComplete')}</>
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* UserPreview floating card */}
                {previewStudent && (
                    <UserPreviewCard
                        author={previewStudent}
                        isVisible={showPreview}
                        position={previewPosition}
                        onMouseEnter={handlePreviewMouseEnter}
                        onMouseLeave={handlePreviewMouseLeave}
                    />
                )}
            </div>
        </div>
    );
};

// ─── Question Card (memoized to prevent re-render lag) ───
const QuestionCard = memo(({
    detail, index, grade, onUpdateGrade,
}: {
    detail: QuestionResultDetail;
    index: number;
    grade?: { points: string; comment: string };
    onUpdateGrade: (field: 'points' | 'comment', value: string) => void;
}) => {
    const isPending = detail.isCorrect === null;
    const isCorrect = detail.isCorrect;

    const hasOptions = (detail.correctOptions && detail.correctOptions.length > 0) || (detail.userSelectedOptions && detail.userSelectedOptions.length > 0);
    const isObjective = detail.questionType === 'SINGLE_CHOICE' || detail.questionType === 'MULTIPLE_CHOICE' || (hasOptions && !detail.questionType);

    // Build all options list
    const allOptions = new Map<number, { id: number; label: string; content: string }>();
    detail.correctOptions?.forEach(o => allOptions.set(o.id, o));
    detail.userSelectedOptions?.forEach(o => { if (!allOptions.has(o.id)) allOptions.set(o.id, o); });
    detail.options?.forEach(o => allOptions.set(o.id, { id: o.id, label: '', content: o.content }));
    const opts = Array.from(allOptions.values()).sort((a, b) => a.label.localeCompare(b.label));
    const correctIds = new Set(detail.correctOptionIds ?? detail.correctOptions?.map(o => o.id) ?? []);
    const selectedIds = new Set(detail.userSelectedOptionIds ?? detail.userSelectedOptions?.map(o => o.id) ?? []);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Question header */}
            <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">{index + 1}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isPending && <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">{i18n.t('exams:grading.needGrade')}</span>}
                    {!isPending && isCorrect && <span className="px-2 py-0.5 rounded text-xs font-semibold text-emerald-700 dark:text-emerald-400">{i18n.t('exams:result.correct')}</span>}
                    {!isPending && !isCorrect && <span className="px-2 py-0.5 rounded text-xs font-semibold text-rose-700 dark:text-rose-400">{i18n.t('exams:result.wrong')}</span>}
                    <span className="text-xs text-slate-400">{isObjective ? i18n.t('exams:grading.typeObjective') : i18n.t('exams:grading.typeSubjective')}</span>
                </div>
                {!isPending && (
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        {detail.manualPoints != null ? detail.manualPoints : detail.pointsEarned}{i18n.t('exams:grading.pointsSuffix')}
                    </span>
                )}
            </div>

            {/* Question body */}
            <div className="px-6 py-5 space-y-4">
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
                            let rowStyle = 'border-slate-200 dark:border-slate-700';
                            let bgStyle = '';
                            if (isRight) bgStyle = 'bg-emerald-50/50 dark:bg-emerald-900/5';
                            else if (isSelected) bgStyle = 'bg-rose-50/50 dark:bg-rose-900/5';

                            return (
                                <div key={opt.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${rowStyle} ${bgStyle}`}>
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

                {/* ── Student text answer (subjective) ── */}
                {!isObjective && detail.userTextAnswer && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{i18n.t('exams:grading.studentAnswer')}</span>
                        </div>
                        <div className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                            <LatexRenderer content={detail.userTextAnswer} block />
                        </div>
                    </div>
                )}
                {!isObjective && !detail.userTextAnswer && (
                    <p className="text-sm italic text-slate-400 dark:text-slate-500">{i18n.t('exams:grading.noStudentAnswer')}</p>
                )}

                {/* ── Correct answers reference ── */}
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

                {/* ── Grading inputs ── */}
                {isPending && grade && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                            <GraduationCap size={14} className="text-blue-600" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{i18n.t('exams:grading.gradeSection')}</span>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">
                                    {i18n.t('exams:grading.pointsLabel')} <span className="font-normal text-slate-400">{i18n.t('exams:grading.maxPoints', { max: detail.questionPoints ?? '?' })}</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max={detail.questionPoints}
                                    value={grade.points}
                                    onChange={e => onUpdateGrade('points', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">{i18n.t('exams:grading.commentLabel')}</label>
                                <textarea
                                    value={grade.comment}
                                    onChange={e => onUpdateGrade('comment', e.target.value)}
                                    placeholder={i18n.t('exams:grading.commentPlaceholder')}
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
QuestionCard.displayName = 'QuestionCard';

// ─── Action Logs Panel ────────────────────────────────────
const SUSPICIOUS_ACTIONS = new Set(['TAB_SWITCH', 'FOCUS_LOST', 'COPY', 'PASTE']);

const ACTION_LABEL: Record<string, string> = {
    ANSWER_CHANGE: i18n.t('exams:grading.logAnswerChange'),
    NAVIGATE: i18n.t('exams:grading.logNavigate'),
    FLAG: i18n.t('exams:grading.logFlag'),
    UNFLAG: i18n.t('exams:grading.logUnflag'),
    TAB_SWITCH: i18n.t('exams:grading.logTabSwitch'),
    FULLSCREEN_TOGGLE: i18n.t('exams:grading.logFullscreen'),
    PASTE: i18n.t('exams:grading.logPaste'),
    COPY: i18n.t('exams:grading.logCopy'),
    EXAM_START: i18n.t('exams:grading.logExamStart'),
    EXAM_SUBMIT: i18n.t('exams:grading.logExamSubmit'),
    FOCUS_LOST: i18n.t('exams:grading.logFocusLost'),
};

const ACTION_DESCRIPTION = (log: ActionLogEntry): string | null => {
    if (log.action === 'ANSWER_CHANGE' && log.questionId) return i18n.t('exams:grading.logQuestion', { id: log.questionId });
    if (log.action === 'NAVIGATE' && log.detail) return log.detail;
    if (log.action === 'FLAG' && log.questionId) return i18n.t('exams:grading.logQuestion', { id: log.questionId });
    if (log.action === 'UNFLAG' && log.questionId) return i18n.t('exams:grading.logQuestion', { id: log.questionId });
    if (log.action === 'EXAM_SUBMIT' && log.detail) return log.detail === 'auto' ? i18n.t('exams:grading.logAutoSubmit') : i18n.t('exams:grading.logManualSubmit');
    if (log.action === 'FULLSCREEN_TOGGLE' && log.detail) return log.detail === 'enter' ? i18n.t('exams:grading.logFullscreenEnter') : i18n.t('exams:grading.logFullscreenExit');
    if (log.action === 'EXAM_START' && log.detail) return log.detail;
    if (log.action === 'PASTE' && log.detail) return log.detail.length > 50 ? `"${log.detail.slice(0, 50)}…"` : `"${log.detail}"`;
    if (log.detail) return log.detail;
    return null;
};

const ACTION_ICON: Record<string, React.ReactNode> = {
    TAB_SWITCH: <ExternalLink size={14} />,
    FOCUS_LOST: <Eye size={14} />,
    COPY: <Clipboard size={14} />,
    PASTE: <Clipboard size={14} />,
    ANSWER_CHANGE: <MousePointerClick size={14} />,
    NAVIGATE: <ChevronRight size={14} />,
    FLAG: <AlertTriangle size={14} />,
    UNFLAG: <AlertTriangle size={14} />,
    FULLSCREEN_TOGGLE: <Eye size={14} />,
    EXAM_START: <Clock size={14} />,
    EXAM_SUBMIT: <Send size={14} />,
};

const ANSWER_ACTIONS = new Set(['ANSWER_CHANGE', 'NAVIGATE', 'FLAG', 'UNFLAG']);
const SYSTEM_ACTIONS = new Set(['EXAM_START', 'EXAM_SUBMIT', 'FULLSCREEN_TOGGLE']);

type LogTab = 'all' | 'suspicious' | 'answer' | 'system';

const ActionLogsPanel = ({ logs, expanded, onToggle }: { logs: ActionLogEntry[]; expanded: boolean; onToggle: () => void }) => {
    const [tab, setTab] = useState<LogTab>('all');

    const suspicious = logs.filter(l => SUSPICIOUS_ACTIONS.has(l.action));
    const answerLogs = logs.filter(l => ANSWER_ACTIONS.has(l.action));
    const systemLogs = logs.filter(l => SYSTEM_ACTIONS.has(l.action));

    const filtered = tab === 'all' ? logs : tab === 'suspicious' ? suspicious : tab === 'answer' ? answerLogs : systemLogs;

    const tabs: { key: LogTab; label: string; count: number; color?: string }[] = [
        { key: 'all', label: i18n.t('exams:grading.logTabAll'), count: logs.length },
        { key: 'suspicious', label: i18n.t('exams:grading.logTabSuspicious'), count: suspicious.length, color: 'amber' },
        { key: 'answer', label: i18n.t('exams:grading.logTabAnswer'), count: answerLogs.length },
        { key: 'system', label: i18n.t('exams:grading.logTabSystem'), count: systemLogs.length },
    ];

    // Stats summary
    const startLog = logs.find(l => l.action === 'EXAM_START');
    const submitLog = [...logs].reverse().find(l => l.action === 'EXAM_SUBMIT');
    const duration = startLog && submitLog
        ? Math.round((new Date(submitLog.timestamp).getTime() - new Date(startLog.timestamp).getTime()) / 1000)
        : null;
    const answerChanges = logs.filter(l => l.action === 'ANSWER_CHANGE').length;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
            <button onClick={onToggle} className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                <AlertOctagon size={16} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white flex-1">{i18n.t('exams:grading.logTitle')}</span>
                <span className="text-xs font-semibold text-slate-500">{i18n.t('exams:grading.logEvents', { count: logs.length })}</span>
                {suspicious.length > 0 && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                        {i18n.t('exams:grading.logSuspicious', { count: suspicious.length })}
                    </span>
                )}
            </button>

            {expanded && (
                <div className="border-t border-slate-100 dark:border-slate-800">
                    {/* ── Summary stats ── */}
                    <div className="px-5 py-3 flex flex-wrap gap-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                        {duration !== null && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <Clock size={12} className="text-blue-500" />
                                <span className="text-slate-500">{i18n.t('exams:grading.logDuration')}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {Math.floor(duration / 60)}p {duration % 60}s
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs">
                            <MousePointerClick size={12} className="text-blue-500" />
                            <span className="text-slate-500">{i18n.t('exams:grading.logAnswerChanges')}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{i18n.t('exams:grading.logTimes', { count: answerChanges })}</span>
                        </div>
                        {suspicious.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <AlertTriangle size={12} className="text-amber-500" />
                                <span className="text-slate-500">{i18n.t('exams:grading.logSuspiciousLabel')}</span>
                                <span className="font-bold text-amber-600 dark:text-amber-400">{suspicious.length}</span>
                            </div>
                        )}
                    </div>

                    {/* ── Tab filter ── */}
                    <div className="px-4 pt-3 pb-0 flex gap-1 overflow-x-auto">
                        {tabs.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5
                                    ${tab === t.key
                                        ? t.color === 'amber'
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {t.label}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tab === t.key
                                    ? t.color === 'amber'
                                        ? 'bg-amber-200/60 dark:bg-amber-800/40'
                                        : 'bg-blue-200/60 dark:bg-blue-800/40'
                                    : 'bg-slate-200/60 dark:bg-slate-700/60'
                                    }`}>
                                    {t.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ── Table ── */}
                    <div className="max-h-72 overflow-y-auto mt-2">
                        {filtered.length === 0 ? (
                            <p className="text-center text-sm text-slate-400 py-8">{i18n.t('exams:grading.logNoEvents')}</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80">
                                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="px-4 py-2">{i18n.t('exams:grading.logColAction')}</th>
                                        <th className="px-4 py-2">{i18n.t('exams:grading.logColDetail')}</th>
                                        <th className="px-4 py-2 text-right">{i18n.t('exams:grading.logColTime')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filtered.map((log, i) => {
                                        const isSuspicious = SUSPICIOUS_ACTIONS.has(log.action);
                                        const description = ACTION_DESCRIPTION(log);
                                        return (
                                            <tr key={log.id ?? i} className={isSuspicious ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`shrink-0 ${isSuspicious ? 'text-amber-500' : 'text-slate-400'}`}>
                                                            {ACTION_ICON[log.action] ?? <Clock size={14} />}
                                                        </span>
                                                        <span className={`font-semibold ${isSuspicious ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                            {ACTION_LABEL[log.action] ?? log.action}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                                                    {description ?? '—'}
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-xs text-slate-400 tabular-nums">
                                                    {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
