import { useState, useEffect, useCallback } from 'react';
import { examAttemptRepository } from '@/features/exams/api';
import { showToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/apiClient';
import i18n from '@/i18n';
import type { ExamResult, AnswerGrade, ActionLogEntry, PaperSubmission } from '@/features/exams/types/attempt.types';

const t = (key: string) => i18n.t(key);

export function useGradingDetail(attemptId: number | null) {
    const [result, setResult] = useState<ExamResult | null>(null);
    const [evidences, setEvidences] = useState<PaperSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [actionLogs, setActionLogs] = useState<ActionLogEntry[]>([]);

    const [grades, setGrades] = useState<Record<number, { points: string; comment: string }>>({});
    const [overallComment, setOverallComment] = useState('');

    /* ── Fetch attempt detail + action logs ── */
    useEffect(() => {
        if (!attemptId) return;
        let cancelled = false;
        setLoading(true);

        examAttemptRepository.getAttemptDetail(attemptId)
            .then(({ result: examResult, evidences: files }) => {
                if (!cancelled) {
                    setResult(examResult);
                    setEvidences(files ?? []);
                    const initial: Record<number, { points: string; comment: string }> = {};
                    examResult.details.forEach(d => {
                        if (d.isCorrect === null) {
                            initial[d.questionId] = {
                                points: d.manualPoints != null ? String(d.manualPoints) : '',
                                comment: d.instructorComment ?? '',
                            };
                        }
                    });
                    setGrades(initial);
                }
            })
            .catch((err: unknown) => {
                const msg = err instanceof ApiError ? err.message : t('common:exam.loadDetailFailed');
                showToast(msg, 'error');
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        // Fetch action logs (non-blocking)
        examAttemptRepository.getAttemptActionLogs(attemptId)
            .then(data => { if (!cancelled) setActionLogs(data.logs ?? []); })
            .catch(() => { /* silently ignore */ });

        return () => { cancelled = true; };
    }, [attemptId]);

    /* ── Update a grade field ── */
    const updateGrade = useCallback((questionId: number, field: 'points' | 'comment', value: string) => {
        setGrades(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], [field]: value },
        }));
    }, []);

    /* ── Submit grades ── */
    const handleSubmitGrades = useCallback(async (): Promise<boolean> => {
        if (!attemptId || !result || submitting) return false;

        const subjectiveDetails = result.details.filter(d => d.isCorrect === null);
        const missingPoints = subjectiveDetails.some(d => {
            const g = grades[d.questionId];
            return !g || g.points === '' || isNaN(Number(g.points));
        });
        if (missingPoints) {
            showToast(t('common:exam.enterAllPoints'), 'error');
            return false;
        }

        const isRegrade = result.appealStatus === 'APPROVED' && result.status === 'GRADED';

        setSubmitting(true);
        try {
            const answerGrades: AnswerGrade[] = subjectiveDetails.map(d => {
                const rawPoints = Number(grades[d.questionId].points);
                const clampedPoints = Math.min(Math.max(rawPoints, 0), d.questionPoints || Infinity);
                return {
                    answerId: d.questionId,
                    points: clampedPoints,
                    comment: grades[d.questionId].comment || null,
                };
            });

            const gradePayload = { comment: overallComment || null, answerGrades };
            const updated = isRegrade
                ? await examAttemptRepository.regradeAttempt(attemptId, gradePayload)
                : await examAttemptRepository.gradeAttempt(attemptId, gradePayload);
            setResult(updated);
            showToast(isRegrade ? t('common:exam.regradeSuccess') : t('common:exam.gradeSuccess'), 'success');
            return true;
        } catch (err: unknown) {
            const fallback = result.appealStatus === 'APPROVED' && result.status === 'GRADED'
                ? t('common:exam.regradeFailed') : t('common:exam.gradeFailed');
            const msg = err instanceof ApiError ? err.message : fallback;
            showToast(msg, 'error');
            return false;
        } finally {
            setSubmitting(false);
        }
    }, [attemptId, result, submitting, grades, overallComment]);

    return {
        result, evidences, loading, submitting, actionLogs,
        grades, overallComment, setOverallComment,
        updateGrade, handleSubmitGrades,
    };
}
