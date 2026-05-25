import { useState, useEffect, useCallback, useRef } from 'react';
import { examRepository } from '@/features/exams/api';
import type { ExamSummary, ExamCategory } from '@/features/exams/types/exam.types';
import type { Subject } from '@/features/competitions/types/competition.types';

interface UsePublicExamsParams {
    page: number;
    search: string;
    subjectId: number | null;
    categoryId: number | null;
}

export const usePublicExams = ({ page, search, subjectId, categoryId }: UsePublicExamsParams) => {
    const [exams, setExams] = useState<ExamSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [categories, setCategories] = useState<ExamCategory[]>([]);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    // Fetch subjects + categories once
    useEffect(() => {
        const load = async () => {
            const [s, c] = await Promise.all([
                examRepository.getSubjects(),
                examRepository.getCategories(),
            ]);
            if (mountedRef.current) {
                setSubjects(s);
                setCategories(c);
            }
        };
        load();
    }, []);

    // Fetch exams on param change
    useEffect(() => {
        let cancelled = false;
        const fetchExams = async () => {
            setLoading(true);
            try {
                const result = await examRepository.getPublicExams({
                    page,
                    limit: 12,
                    search: search || undefined,
                    subjectId: subjectId ?? undefined,
                    categoryId: categoryId ?? undefined,
                });
                if (!cancelled && mountedRef.current) {
                    setExams(result.data);
                    setTotal(result.total);
                    setTotalPages(Math.ceil(result.total / result.limit));
                }
            } catch {
                if (!cancelled && mountedRef.current) {
                    setExams([]);
                    setTotal(0);
                    setTotalPages(0);
                }
            } finally {
                if (!cancelled && mountedRef.current) setLoading(false);
            }
        };
        fetchExams();
        return () => { cancelled = true; };
    }, [page, search, subjectId, categoryId]);

    const refresh = useCallback(() => {
        setLoading(true);
        examRepository.getPublicExams({
            page, limit: 12,
            search: search || undefined,
            subjectId: subjectId ?? undefined,
            categoryId: categoryId ?? undefined,
        }).then(result => {
            if (mountedRef.current) {
                setExams(result.data);
                setTotal(result.total);
                setTotalPages(Math.ceil(result.total / result.limit));
            }
        }).finally(() => {
            if (mountedRef.current) setLoading(false);
        });
    }, [page, search, subjectId, categoryId]);

    return { exams, loading, totalPages, total, subjects, categories, refresh };
};
