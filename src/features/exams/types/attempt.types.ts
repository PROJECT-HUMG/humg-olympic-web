import type { QuestionType, GradingMode } from './exam.types';
import type { BadgeItem } from '@/features/auth/types/auth.types';

// ─── Attempt Status ──────────────────────────────────────
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'PENDING_GRADING' | 'GRADED';

// ─── Student-facing exam info (GET /exams/:id/info) ──────
export interface ExamInfo {
    id: number;
    slug: string;
    title: string;
    description?: string;
    subjectName: string;
    subjectColor?: string;
    categoryName: string;
    duration: number;          // minutes
    totalPoints: number;
    passingScore: number;
    questionCount: number;
    startDatetime?: string | null;
    endDatetime?: string | null;
    hasAccessCode: boolean;     // true if exam requires access code
    gradingMode: GradingMode;   // AUTO | MANUAL
    requirePaperSubmission: boolean;
    hasAttempt: boolean;       // true if student already attempted
    attemptId?: number | null;       // latest attempt ID (if any)
    attemptStatus?: AttemptStatus | null; // latest attempt status
}

// ─── Question shown during exam (NO correct answers) ─────
export interface ExamTakingQuestion {
    id: number;
    type: QuestionType;
    content: string;          // Supports LaTeX
    points: number;
    options: ExamTakingOption[];
}

export interface ExamTakingOption {
    id: number;
    label: string;            // A, B, C, D
    content: string;
}

// ─── Start Exam Response ─────────────────────────────────
export interface StartExamResponse {
    attemptId: number;
    exam: {
        id: number;
        title: string;
        duration: number;     // minutes
        totalPoints: number;
        questions: ExamTakingQuestion[];
    };
    startedAt: string;
    expiresAt: string;
}

// ─── Answer (stored in localStorage) ─────────────────────
export interface LocalAnswer {
    selectedOptionIds?: number[];
    textAnswer?: string;
    textAnswers?: string[];
}

export interface LocalAnswerStore {
    answers: Record<number, LocalAnswer>;   // questionId → answer
    savedAt: string;
}

// ─── Submit Request ──────────────────────────────────────
export interface SubmitAnswerItem {
    questionId: number;
    selectedOptionIds?: number[];
    textAnswer?: string;
    textAnswers?: string[];
}

export interface SubmitExamRequest {
    answers: SubmitAnswerItem[];
    actionLogs?: ActionLogEntry[];
}

// ─── Result Detail ───────────────────────────────────────
export interface QuestionResultDetail {
    questionId: number;
    questionPoints: number;              // Max points for this question
    questionContent?: string;            // Present in student result, absent in instructor detail
    questionType?: QuestionType;         // Present in student result, absent in instructor detail
    isCorrect: boolean | null;           // null for pending subjective questions
    pointsEarned: number;
    correctOptionIds?: number[];
    correctAnswer?: string | null;
    correctAnswers?: string[] | null;    // For SHORT_ANSWER_MULTI
    userSelectedOptionIds?: number[] | null;
    userTextAnswer?: string | null;
    explanation?: string | null;
    options?: ExamTakingOption[];         // Student result only
    correctOptions?: OptionDetail[];     // Instructor detail: full option data
    userSelectedOptions?: OptionDetail[];
    manualPoints?: number | null;        // Instructor-assigned points
    instructorComment?: string | null;   // Instructor comment
}

// ─── Option Detail (resolved from IDs) ───────────────────
export interface OptionDetail {
    id: number;
    label: string;
    content: string;
}

export interface ExamResult {
    // Student-facing fields (may be absent in instructor detail)
    attemptId?: number;
    examId?: number;
    examTitle?: string;
    status?: AttemptStatus;
    startedAt?: string;
    submittedAt?: string;
    // Instructor detail field
    student?: {
        id: number;
        name: string;
        avatar: string | null;
        role: string;
        badges: unknown[];
        xpPoints: number;
        isDeleted: boolean;
    } | null;
    // Common fields
    score: number;
    totalPoints: number;
    totalCorrect: number;
    totalWrong: number;
    totalUnanswered: number;
    passed: boolean;
    timeSpentSeconds: number;
    appealId?: number | null;          // Grade appeal ID (null if not submitted)
    appealStatus?: string | null;      // PENDING | APPROVED | REJECTED | null
    details: QuestionResultDetail[];
}

