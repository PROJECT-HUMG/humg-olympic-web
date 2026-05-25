import type {
    ExamInfo, StartExamResponse, SubmitExamRequest, ExamResult, SubmitConfirmationResponse,
    AttemptHistoryResponse, LeaderboardResponse,
    AttemptActionLog, GradeAppealRequest, GradeAppealResponse, ReviewAppealRequest, PaperSubmission,
    PendingSubmission, InstructorGradeRequest, SubmissionDetailResponse,
} from '../types/attempt.types';
import type { PagedResponse } from '../types/exam.types';

export interface ExamAttemptRepository {
    getExamInfo(examId: number): Promise<ExamInfo>;
    getExamInfoBySlug(slug: string): Promise<ExamInfo>;
    startExam(examId: number, options?: { competitionId?: number; accessCode?: string }): Promise<StartExamResponse>;
    submitExam(attemptId: number, data: SubmitExamRequest): Promise<SubmitConfirmationResponse>;
    getAttemptResult(attemptId: number): Promise<ExamResult>;
    getExamAttempts(examId: number, page?: number, limit?: number): Promise<AttemptHistoryResponse>;
    getUserAttemptHistory(userId: number, page?: number, limit?: number): Promise<AttemptHistoryResponse>;
    getLeaderboard(examId: number, competitionId?: number, limit?: number): Promise<LeaderboardResponse>;
    // Action logs
    getAttemptActionLogs(attemptId: number): Promise<AttemptActionLog>;
    // Grade appeal
    submitGradeAppeal(data: GradeAppealRequest): Promise<GradeAppealResponse>;
    getGradeAppeals(attemptId: number): Promise<GradeAppealResponse[]>;
    getExamAppeals(examId: number, status?: string, page?: number, limit?: number): Promise<PagedResponse<GradeAppealResponse>>;
    reviewAppeal(appealId: number, data: ReviewAppealRequest): Promise<GradeAppealResponse>;
    // Paper submission
    submitPaperEvidence(attemptId: number, files: File[]): Promise<PaperSubmission[]>;
    // Instructor grading
    getSubmissions(examId: number, status?: string, page?: number, limit?: number): Promise<PagedResponse<PendingSubmission>>;
    getAttemptDetail(attemptId: number): Promise<SubmissionDetailResponse>;
    gradeAttempt(attemptId: number, data: InstructorGradeRequest): Promise<ExamResult>;
    regradeAttempt(attemptId: number, data: InstructorGradeRequest): Promise<ExamResult>;
}
