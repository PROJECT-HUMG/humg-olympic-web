import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, CheckCircle, XCircle, Clock, TrendingUp,
    ChevronLeft, ChevronRight, BarChart3, Loader2,
} from 'lucide-react';
import { examAttemptRepository } from '@/features/exams/api';
import type { AttemptHistoryResponse } from '@/features/exams/types/attempt.types';
import i18n from '@/i18n';

// ─── Skeleton ────────────────────────────────────────
export const ExamHistorySkeleton = () => (
    <div className="animate-pulse space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            ))}
        </div>
        {/* List rows */}
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        ))}
    </div>
);

interface Props {
    userId: number;
}

const PAGE_SIZE = 10;

export const ExamHistoryTab = ({ userId }: Props) => {
    const navigate = useNavigate();
    const [data, setData] = useState<AttemptHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await examAttemptRepository.getUserAttemptHistory(userId, page, PAGE_SIZE);
                if (!cancelled) setData(res);
            } catch { /* silently fail */ }
            finally { if (!cancelled) setLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [userId, page]);

    const stats = useMemo(() => {
        if (!data) return null;
        const all = data.data;
        const completed = all.filter(a => a.status === 'GRADED' || a.status === 'SUBMITTED');
        const passed = completed.filter(a => a.passed);
        const avgScore = completed.length > 0
            ? Math.round(completed.reduce((s, a) => s + (a.score / a.totalPoints) * 100, 0) / completed.length)
            : 0;
        return {
            total: data.total,
            completed: completed.length,
            passed: passed.length,
            avgScore,
        };
    }, [data]);

    const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

    if (loading && !data) return <ExamHistorySkeleton />;

    if (!data || data.data.length === 0) {
        return (
            <div className="text-center py-16">
                <BookOpen size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-base font-medium text-slate-500 dark:text-slate-400">{i18n.t('profile:examHistory.noHistory')}</p>
                <p className="text-sm text-slate-400 mt-1">{i18n.t('profile:examHistory.noHistoryHint')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: BookOpen, label: i18n.t('profile:examHistory.totalAttempts'), value: stats.total, color: 'text-blue-500' },
                        { icon: CheckCircle, label: i18n.t('profile:examHistory.completed'), value: stats.completed, color: 'text-emerald-500' },
                        { icon: TrendingUp, label: i18n.t('profile:examHistory.passed'), value: stats.passed, color: 'text-purple-500' },
                        { icon: BarChart3, label: i18n.t('profile:examHistory.avgScore'), value: `${stats.avgScore}%`, color: 'text-amber-500' },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            <s.icon size={20} className={s.color} />
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Attempt list */}
            <div className="space-y-2">
                {data.data.map((attempt) => {
                    const isInProgress = attempt.status === 'IN_PROGRESS';

                    const content = (
                        <>
                            {/* Status icon */}
                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                                ${isInProgress
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                                    : attempt.passed
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
                                        : (attempt.status === 'GRADED' || attempt.status === 'SUBMITTED')
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'
                                }`}
                            >
                                {isInProgress ? <Loader2 size={20} className="animate-spin" /> :
                                    attempt.passed ? <CheckCircle size={20} /> :
                                        (attempt.status === 'GRADED' || attempt.status === 'SUBMITTED') ? <XCircle size={20} /> :
                                            <Clock size={20} />
                                }
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate transition-colors ${isInProgress
                                    ? 'text-slate-500 dark:text-slate-400'
                                    : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                    }`}>
                                    {attempt.examTitle}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString('vi-VN', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                    })}
                                </p>
                            </div>

                            {/* Score / Status */}
                            <div className="text-right shrink-0">
                                {isInProgress ? (
                                    <p className="text-sm font-semibold text-blue-500">{i18n.t('profile:examHistory.inProgress')}</p>
                                ) : (
                                    <>
                                        <p className={`text-sm font-bold ${attempt.passed
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : (attempt.status === 'GRADED' || attempt.status === 'SUBMITTED')
                                                ? 'text-red-500'
                                                : 'text-amber-500'
                                            }`}>
                                            {attempt.score}/{attempt.totalPoints}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {attempt.passed ? i18n.t('profile:examHistory.statusPassed') : (attempt.status === 'GRADED' || attempt.status === 'SUBMITTED') ? i18n.t('profile:examHistory.statusFailed') : i18n.t('profile:examHistory.statusPending')}
                                        </p>
                                    </>
                                )}
                            </div>
                        </>
                    );

                    if (isInProgress) {
                        return (
                            <div
                                key={attempt.attemptId}
                                className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 opacity-75 cursor-default"
                            >
                                {content}
                            </div>
                        );
                    }

                    return (
                        <button
                            key={attempt.attemptId}
                            onClick={() => navigate(`/exams/${attempt.slug}/result/${attempt.attemptId}`)}
                            className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800
                                hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors text-left group"
                        >
                            {content}
                        </button>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40
                            hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Trang {page}/{totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40
                            hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};
