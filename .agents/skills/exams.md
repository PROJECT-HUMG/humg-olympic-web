# Skill: Exams & Question Bank

## Feature Folder
`src/features/exams/`

---

## Types — `types/exam.types.ts`

| Type | Purpose |
|------|---------|
| `QuestionType` | `'SINGLE_CHOICE' \| 'MULTIPLE_CHOICE' \| 'SHORT_ANSWER'` |
| `ExamStatus` | `'DRAFT' \| 'PUBLISHED' \| 'ARCHIVED'` |
| `ExamCategoryType` | `'OLYMPIC_OFFICIAL' \| 'PRACTICE' \| 'MOCK_EXAM' \| 'HOMEWORK'` |
| `ExamCategory` | `{ id, name, type, description? }` |
| `QuestionOption` | `{ id?, label, content, isCorrect }` — supports LaTeX |
| `Question` | Question Bank item: `{ id, type, content, explanation?, points, subjectId, subject?, options, correctAnswer?, createdAt, updatedAt }` |
| `QuestionQueryParams` | Filter for getQuestions: `page, limit, search, subjectId, type, sortBy, sortOrder` |
| `ExamSummary` | List-view: `{ id, title, description?, ..., hasAccessCode, createdAt, updatedAt }` |
| `ExamDetail` | Extends `ExamSummary` with `questions: Question[]` |
| `ExamQueryParams` | Filter for getExams: `page, limit, search, subjectId, categoryId, status, sortBy, sortOrder` |
| `CreateExamRequest` | `{ title, description?, subjectId, categoryId, duration, totalPoints, passingScore, startDatetime?, endDatetime?, questionIds, shuffle?, accessCode? }` |
| `UpdateExamRequest` | All fields optional — includes `accessCode?` |
| `CreateQuestionRequest` | `{ type, content, explanation?, points, subjectId, options?, correctAnswer? }` |
| `UpdateQuestionRequest` | Explicit flat: all fields optional — `{ type?, content?, explanation?, points?, subjectId?, options?, correctAnswer? }` |
| `DocxImportResponse` | `{ questions: CreateQuestionRequest[], warnings?, totalParsed }` |
| `PagedResponse<T>` | `{ data, total, page, limit }` |

> Re-exports `Subject` from `competition.types.ts`.

---

## Repository API — `api/ExamRepository.ts` → `api/ApiExamRepository.ts`

| Method | HTTP | Endpoint | Notes |
|--------|------|----------|-------|
| `getQuestions(params)` | GET | `/questions` | Question Bank list |
| `createQuestion(data)` | POST | `/questions` | |
| `updateQuestion(id, data)` | PUT | `/questions/:id` | |
| `deleteQuestion(id)` | DELETE | `/questions/:id` | |
| `importDocx(file)` | POST | `/questions/import-docx` | multipart/form-data via `authenticatedFetch` |
| `getExams(params)` | GET | `/exams` | Supports `status` filter |
| `getExamDetail(id)` | GET | `/exams/:id` | Returns `ExamDetail` with questions |
| `createExam(data)` | POST | `/exams` | |
| `updateExam(id, data)` | PUT | `/exams/:id` | |
| `deleteExam(id)` | DELETE | `/exams/:id` | |
| `publishExam(id)` | PUT | `/exams/:id/publish` | |
| `archiveExam(id)` | PUT | `/exams/:id/archive` | |
| `getCategories()` | GET | `/exams/categories` | |
| `getSubjects()` | GET | `/competitions/subjects` | Shared subjects list |

Singleton: `import { examRepository } from '@/features/exams/api'`

---

## Attempt API — `api/ExamAttemptRepository.ts` → `api/ApiExamAttemptRepository.ts`

