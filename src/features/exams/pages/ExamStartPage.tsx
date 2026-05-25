import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, Clock, Target, BookOpen, PlayCircle,
    Loader2, AlertTriangle, CalendarClock, TimerOff, Eye, RotateCcw, Lock,
    PartyPopper, GraduationCap, Camera, ClockAlert, Layers
} from 'lucide-react';
import { ExamStartSkeleton } from '@/features/exams/components/ExamSkeletons';
import { ShareButton } from '@/components/ui/ShareButton';
import { useExamStart } from '@/features/exams/hooks/useExamStart';
import i18n from '@/i18n';

export const ExamStartPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const competitionId = searchParams.get('competitionId') ? Number(searchParams.get('competitionId')) : undefined;

    const { exam, loading, starting, resuming, viewingResult, handleStart, handleContinue, handleViewResult } = useExamStart(slug, competitionId);
    const [accessCode, setAccessCode] = useState('');

    if (loading) return <ExamStartSkeleton />;

    if (!exam) {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full mx-4">
                    <AlertTriangle size={40} className="mx-auto text-slate-400 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('exams:start.notFound')}</h2>
                    <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center justify-center gap-2 mx-auto mt-4">
                        <ArrowLeft size={16} /> {i18n.t('exams:start.goBack')}
                    </button>
                </div>
            </div>
        );
    }

    const now = new Date();
    const notStartedYet = exam.startDatetime ? new Date(exam.startDatetime) > now : false;
    const alreadyEnded = exam.endDatetime ? new Date(exam.endDatetime) < now : false;
    const attemptInProgress = exam.hasAttempt && exam.attemptStatus === 'IN_PROGRESS';
    const attemptCompleted = exam.hasAttempt && !attemptInProgress;
    const canStart = !exam.hasAttempt && !notStartedYet && !alreadyEnded && (!exam.hasAccessCode || accessCode.length > 0);

    return (
        <div className="min-h-screen font-sans">
            <div className="container mx-auto px-4 md:px-6 max-w-2xl pt-24 pb-20">
                <button onClick={() => navigate(-1)} className="mb-6 group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors w-fit">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> {i18n.t('exams:start.goBack')}
                </button>

                {/* ── Main Card ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 md:p-8">
                        {/* ── Title ── */}
                        <div className="text-center mb-6">
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                                {exam.title}
                            </h1>
                            {exam.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                    {exam.description}
                                </p>
                            )}
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {exam.subjectColor && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: exam.subjectColor }} />}
                                    {exam.subjectName}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {exam.categoryName}
                                </span>
                            </div>
                        </div>

                        {/* ── Info Rows ── */}
                        <div className="border-t border-slate-100 dark:border-slate-800">
                            {[
                                { icon: Clock, label: i18n.t('exams:start.duration'), value: i18n.t('exams:start.minutes', { count: exam.duration }) },
                                ...(exam.startDatetime ? [{ icon: CalendarClock, label: i18n.t('exams:start.startTime'), value: new Date(exam.startDatetime).toLocaleString('vi-VN') }] : []),
                                ...(exam.endDatetime ? [{ icon: TimerOff, label: i18n.t('exams:start.deadline'), value: new Date(exam.endDatetime).toLocaleString('vi-VN') }] : []),
                                { icon: BookOpen, label: i18n.t('exams:start.questionCount'), value: `${exam.questionCount}` },
                                { icon: Layers, label: i18n.t('exams:start.examType'), value: exam.categoryName },
                                { icon: Target, label: i18n.t('exams:start.totalPoints'), value: i18n.t('exams:start.pointsFormat', { total: exam.totalPoints, pass: exam.passingScore }) },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between py-3.5 px-1 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <row.icon size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                        <span>{row.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-right">{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* ── Time Warning ── */}
                        {notStartedYet && (
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400">
                                <Clock size={16} className="shrink-0 animate-pulse text-slate-400" /> {i18n.t('exams:start.notStartedYet')}
                            </div>
                        )}
                        {alreadyEnded && (
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400">
                                <TimerOff size={16} className="shrink-0 text-slate-400" /> {i18n.t('exams:start.alreadyEnded')}
                            </div>
                        )}
                        {attemptInProgress && (
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-slate-200 dark:border-slate-700 text-sm font-medium text-amber-700 dark:text-amber-400">
                                <Clock size={16} className="shrink-0 animate-pulse" /> {i18n.t('exams:start.inProgress')}
                            </div>
                        )}

                        {/* ── Access Code ── */}
                        {exam.hasAccessCode && !attemptCompleted && (
                            <div className="mt-5">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <Lock size={14} /> {i18n.t('exams:start.accessCode')}
                                </label>
                                <input
                                    type="text"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value.trim())}
                                    placeholder={i18n.t('exams:start.accessCodePlaceholder')}
                                    maxLength={20}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700
                                        bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm
                                        placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                                        transition-colors font-mono tracking-wider"
                                />
                            </div>
                        )}

                        {/* ── Grading Mode + Paper Submission Info ── */}
                        {exam.gradingMode === 'MANUAL' && (
                            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400">
                                <GraduationCap size={16} className="shrink-0 mt-0.5 text-slate-400" />
                                <span>{i18n.t('exams:start.manualGrading')}</span>
                            </div>
                        )}
                        {exam.requirePaperSubmission && (
                            <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400">
                                <Camera size={16} className="shrink-0 mt-0.5 text-slate-400" />
                                <span>{i18n.t('exams:start.requirePaper')}</span>
                            </div>
                        )}
                        {exam.attemptStatus === 'PENDING_GRADING' && (
                            <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-amber-600 dark:text-amber-400">
                                <ClockAlert size={16} className="shrink-0 mt-0.5" />
                                <span>{i18n.t('exams:start.pendingGrading')}</span>
                            </div>
                        )}

                        {/* ── Action Button ── */}
                        <div className="mt-6">
                            {attemptInProgress ? (
                                <button
                                    onClick={() => handleContinue(accessCode)}
                                    disabled={resuming}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {resuming ? <><Loader2 size={18} className="animate-spin" /> {i18n.t('exams:start.loading')}</> : <><RotateCcw size={18} /> {i18n.t('exams:start.continue')}</>}
                                </button>
                            ) : attemptCompleted ? (
                                <button
                                    onClick={handleViewResult}
                                    disabled={viewingResult}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {viewingResult ? <><Loader2 size={18} className="animate-spin" /> {i18n.t('exams:start.loading')}</> : <><Eye size={18} /> {exam.attemptStatus === 'PENDING_GRADING' ? i18n.t('exams:start.viewStatus') : i18n.t('exams:start.viewResult')}</>}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleStart(accessCode)}
                                    disabled={starting || !canStart}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                                >
                                    {starting ? <><Loader2 size={18} className="animate-spin" /> {i18n.t('exams:start.preparing')}</> : <><PlayCircle size={18} /> {i18n.t('exams:start.startExam')}</>}
                                </button>
                            )}

                            {attemptCompleted && (
                                <p className="text-center text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-2 mt-3">
                                    <PartyPopper size={14} /> {i18n.t('exams:start.completed')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Footer: Share ── */}
                <div className="flex justify-center mt-5">
                    <ShareButton title={exam.title} variant="full" />
                </div>
            </div>
        </div>
    );
};