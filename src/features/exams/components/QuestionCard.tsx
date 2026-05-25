import { memo, type ElementType } from 'react';
import {
    CheckCircle2, Edit3, Trash2,
    CircleDot, SquareCheck, TextCursorInput, Info
} from 'lucide-react';
import { LatexRenderer } from './LatexRenderer';
import i18n from '@/i18n';
import type { Question, QuestionType } from '@/features/exams/types/exam.types';

interface QuestionCardProps {
    question: Question;
    index: number;
    onEdit?: (question: Question) => void;
    onDelete?: (questionId: number) => void;
    compact?: boolean;
}

const typeConfig: Record<QuestionType, { label: string; icon: ElementType }> = {
    SINGLE_CHOICE: { label: i18n.t('exams:typeLabels.singleChoice'), icon: CircleDot },
    MULTIPLE_CHOICE: { label: i18n.t('exams:typeLabels.multipleChoice'), icon: SquareCheck },
    SHORT_ANSWER: { label: i18n.t('exams:typeLabels.shortAnswer'), icon: TextCursorInput },
    SHORT_ANSWER_MULTI: { label: i18n.t('exams:typeLabels.shortAnswerMulti'), icon: TextCursorInput },
};

export const QuestionCard = memo<QuestionCardProps>(({
    question, index, onEdit, onDelete, compact = false,
}) => {
    const config = typeConfig[question.type];
    const TypeIcon = config.icon;

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="p-4 md:p-6 min-w-0">

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">
                            {index + 1}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <TypeIcon size={13} /> {config.label}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {i18n.t('exams:quiz.points', { count: question.points })}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {onEdit && (
                            <button onClick={() => onEdit(question)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:text-blue-400 dark:hover:bg-slate-800 transition-colors" title={i18n.t('exams:quiz.editQuestion')}>
                                <Edit3 size={16} />
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={() => onDelete(question.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-colors" title={i18n.t('exams:quiz.deleteBtn')}>
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Question Content ── */}
                <div className="text-sm md:text-base text-slate-800 dark:text-slate-100 leading-relaxed mb-4 break-words">
                    <LatexRenderer content={question.content} />
                </div>

                {/* ── Options (Single / Multiple Choice) ── */}
                {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') && (
                    <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                        {question.options.map((option, idx) => (
                            <div
                                key={option.id ?? idx}
                                className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${option.isCorrect
                                    ? 'border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-900/5'
                                    : 'border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                <span className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold shrink-0 ${option.isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {option.label}
                                </span>
                                <div className={`flex-1 min-w-0 text-sm pt-0.5 md:pt-1 ${option.isCorrect
                                    ? 'text-slate-900 dark:text-white font-medium'
                                    : 'text-slate-600 dark:text-slate-300'
                                    }`}>
                                    <LatexRenderer content={option.content} />
                                </div>
                                {option.isCorrect && <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Short Answer ── */}
                {question.type === 'SHORT_ANSWER' && question.correctAnswer && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{i18n.t('exams:quiz.correctAnswerExact')}</span>
                        </div>
                        <div className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200 font-medium">
                            <LatexRenderer content={question.correctAnswer} />
                        </div>
                    </div>
                )}

                {/* ── Short Answer Multi ── */}
                {question.type === 'SHORT_ANSWER_MULTI' && question.correctAnswers && question.correctAnswers.length > 0 && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{i18n.t('exams:quiz.answers')}</span>
                        </div>
                        <div className="px-4 py-3 space-y-2">
                            {question.correctAnswers.map((ans, idx) => (
                                <div key={idx} className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-slate-500 shrink-0">{String.fromCharCode(97 + idx)})</span>
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        <LatexRenderer content={ans} />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Explanation ── */}
                {question.explanation && !compact && (
                    <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                            <Info size={14} className="text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{i18n.t('exams:quiz.explanationDetail')}</span>
                        </div>
                        <div className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                            <LatexRenderer content={question.explanation} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

QuestionCard.displayName = 'QuestionCard';