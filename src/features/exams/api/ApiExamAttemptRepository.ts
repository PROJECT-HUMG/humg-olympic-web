import { api, authenticatedFetch } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api/apiConfig';
import type { ExamAttemptRepository } from './ExamAttemptRepository';
import type {
    ExamInfo, StartExamResponse, SubmitExamRequest, ExamResult, SubmitConfirmationResponse,
    AttemptHistoryResponse, LeaderboardResponse,
    AttemptActionLog, GradeAppealRequest, GradeAppealResponse, ReviewAppealRequest, PaperSubmission,
    PendingSubmission, InstructorGradeRequest, SubmissionDetailResponse,
} from '../types/attempt.types';
import type { PagedResponse } from '../types/exam.types';

export class ApiExamAttemptRepository implements ExamAttemptRepository {
    async getExamInfo(examId: number): Promise<ExamInfo> {
        return api.get<ExamInfo>(`/exams/${examId}/info`);
    }

    async getExamInfoBySlug(slug: string): Promise<ExamInfo> {
        return api.get<ExamInfo>(`/exams/slug/${slug}/info`);
    }

    async startExam(examId: number, options?: { competitionId?: number; accessCode?: string }): Promise<StartExamResponse> {
        return api.post<StartExamResponse>(`/exams/${examId}/start`, {
            competitionId: options?.competitionId ?? null,
            accessCode: options?.accessCode ?? null,
        });
    }

    async submitExam(attemptId: number, data: SubmitExamRequest): Promise<SubmitConfirmationResponse> {
        return api.post<SubmitConfirmationResponse>(`/exams/attempts/${attemptId}/submit`, data);
    }

    async getAttemptResult(attemptId: number): Promise<ExamResult> {
        return api.get<ExamResult>(`/exams/attempts/${attemptId}`);
    }

    async getExamAttempts(examId: number, page = 1, limit = 10): Promise<AttemptHistoryResponse> {
        const query = new URLSearchParams();
        query.set('page', String(page));
        query.set('limit', String(limit));
        return api.get<AttemptHistoryResponse>(`/exams/${examId}/attempts?${query}`);
    }

    async getUserAttemptHistory(userId: number, page = 1, limit = 10): Promise<AttemptHistoryResponse> {
        const query = new URLSearchParams();
        query.set('page', String(page));
        query.set('limit', String(limit));
        return api.get<AttemptHistoryResponse>(`/users/${userId}/exam-history?${query}`);
    }

    async getLeaderboard(examId: number, competitionId?: number, limit = 50): Promise<LeaderboardResponse> {
        const query = new URLSearchParams();
        if (competitionId) query.set('competitionId', String(competitionId));
        query.set('limit', String(limit));
        return api.get<LeaderboardResponse>(`/exams/${examId}/leaderboard?${query}`);
    }

    async getAttemptActionLogs(attemptId: number): Promise<AttemptActionLog> {
        return api.get<AttemptActionLog>(`/exams/attempts/${attemptId}/action-logs`);
    }

    async submitGradeAppeal(data: GradeAppealRequest): Promise<GradeAppealResponse> {
        return api.post<GradeAppealResponse>(`/exams/attempts/${data.attemptId}/appeal`, data);
    }

    async getGradeAppeals(attemptId: number): Promise<GradeAppealResponse[]> {
        return api.get<GradeAppealResponse[]>(`/exams/attempts/${attemptId}/appeals`);
    }

    async getExamAppeals(examId: number, status?: string, page = 1, limit = 10): Promise<PagedResponse<GradeAppealResponse>> {
        const query = new URLSearchParams();
        if (status) query.set('status', status);
        query.set('page', String(page));
        query.set('limit', String(limit));
        return api.get<PagedResponse<GradeAppealResponse>>(`/exams/${examId}/appeals?${query}`);
    }

    async reviewAppeal(appealId: number, data: ReviewAppealRequest): Promise<GradeAppealResponse> {
        return api.put<GradeAppealResponse>(`/exams/attempts/appeals/${appealId}/review`, data);
    }

    async submitPaperEvidence(attemptId: number, files: File[]): Promise<PaperSubmission[]> {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        const res = await authenticatedFetch(`${API_BASE_URL}/exams/attempts/${attemptId}/paper-evidence`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    }

    // ─── Instructor Grading ──────────────────────────────
    async getSubmissions(examId: number, status?: string, page = 1, limit = 10): Promise<PagedResponse<PendingSubmission>> {
        const query = new URLSearchParams();
        if (status) query.set('status', status);
        query.set('page', String(page));
        query.set('limit', String(limit));
        return api.get<PagedResponse<PendingSubmission>>(`/exams/${examId}/submissions?${query}`);
    }

    async getAttemptDetail(attemptId: number): Promise<SubmissionDetailResponse> {
        return api.get<SubmissionDetailResponse>(`/exams/attempts/${attemptId}/detail`);
    }

    async gradeAttempt(attemptId: number, data: InstructorGradeRequest): Promise<ExamResult> {
        return api.put<ExamResult>(`/exams/attempts/${attemptId}/grade`, data);
    }

    async regradeAttempt(attemptId: number, data: InstructorGradeRequest): Promise<ExamResult> {
        return api.put<ExamResult>(`/exams/attempts/${attemptId}/regrade`, data);
    }
}
