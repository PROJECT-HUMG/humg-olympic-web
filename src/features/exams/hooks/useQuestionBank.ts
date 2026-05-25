import { useState, useEffect, useCallback, useMemo } from 'react';
import { examRepository } from '@/features/exams/api';
import type {
    Question, QuestionType,
} from '@/features/exams/types/exam.types';
import type { Subject } from '@/features/competitions/types/competition.types';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';

const LIMIT = 12;

export function useQuestionBank() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSubjectId, setActiveSubjectId] = useState<number | null>(null);
    const [activeType, setActiveType] = useState<QuestionType | null>(null);

    // Lookups
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [lookupsLoaded, setLookupsLoaded] = useState(false);

    // Load subjects
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const s = await examRepository.getSubjects();
                if (!cancelled) {
                    setSubjects(s);
                    setLookupsLoaded(true);
                }
            } catch (err) {
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Fetch questions
    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await examRepository.getQuestions({
                page,
                limit: LIMIT,
                search: searchQuery || undefined,
                subjectId: activeSubjectId ?? undefined,
                type: activeType ?? undefined,
            });
            setQuestions(res.data);
            setTotal(res.total);
        } catch (err) {
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, activeSubjectId, activeType]);

    // Debounced fetch
    useEffect(() => {
        const timer = setTimeout(fetchQuestions, searchQuery ? 300 : 0);
        return () => clearTimeout(timer);
    }, [fetchQuestions]);

    // Reset page on filter change
    useEffect(() => { setPage(1); }, [searchQuery, activeSubjectId, activeType]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / LIMIT)), [total]);

    // ─── Actions ─────────────────────────────────────────

    // Silent refresh without loading skeleton
    const silentRefresh = useCallback(async () => {
        try {
            const res = await examRepository.getQuestions({
                page,
                limit: LIMIT,
                search: searchQuery || undefined,
                subjectId: activeSubjectId ?? undefined,
                type: activeType ?? undefined,
            });
            setQuestions(res.data);
            setTotal(res.total);
        } catch { /* ignore */ }
    }, [page, searchQuery, activeSubjectId, activeType]);

    const deleteQuestion = useCallback(async (id: number) => {
        try {
            // Optimistic removal
            setQuestions(prev => prev.filter(q => q.id !== id));
            setTotal(prev => Math.max(0, prev - 1));
            await examRepository.deleteQuestion(id);
            showToast(i18n.t('exams:questionDeleteSuccess'), 'success');
        } catch {
            showToast(i18n.t('exams:questionDeleteFailed'), 'error');
            silentRefresh(); // Revert on failure
        }
    }, [silentRefresh]);

    return {
        questions, loading, page, setPage, totalPages, total,
        searchQuery, setSearch: setSearchQuery,
        activeSubjectId, setSubject: setActiveSubjectId,
        activeType, setType: setActiveType,
        subjects, lookupsLoaded,
        deleteQuestion,
        refresh: silentRefresh,
    };
}
