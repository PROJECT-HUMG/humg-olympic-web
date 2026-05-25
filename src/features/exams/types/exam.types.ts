import type { Subject } from '@/features/competitions/types/competition.types';

// ─── Enums ───────────────────────────────────────────────
export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'SHORT_ANSWER_MULTI';
export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ExamCategoryType = 'OLYMPIC_OFFICIAL' | 'PRACTICE' | 'MOCK_EXAM' | 'HOMEWORK' | 'EXAM';
export type GradingMode = 'AUTO' | 'MANUAL';

// ─── Category ────────────────────────────────────────────
export interface ExamCategory {
    id: number;
    name: string;
    type: ExamCategoryType;
    description?: string;
}

// ─── Question Option (for choice-based questions) ────────
export interface QuestionOption {
    id?: number;
    label: string;        // A, B, C, D ...
    content: string;      // Supports LaTeX via $...$ or $$...$$
    isCorrect: boolean;
}

// ─── Question (independent – belongs to Question Bank) ───
export interface Question {
    id: number;
    type: QuestionType;
    content: string;      // Supports LaTeX
    explanation?: string;
    points: number;
    subjectId: number;
    subject?: Subject;
    options: QuestionOption[];       // For SINGLE_CHOICE / MULTIPLE_CHOICE
    correctAnswer?: string;          // For SHORT_ANSWER
    correctAnswers?: string[];       // For SHORT_ANSWER_MULTI (a, b, c...)
    createdAt: string;
    updatedAt: string;
}

// ─── Question Query / Filter ─────────────────────────────
export interface QuestionQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: number;
    type?: QuestionType;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// ─── Exam Summary (list view) ────────────────────────────
export interface ExamSummary {
    id: number;
    slug: string;
    title: string;
    description?: string;
    subjectId: number;
    subjectName: string;
    subjectColor?: string;
    categoryId: number;
    categoryName: string;
    categoryType: ExamCategoryType;
    status: ExamStatus;
    duration: number;        // minutes
    totalPoints: number;
    passingScore: number;
    questionCount: number;
    shuffle: boolean;
    startDatetime?: string | null;
    endDatetime?: string | null;
    hasAccessCode: boolean;
    requirePaperSubmission: boolean;
    gradingMode: GradingMode;
    createdAt: string;
    updatedAt: string;
}

// ─── Exam Detail (full view) ─────────────────────────────
export interface ExamDetail extends ExamSummary {
    questions: Question[];   // Populated from junction
    accessCode?: string;     // Only returned for ADMIN/LECTURER
}

// ─── Exam Query / Filter ─────────────────────────────────
export interface ExamQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: number;
    categoryId?: number;
    status?: ExamStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// ─── Create / Update DTOs ────────────────────────────────
export interface CreateExamRequest {
    title: string;
    description?: string;
    subjectId: number;
    categoryId: number;
    duration: number;
    totalPoints: number;
    passingScore: number;
    startDatetime?: string | null;
    endDatetime?: string | null;
    questionIds: number[];           // Pick from question bank
    shuffle?: boolean;               // Shuffle question order
    accessCode?: string;             // Mã truy cập (6-8 ký tự, optional)
    requirePaperSubmission?: boolean; // Yêu cầu nộp bài làm trên giấy
    gradingMode?: GradingMode;       // AUTO (default) | MANUAL
}

export interface UpdateExamRequest {
    title?: string;
    description?: string;
    subjectId?: number;
    categoryId?: number;
    duration?: number;
    totalPoints?: number;
    passingScore?: number;
    startDatetime?: string | null;
    endDatetime?: string | null;
    questionIds?: number[];
    shuffle?: boolean;
    accessCode?: string | null;      // null = xóa mã truy cập
    requirePaperSubmission?: boolean;
    gradingMode?: GradingMode;
}

export interface CreateQuestionRequest {
    type: QuestionType;
    content: string;
    explanation?: string;
    points: number;
    subjectId: number;
    options?: Omit<QuestionOption, 'id'>[];
    correctAnswer?: string;          // For SHORT_ANSWER
    correctAnswers?: string[];       // For SHORT_ANSWER_MULTI
}

export interface UpdateQuestionRequest {
    type?: QuestionType;
    content?: string;
    explanation?: string;
    points?: number;
    subjectId?: number;
    options?: Omit<QuestionOption, 'id'>[];
    correctAnswer?: string;
    correctAnswers?: string[];
}

// ─── DOCX Import ─────────────────────────────────────────
export interface DocxImportResponse {
    questions: CreateQuestionRequest[];
    warnings?: string[];
    totalParsed: number;
}

// ─── Paged Response (re-export for convenience) ──────────
export interface PagedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// Re-export Subject for convenience
export type { Subject };
