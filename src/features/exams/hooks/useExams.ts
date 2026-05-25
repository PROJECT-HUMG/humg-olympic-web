import { useState, useEffect, useCallback, useMemo } from 'react';
import { examRepository } from '@/features/exams/api';
import type {
    ExamSummary, ExamStatus, ExamCategory,
} from '@/features/exams/types/exam.types';
import type { Subject } from '@/features/competitions/types/competition.types';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';

const LIMIT = 12;

export function useExams() {
    const [exams, setExams] = useState<ExamSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeSubjectId, setActiveSubjectId] = useState<number | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
    const [activeStatus, setActiveStatus] = useState<ExamStatus | null>(null);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [categories, setCategories] = useState<ExamCategory[]>([]);
    const [lookupsLoaded, setLookupsLoaded] = useState(false);

    // Load lookups
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [s, c] = await Promise.all([
                    examRepository.getSubjects(),
                    examRepository.getCategories(),
                ]);
                if (!cancelled) {
                    setSubjects(s);
                    setCategories(c);
                    setLookupsLoaded(true);
                }
            } catch (err) {
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Fetch exams
    const fetchExams = useCallback(async () => {
        setLoading(true);
        try {
            const res = await examRepository.getExams({
                page,
                limit: LIMIT,
                search: searchQuery || undefined,
                subjectId: activeSubjectId ?? undefined,
                categoryId: activeCategoryId ?? undefined,
                status: activeStatus ?? undefined,
            });
            setExams(res.data);
            setTotal(res.total);
        } catch (err) {
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, activeSubjectId, activeCategoryId, activeStatus]);

    useEffect(() => {
        const timer = setTimeout(fetchExams, searchQuery ? 300 : 0);
        return () => clearTimeout(timer);
    }, [fetchExams]);

    useEffect(() => { setPage(1); }, [searchQuery, activeSubjectId, activeCategoryId, activeStatus]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / LIMIT)), [total]);

    // ─── Actions ─────────────────────────────────────────

    const deleteExam = useCallback(async (id: number) => {
        try {
            await examRepository.deleteExam(id);
            showToast(i18n.t('exams:deleteSuccess'), 'success');
            setExams(prev => prev.filter(e => e.id !== id));
            setTotal(prev => Math.max(0, prev - 1));
        } catch { showToast(i18n.t('exams:deleteFailed'), 'error'); }
    }, []);

    const publishExam = useCallback(async (id: number) => {
        try {
            await examRepository.publishExam(id);
            showToast(i18n.t('exams:publishSuccess'), 'success');
            setExams(prev => prev.map(e => e.id === id ? { ...e, status: 'PUBLISHED' as ExamStatus } : e));
        } catch { showToast(i18n.t('exams:publishFailed'), 'error'); }
    }, []);

    const archiveExam = useCallback(async (id: number) => {
        try {
            await examRepository.archiveExam(id);
            showToast(i18n.t('exams:archiveSuccess'), 'success');
            setExams(prev => prev.map(e => e.id === id ? { ...e, status: 'ARCHIVED' as ExamStatus } : e));
        } catch { showToast(i18n.t('exams:archiveFailed'), 'error'); }
    }, []);

    const reopenExam = useCallback(async (id: number) => {
        try {
            await examRepository.reopenExam(id);
            showToast(i18n.t('exams:reopenSuccess'), 'success');
            setExams(prev => prev.map(e => e.id === id ? { ...e, status: 'DRAFT' as ExamStatus } : e));
        } catch { showToast(i18n.t('exams:reopenFailed'), 'error'); }
    }, []);

    return {
        exams, loading, page, setPage, totalPages, total,
        searchQuery, setSearch: setSearchQuery,
        activeSubjectId, setSubject: setActiveSubjectId,
        activeCategoryId, setCategory: setActiveCategoryId,
        activeStatus, setStatus: setActiveStatus,
        subjects, categories, lookupsLoaded,
        deleteExam, publishExam, archiveExam, reopenExam,
        refresh: fetchExams,
    };
}
