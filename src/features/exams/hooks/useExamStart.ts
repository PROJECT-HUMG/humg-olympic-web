import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { examAttemptRepository } from '@/features/exams/api';
import { showToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/apiClient';
import { getErrorMessage } from '@/lib/api/errorMapping';
import i18n from '@/i18n';
import type { ExamInfo } from '@/features/exams/types/attempt.types';

const t = (key: string) => i18n.t(key);

export function useExamStart(slug: string | undefined, competitionId?: number) {
    const navigate = useNavigate();
    const [exam, setExam] = useState<ExamInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [resuming, setResuming] = useState(false);
    const [viewingResult, setViewingResult] = useState(false);

    /* ── Fetch exam info ── */
    useEffect(() => {
        if (!slug) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const info = await examAttemptRepository.getExamInfoBySlug(slug);
                if (!cancelled) setExam(info);
            } catch (err: unknown) {
                if (err instanceof ApiError && err.code) {
                    showToast(getErrorMessage(err.code, t('common:exam.loadFailed')), 'error');
                } else {
                    showToast(t('common:exam.loadFailed'), 'error');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [slug]);

    /* ── Start exam ── */
    const handleStart = useCallback(async (accessCode?: string) => {
        if (!exam || !slug || starting) return;
        setStarting(true);
        try {
            const response = await examAttemptRepository.startExam(exam.id, {
                competitionId,
                accessCode: accessCode || undefined,
            });
            sessionStorage.setItem(`exam_session_${response.attemptId}`, JSON.stringify(response));
            navigate(`/exams/${slug}/take/${response.attemptId}`);
        } catch (err: unknown) {
            const msg = err instanceof ApiError ? err.message : t('common:exam.startFailed');
            showToast(msg, 'error');
        } finally {
            setStarting(false);
        }
    }, [exam, slug, starting, competitionId, navigate]);

    /* ── Continue in-progress exam ── */
    const handleContinue = useCallback(async (accessCode?: string) => {
        if (!exam || !slug || resuming) return;
        setResuming(true);
        try {
            const response = await examAttemptRepository.startExam(exam.id, {
                competitionId,
                accessCode: accessCode || undefined,
            });
            sessionStorage.setItem(`exam_session_${response.attemptId}`, JSON.stringify(response));
            navigate(`/exams/${slug}/take/${response.attemptId}`);
        } catch (err: unknown) {
            const msg = err instanceof ApiError ? err.message : t('common:exam.continueFailed');
            showToast(msg, 'error');
        } finally {
            setResuming(false);
        }
    }, [exam, slug, resuming, competitionId, navigate]);

    /* ── View latest result ── */
    const handleViewResult = useCallback(async () => {
        if (!exam || !slug || viewingResult) return;
        setViewingResult(true);
        try {
            const history = await examAttemptRepository.getExamAttempts(exam.id, 1, 1);
            if (history.data.length > 0) navigate(`/exams/${slug}/result/${history.data[0].attemptId}`);
            else showToast(t('common:exam.notFound'), 'error');
        } catch {
            showToast(t('common:exam.loadFailed'), 'error');
        } finally {
            setViewingResult(false);
        }
    }, [exam, slug, viewingResult, navigate]);

    return { exam, loading, starting, resuming, viewingResult, handleStart, handleContinue, handleViewResult };
}
