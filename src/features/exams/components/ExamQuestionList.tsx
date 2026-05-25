
import { QuestionCard } from './QuestionCard';
import { emptyState, emptyStateIcon, emptyStateTitle, emptyStateDesc } from '@/features/exams/styles/examStyles';
import i18n from '@/i18n';
import type { Question } from '@/features/exams/types/exam.types';

interface ExamQuestionListProps {
    questions: (Question | null | undefined)[];
    onEditQuestion?: (question: Question) => void;
    onDeleteQuestion?: (questionId: number) => void;
    compact?: boolean;
}

export const ExamQuestionList = ({
    questions,
    onEditQuestion,
    onDeleteQuestion,
    compact = false,
}: ExamQuestionListProps) => {
    const validQuestions = questions.filter((q): q is Question => q != null);

    if (validQuestions.length === 0) {
        return (
            <div className={emptyState}>
                <div className={emptyStateIcon}>
                    <span className="text-2xl">📝</span>
                </div>
                <h3 className={emptyStateTitle}>
                    {i18n.t('exams:quiz.noQuestions')}
                </h3>
                <p className={emptyStateDesc}>
                    {i18n.t('exams:quiz.noQuestionsHint')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {validQuestions.map((question, index) => (
                <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    onEdit={onEditQuestion}
                    onDelete={onDeleteQuestion}
                    compact={compact}
                />
            ))}
        </div>
    );
};
