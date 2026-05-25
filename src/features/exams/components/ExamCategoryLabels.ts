/** Shared category labels for exam cards */
import i18n from '@/i18n';

export const CATEGORY_LABELS: Record<string, { label: string }> = {
    OLYMPIC_OFFICIAL: { label: 'Olympic' },
    PRACTICE: { label: i18n.t('exams:card.categoryPractice') },
    MOCK_EXAM: { label: i18n.t('exams:card.categoryMockExam') },
    HOMEWORK: { label: i18n.t('exams:card.categoryHomework') },
    EXAM: { label: i18n.t('exams:card.categoryExam') },
};
