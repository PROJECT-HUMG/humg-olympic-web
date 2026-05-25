import { FileText, Clock, Lock, CalendarClock, FileUp, ArrowRight } from 'lucide-react';
import type { ExamSummary } from '@/features/exams/types/exam.types';
import { CATEGORY_LABELS } from './ExamCategoryLabels';
import i18n from '@/i18n';

interface ExamListItemProps {
    exam: ExamSummary;
    onClick: () => void;
}

export const ExamListItem = ({ exam, onClick }: ExamListItemProps) => {
    const catType = CATEGORY_LABELS[exam.categoryType] || { label: exam.categoryName };
    const isTimebound = !!(exam.startDatetime || exam.endDatetime);
    const isExpired = exam.endDatetime ? new Date(exam.endDatetime) < new Date() : false;

    return (
        <div
            onClick={!isExpired ? onClick : undefined}
            className={`group bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/40 transition-all duration-200 overflow-hidden ${isExpired
                ? 'opacity-50 cursor-not-allowed grayscale-[30%]'
                : 'cursor-pointer hover:shadow-md hover:shadow-slate-200/30 dark:hover:shadow-black/15 hover:border-slate-300/80 dark:hover:border-slate-600/60'
                }`}
        >
            <div className="flex items-center px-4 py-3.5 gap-4">
                {/* ── Subject dot ── */}
                {exam.subjectColor && (
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900" style={{ backgroundColor: exam.subjectColor }} />
                )}

                {/* ── Title + meta ── */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold text-slate-800 dark:text-white truncate transition-colors ${!isExpired ? 'group-hover:text-humg-blue dark:group-hover:text-blue-400' : ''}`}>
                            {exam.title}
                        </h3>
                        {exam.hasAccessCode && (
                            <Lock size={11} className="text-slate-400 shrink-0" />
                        )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                        {exam.subjectName}
                        <span className="text-slate-200 dark:text-slate-700">·</span>
                        {catType.label}
                        {exam.gradingMode === 'MANUAL' && (
                            <>
                                <span className="text-slate-200 dark:text-slate-700">·</span>
                                <span>{i18n.t('exams:card.manualGrading')}</span>
                            </>
                        )}
                    </p>
                </div>

                {/* ── Stats ── */}
                <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 shrink-0">
                    <span className="flex items-center gap-1">
                        <FileText size={12} /> {exam.questionCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={12} /> {exam.duration}'
                    </span>
                    <span>{i18n.t('exams:card.pointsVal', { count: exam.totalPoints })}</span>
                    {isTimebound ? (
                        <span className="flex items-center gap-1">
                            <CalendarClock size={11} />
                            {isExpired ? (
                                <span className="text-red-400 font-medium">{i18n.t('exams:card.expired')}</span>
                            ) : (
                                <span>{exam.endDatetime && new Date(exam.endDatetime).toLocaleDateString('vi-VN', { dateStyle: 'short' })}</span>
                            )}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 font-medium">
                            <CalendarClock size={11} /> {i18n.t('exams:card.open')}
                        </span>
                    )}
                    {exam.requirePaperSubmission && (
                        <FileUp size={12} className="text-slate-400" />
                    )}
                </div>

                {/* ── Hover CTA ── */}
                {!isExpired && (
                    <ArrowRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-humg-blue dark:group-hover:text-blue-400 transition-colors shrink-0" />
                )}
            </div>
        </div>
    );
};
