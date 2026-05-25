import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { examAttemptRepository } from '@/features/exams/api';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { ApiError } from '@/lib/api/apiClient';
import type { ExamResult } from '@/features/exams/types/attempt.types';

/** Error codes that require evidence upload before viewing results */
const EVIDENCE_ERROR_CODES = new Set(['EVIDENCE_REQUIRED']);

/** Error codes that mean user has no permission to view this result yet */
const PERMISSION_ERROR_CODES = new Set([
    'FORBIDDEN',
    'ACCESS_DENIED',
    'ATTEMPT_IN_PROGRESS',
]);

/** Error codes where the evidence window has expired */
const EXPIRED_ERROR_CODES = new Set(['EVIDENCE_WINDOW_EXPIRED']);

export type ExamResultErrorState =
    | { type: 'evidence_required' }
    | { type: 'evidence_expired' }
    | { type: 'forbidden'; message: string }
    | { type: 'generic'; message: string }
    | null;

export function useExamResult(attemptId: number | null) {
    const navigate = useNavigate();
    const [result, setResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorState, setErrorState] = useState<ExamResultErrorState>(null);

    const classifyError = useCallback((err: unknown) => {
        const apiErr = err instanceof ApiError ? err : null;
        const code = apiErr?.code ?? '';

        if (EVIDENCE_ERROR_CODES.has(code)) {
            setErrorState({ type: 'evidence_required' });
        } else if (EXPIRED_ERROR_CODES.has(code)) {
            setErrorState({ type: 'evidence_expired' });
        } else if (PERMISSION_ERROR_CODES.has(code)) {
            showToast(apiErr?.message ?? i18n.t('exams:noPermissionView'), 'error');
            navigate(-1);
        } else {
            setErrorState({
                type: 'generic',
                message: apiErr?.message ?? i18n.t('exams:loadResultFailed'),
            });
        }
    }, [navigate]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!attemptId) return;
            setLoading(true);
            setErrorState(null);

            try {
                const data = await examAttemptRepository.getAttemptResult(attemptId);
                if (!cancelled) setResult(data);
            } catch (err: unknown) {
                if (!cancelled) classifyError(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [attemptId, classifyError]);

    const submitEvidence = useCallback(async (files: File[]) => {
        if (!attemptId || files.length === 0) return;
        await examAttemptRepository.submitPaperEvidence(attemptId, files);
        setErrorState(null);
        setLoading(true);
        try {
            const data = await examAttemptRepository.getAttemptResult(attemptId);
            setResult(data);
        } finally {
            setLoading(false);
        }
    }, [attemptId]);

    const reload = useCallback(async () => {
        if (!attemptId) return;
        setLoading(true);
        try {
            const data = await examAttemptRepository.getAttemptResult(attemptId);
            setResult(data);
        } catch {
            showToast(i18n.t('exams:reloadFailed'), 'error');
        } finally {
            setLoading(false);
        }
    }, [attemptId]);

    return { result, loading, errorState, submitEvidence, reload, setResult };
}
