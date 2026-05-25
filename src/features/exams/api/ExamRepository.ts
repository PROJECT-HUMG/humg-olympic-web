import type {
    ExamSummary, ExamDetail, ExamQueryParams,
    CreateExamRequest, UpdateExamRequest,
    Question, QuestionQueryParams,
    CreateQuestionRequest, UpdateQuestionRequest,
    DocxImportResponse, ExamCategory, PagedResponse,
} from '@/features/exams/types/exam.types';
import type { Subject } from '@/features/competitions/types/competition.types';

export interface ExamRepository {
    // ─── Question Bank ───────────────────────────────────
    getQuestions(params: QuestionQueryParams): Promise<PagedResponse<Question>>;
    createQuestion(data: CreateQuestionRequest): Promise<Question>;
    updateQuestion(id: number, data: UpdateQuestionRequest): Promise<Question>;
    deleteQuestion(id: number): Promise<void>;
    importDocx(file: File): Promise<DocxImportResponse>;   // Parse into bank

    // ─── Exams ───────────────────────────────────────────
    getPublicExams(params: ExamQueryParams): Promise<PagedResponse<ExamSummary>>;
    getExams(params: ExamQueryParams): Promise<PagedResponse<ExamSummary>>;
    getExamDetail(id: number): Promise<ExamDetail>;
    createExam(data: CreateExamRequest): Promise<ExamDetail>;
    updateExam(id: number, data: UpdateExamRequest): Promise<ExamDetail>;
    deleteExam(id: number): Promise<void>;
    publishExam(id: number): Promise<ExamDetail>;
    archiveExam(id: number): Promise<ExamDetail>;
    reopenExam(id: number): Promise<ExamDetail>;

    // ─── Lookups ─────────────────────────────────────────
    getCategories(): Promise<ExamCategory[]>;
    getSubjects(): Promise<Subject[]>;
}
