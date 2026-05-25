# Feature: Exams (`src/features/exams`)

## Structure
```
src/features/exams/
├── api/            # examRepository, examAttemptRepository
├── components/
│   ├── DocxImportModal.tsx     # Word import modal with drag-drop and edit preview
│   ├── ExamQuestionList.tsx    # Renders list of QuestionCard components
│   ├── ExamSkeletons.tsx       # 7 skeleton components (Leaderboard, QuestionBank, ExamGrid, ExamPreview, ExamStart, ExamResult, CreateExam)
│   ├── LatexRenderer.tsx       # Markdown + LaTeX renderer (react-markdown + katex)
│   ├── QuestionCard.tsx        # Memoized question display card
│   ├── QuestionEditor.tsx      # Question create/edit form with LaTeX snippets
│   └── QuizBuilderTab.tsx      # Admin quiz builder (QuestionBankView, ExamListView, QuestionBankCard, ExamCard sub-components)
├── hooks/          # Custom hooks for exam features
├── pages/
│   ├── CreateExamPage.tsx      # Create/edit exam form
│   ├── ExamPreviewPage.tsx     # Exam preview with leaderboard sidebar
│   ├── ExamResultPage.tsx      # Result page with score hero + detail cards + leaderboard
│   ├── ExamStartPage.tsx       # Exam start page with info + CTA
│   └── ExamTakingPage.tsx      # Exam taking interface (Azota-style)
├── styles/         # Shared CSS class strings
└── types/          # TypeScript types (exam.types, attempt.types)
```

## React 19.2 Status
✅ All files optimized — no `import React`, `React.FC`, `React.memo`, `React.ElementType`, `React.CSSProperties`, `React.Fragment`, or `React.DragEvent` namespace usage remains.

## Key Patterns
- `memo<Props>` for memoized components (`QuestionCard`, `SubmitConfirmModal`, `ExamTakingPage QuestionCard`)
- `Fragment` imported directly for keyed fragments (`QuestionEditor`, `DocxImportModal`)
- `ElementType` for icon component props (`QuestionEditor`, `QuestionCard`)
- `CSSProperties` for inline style types (`ExamSkeletons`)
- `DragEvent` for drag-and-drop handlers (`DocxImportModal`)