| Method | HTTP | Endpoint | Notes |
|--------|------|----------| ------|
| `getExamInfo(examId)` | GET | `/exams/:id/info` | Returns `ExamInfo` (student view, includes `hasAccessCode`) |
| `startExam(examId, opts?)` | POST | `/exams/:id/start` | `opts: { competitionId?, accessCode? }` — idempotent for IN_PROGRESS |
| `submitExam(attemptId, data)` | POST | `/attempts/:id/submit` | |
| `getAttemptResult(attemptId)` | GET | `/attempts/:id` | |
| `getExamAttempts(examId, page?, limit?)` | GET | `/exams/:id/attempts` | |
| `getLeaderboard(examId, competitionId?, limit?)` | GET | `/exams/:id/leaderboard` | |
| `getUserAttemptHistory(userId, page?, limit?)` | GET | `/users/:userId/exam-history` | For profile exam history tab |

Singleton: `import { examAttemptRepository } from '@/features/exams/api'`

### Attempt Types — `types/attempt.types.ts`

| Type | Purpose |
|------|---------|
| `AttemptStatus` | `'IN_PROGRESS' \| 'SUBMITTED' \| 'TIMED_OUT' \| 'GRADED'` |
| `ExamInfo` | Student exam info: `{ ..., hasAccessCode, hasAttempt, attemptId?, attemptStatus? }` |
| `StartExamResponse` | `{ attemptId, exam, startedAt, expiresAt }` |
| `AttemptSummary` | `{ attemptId, examTitle, score, totalPoints, passed, startedAt, submittedAt, status }` |
| `AttemptHistoryResponse` | `{ data: AttemptSummary[], total, page, limit }` |

---

## Hooks

| Hook | File | Returns |
|------|------|---------|
| `useExams(params)` | `hooks/useExams.ts` | `{ exams, total, loading, error, refetch, ... }` |
| `useQuestionBank(params)` | `hooks/useQuestionBank.ts` | `{ questions, total, loading, error, refetch, ... }` |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `QuestionCard` | `components/QuestionCard.tsx` | Renders single question (with LaTeX) |
| `QuestionEditor` | `components/QuestionEditor.tsx` | Create/edit question form |
| `QuizBuilderTab` | `components/QuizBuilderTab.tsx` | Exam builder — pick questions from bank |
| `ExamQuestionList` | `components/ExamQuestionList.tsx` | Ordered list of questions in an exam |
| `DocxImportModal` | `components/DocxImportModal.tsx` | DOCX import flow with preview/confirm |
| `LatexRenderer` | `components/LatexRenderer.tsx` | KaTeX rendering for `$...$` and `$$...$$` |

---

## Pages

| Page | File | Route | Auth |
|------|------|-------|------|
| `CreateExamPage` | `pages/CreateExamPage.tsx` | `/exams/create`, `/exams/:id/edit` | ADMIN, LECTURER |
| `ExamPreviewPage` | `pages/ExamPreviewPage.tsx` | `/exams/:id/preview` | Authenticated |
| `ExamStartPage` | `pages/ExamStartPage.tsx` | `/exams/:id` | Authenticated — shows access code input if `hasAccessCode` |

---

## Profile Integration

| Component | File | Purpose |
|-----------|------|---------|
| `ExamHistoryTab` | `profile/components/ExamHistoryTab.tsx` | Stats grid + paginated attempt list (used in ProfilePage "Lịch sử thi" tab) |
| `ExamHistorySkeleton` | Same file | Skeleton loader for the tab |

---

## Integration Notes

### Exam Picker (shared component pattern)
Used in `RoadmapEditorPage` and `EditCompetitionModal`:
```tsx
// Fetch exams for picker — always filter status=PUBLISHED
const res = await examRepository.getExams({ page, limit: 10, search, status: 'PUBLISHED' });
```

### Linking Exams to other features
- **StageResource** (`roadmap.types.ts`): has `examId?: number` and `examTitle?: string`
- **CompetitionDetail** (`competition.types.ts`): has `examId?: number` and `examTitle?: string`
- Backend spec: `BACKEND_EXAM_INTEGRATION_SPEC.md` at project root
