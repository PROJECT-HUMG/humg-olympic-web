import { useState, useEffect, useCallback } from 'react';
import { examRepository } from '@/features/exams/api';
import { showToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/apiClient';
import i18n from '@/i18n';
import type { ExamDetail } from '@/features/exams/types/exam.types';

const t = (key: string) => i18n.t(key);

export function useExamPreview(examId: number | null) {
    const [exam, setExam] = useState<ExamDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [reopening, setReopening] = useState(false);

    /* ── Fetch exam detail ── */
    useEffect(() => {
        if (!examId) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const detail = await examRepository.getExamDetail(examId);
                if (!cancelled) setExam(detail);
            } catch (err: unknown) {
                const msg = err instanceof ApiError ? err.message : t('common:exam.loadFailed');
                showToast(msg, 'error');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [examId]);

    /* ── Publish ── */
    const handlePublish = useCallback(async () => {
        if (!examId || publishing) return;
        setPublishing(true);
        try {
            const updated = await examRepository.publishExam(examId);
            setExam(updated);
            showToast(t('common:exam.publishSuccess'), 'success');
        } catch (err: unknown) {
            const msg = err instanceof ApiError ? err.message : t('common:exam.publishFailed');
            showToast(msg, 'error');
        } finally {
            setPublishing(false);
        }
    }, [examId, publishing]);

    /* ── Archive ── */
    const handleArchive = useCallback(async () => {
        if (!examId || archiving) return;
        setArchiving(true);
        try {
            const updated = await examRepository.archiveExam(examId);
            setExam(updated);
            showToast(t('common:exam.archiveSuccess'), 'success');
        } catch (err: unknown) {
            const msg = err instanceof ApiError ? err.message : t('common:exam.archiveFailed');
            showToast(msg, 'error');
        } finally {
            setArchiving(false);
        }
    }, [examId, archiving]);

    /* ── Reopen ── */
    const handleReopen = useCallback(async () => {
        if (!examId || reopening) return;
        setReopening(true);
        try {
            const updated = await examRepository.reopenExam(examId);
            setExam(updated);
            showToast(t('common:exam.reopenSuccess'), 'success');
        } catch (err: unknown) {
            const msg = err instanceof ApiError ? err.message : t('common:exam.reopenFailed');
            showToast(msg, 'error');
        } finally {
            setReopening(false);
        }
    }, [examId, reopening]);

    return { exam, loading, publishing, archiving, reopening, handlePublish, handleArchive, handleReopen };
}