// ─── Submit Confirmation (POST /submit response) ─────────
export interface SubmitConfirmationResponse {
    attemptId: number;
    status: AttemptStatus;                // GRADED | PENDING_GRADING
    requirePaperSubmission: boolean;
    result: ExamResult | null;            // null when PENDING_GRADING
}

// ─── Attempt Summary (for history) ───────────────────────
export interface AttemptSummary {
    attemptId: number;
    examId: number;
    slug: string;
    examTitle: string;
    score: number;
    totalPoints: number;
    passed: boolean;
    startedAt: string;
    submittedAt: string;
    status: AttemptStatus;
}

// ─── Attempt History (paginated) ─────────────────────────
export interface AttemptHistoryResponse {
    data: AttemptSummary[];
    total: number;
    page: number;
    limit: number;
}

// ─── Leaderboard ─────────────────────────────────────────
export interface LeaderboardEntry {
    rank: number;
    userId: number;
    userName: string;
    userAvatar?: string | null;
    score: number;              // điểm thi (exam score)
    totalXp?: number;           // tổng XP của user (dùng để hiển thị màu tên, badge)
    timeSpentSeconds: number;
    submittedAt: string;
    role?: string;
    selectedBadges?: BadgeItem[];
}

export interface UserRank {
    rank: number;
    score: number;
    timeSpentSeconds: number;
}

export interface LeaderboardResponse {
    rankings: LeaderboardEntry[];
    userRank: UserRank | null;
}

// ─── Action Logs (user behavior tracking) ────────────────
export type ActionLogType =
    | 'ANSWER_CHANGE'
    | 'NAVIGATE'
    | 'FLAG'
    | 'UNFLAG'
    | 'TAB_SWITCH'
    | 'FULLSCREEN_TOGGLE'
    | 'PASTE'
    | 'EXAM_START'
    | 'EXAM_SUBMIT';

export interface ActionLogEntry {
    id?: number;
    action: ActionLogType;
    questionId?: number;
    timestamp: string;
    detail?: string;
}

export interface AttemptActionLog {
    attemptId: number;
    logs: ActionLogEntry[];
}

// ─── Grade Appeal (Phúc khảo) ────────────────────────────
export type GradeAppealStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface GradeAppealRequest {
    attemptId: number;
    reason: string;
}

export interface GradeAppealResponse {
    id: number;
    attemptId: number;
    reason: string;
    status: GradeAppealStatus;
    reviewerComment: string | null;
    reviewedAt: string | null;
    created: string;
}

export interface ReviewAppealRequest {
    status: 'APPROVED' | 'REJECTED';
    comment: string | null;
}

// ─── Paper Submission (Nộp minh chứng bài làm) ──────────
export interface PaperSubmission {
    id: number;
    attemptId: number;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    created: string;
}

// ─── Pending Submission (instructor list) ───────────────
export interface PendingSubmission {
    attemptId: number;
    student: {
        id: number;
        name: string;
        avatar: string | null;
        role: string;
        badges: BadgeItem[];
        xpPoints: number;
        isDeleted: boolean;
    };
    score: number | null;
    status: AttemptStatus;
    submittedAt: string;
    hasEvidence: boolean;
    evidenceCount: number;
    evidences: PaperSubmission[];
}

// ─── Instructor Grading Request ───────────────────────
export interface AnswerGrade {
    answerId: number;
    points: number;
    comment?: string | null;
}

export interface InstructorGradeRequest {
    comment?: string | null;
    answerGrades: AnswerGrade[];
}

// ─── Submission Detail (instructor view with evidences) ──
export interface SubmissionDetailResponse {
    result: ExamResult;
    evidences: PaperSubmission[];
}
