import { api, authenticatedFetch } from '@/lib/api/apiClient';
import { API_BASE_URL } from '@/lib/api/apiConfig';
import type { ExamRepository } from './ExamRepository';
import type {
    ExamSummary, ExamDetail, ExamQueryParams,
    CreateExamRequest, UpdateExamRequest,
    Question, QuestionQueryParams,
    CreateQuestionRequest, UpdateQuestionRequest,
    DocxImportResponse, ExamCategory, PagedResponse,
} from '@/features/exams/types/exam.types';
import type { Subject } from '@/features/competitions/types/competition.types';

export class ApiExamRepository implements ExamRepository {
    // ─── Question Bank ───────────────────────────────────

    async getQuestions(params: QuestionQueryParams): Promise<PagedResponse<Question>> {
        const query = new URLSearchParams();
        if (params.page) query.set('page', String(params.page));
        if (params.limit) query.set('limit', String(params.limit));
        if (params.search) query.set('search', params.search);
        if (params.subjectId) query.set('subjectId', String(params.subjectId));
        if (params.type) query.set('type', params.type);
        if (params.sortBy) query.set('sortBy', params.sortBy);
        if (params.sortOrder) query.set('sortOrder', params.sortOrder);
        return api.get<PagedResponse<Question>>(`/questions?${query}`);
    }

    async createQuestion(data: CreateQuestionRequest): Promise<Question> {
        return api.post<Question>('/questions', data);
    }

    async updateQuestion(id: number, data: UpdateQuestionRequest): Promise<Question> {
        return api.put<Question>(`/questions/${id}`, data);
    }

    async deleteQuestion(id: number): Promise<void> {
        return api.delete(`/questions/${id}`);
    }

    async importDocx(file: File): Promise<DocxImportResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await authenticatedFetch(`${API_BASE_URL}/questions/import-docx`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Import failed');
        }
        return response.json();
    }

    // ─── Exams ───────────────────────────────────────────

    async getPublicExams(params: ExamQueryParams): Promise<PagedResponse<ExamSummary>> {
        const query = new URLSearchParams();
        if (params.page) query.set('page', String(params.page));
        if (params.limit) query.set('limit', String(params.limit));
        if (params.search) query.set('search', params.search);
        if (params.subjectId) query.set('subjectId', String(params.subjectId));
        if (params.categoryId) query.set('categoryId', String(params.categoryId));
        return api.get<PagedResponse<ExamSummary>>(`/exams/public?${query}`);
    }

    async getExams(params: ExamQueryParams): Promise<PagedResponse<ExamSummary>> {
        const query = new URLSearchParams();
        if (params.page) query.set('page', String(params.page));
        if (params.limit) query.set('limit', String(params.limit));
        if (params.search) query.set('search', params.search);
        if (params.subjectId) query.set('subjectId', String(params.subjectId));
        if (params.categoryId) query.set('categoryId', String(params.categoryId));
        if (params.status) query.set('status', params.status);
        if (params.sortBy) query.set('sortBy', params.sortBy);
        if (params.sortOrder) query.set('sortOrder', params.sortOrder);
        return api.get<PagedResponse<ExamSummary>>(`/exams?${query}`);
    }

    async getExamDetail(id: number): Promise<ExamDetail> {
        return api.get<ExamDetail>(`/exams/${id}`);
    }

    async createExam(data: CreateExamRequest): Promise<ExamDetail> {
        return api.post<ExamDetail>('/exams', data);
    }

    async updateExam(id: number, data: UpdateExamRequest): Promise<ExamDetail> {
        return api.put<ExamDetail>(`/exams/${id}`, data);
    }

    async deleteExam(id: number): Promise<void> {
        return api.delete(`/exams/${id}`);
    }

    async publishExam(id: number): Promise<ExamDetail> {
        return api.put<ExamDetail>(`/exams/${id}/publish`, {});
    }

    async archiveExam(id: number): Promise<ExamDetail> {
        return api.put<ExamDetail>(`/exams/${id}/archive`, {});
    }

    async reopenExam(id: number): Promise<ExamDetail> {
        return api.put<ExamDetail>(`/exams/${id}/reopen`, {});
    }

    // ─── Lookups ─────────────────────────────────────────

    async getCategories(): Promise<ExamCategory[]> {
        return api.get<ExamCategory[]>('/exams/categories');
    }

    async getSubjects(): Promise<Subject[]> {
        return api.get<Subject[]>('/competitions/subjects');
    }
}
