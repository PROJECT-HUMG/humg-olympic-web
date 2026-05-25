import { FileText, Clock, Lock, CalendarClock, FileUp, ArrowRight } from 'lucide-react';
import type { ExamSummary } from '@/features/exams/types/exam.types';
import { CATEGORY_LABELS } from './ExamCategoryLabels';
import i18n from '@/i18n';

interface ExamCardProps {
    exam: ExamSummary;
    onClick: () => void;
}

export const ExamCard = ({ exam, onClick }: ExamCardProps) => {
    const catType = CATEGORY_LABELS[exam.categoryType] || { label: exam.categoryName };
    const isTimebound = !!(exam.startDatetime || exam.endDatetime);
    const isExpired = exam.endDatetime ? new Date(exam.endDatetime) < new Date() : false;

    return (
        <div
            onClick={!isExpired ? onClick : undefined}
            className={`group relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 flex flex-col h-full overflow-hidden transition-all duration-300 ${isExpired
                ? 'opacity-50 cursor-not-allowed grayscale-[30%]'
                : 'cursor-pointer shadow-sm hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/20 hover:-translate-y-0.5 hover:border-slate-300/80 dark:hover:border-slate-600/60'
                }`}
        >
            <div className="p-5 flex-1 flex flex-col">
                {/* ── Subject + Category ── */}
                <div className="flex items-center gap-2 mb-3">
                    {exam.subjectColor && (
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900" style={{ backgroundColor: exam.subjectColor }} />
                    )}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {exam.subjectName}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {catType.label}
                    </span>
                </div>

                {/* ── Title ── */}
                <h3 className={`text-lg font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug mb-2 transition-colors ${!isExpired ? 'group-hover:text-humg-blue dark:group-hover:text-blue-400' : ''}`}>
                    {exam.title}
                </h3>

                {exam.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {exam.description}
                    </p>
                )}

                {/* ── Stats inline ── */}
                <div className="mt-auto flex items-center gap-3 text-[13px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                        <FileText size={13} /> {i18n.t('exams:card.questionsCount', { count: exam.questionCount })}
                    </span>
                    <span className="text-slate-200 dark:text-slate-700">·</span>
                    <span className="flex items-center gap-1">
                        <Clock size={13} /> {i18n.t('exams:card.durationVal', { count: exam.duration })}
                    </span>
                    <span className="text-slate-200 dark:text-slate-700">·</span>
                    <span>{i18n.t('exams:card.pointsVal', { count: exam.totalPoints })}</span>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 min-w-0 overflow-hidden">
                        {exam.hasAccessCode && (
                            <>
                                <Lock size={10} className="shrink-0" />
                                <span>{i18n.t('exams:card.needCode')}</span>
                                <span className="text-slate-200 dark:text-slate-700">·</span>
                            </>
                        )}
                        <CalendarClock size={10} className="shrink-0" />
                        {isTimebound ? (
                            isExpired ? (
                                <span className="text-red-400 font-medium">{i18n.t('exams:card.expired')}</span>
                            ) : (
                                <span>{exam.endDatetime && new Date(exam.endDatetime).toLocaleDateString('vi-VN', { dateStyle: 'short' })}</span>
                            )
                        ) : (
                            <span className="font-medium">{i18n.t('exams:card.alwaysOpen')}</span>
                        )}
                        {exam.gradingMode === 'MANUAL' && (
                            <>
                                <span className="text-slate-200 dark:text-slate-700">·</span>
                                <span>{i18n.t('exams:card.manualGrading')}</span>
                            </>
                        )}
                        {exam.requirePaperSubmission && (
                            <>
                                <span className="text-slate-200 dark:text-slate-700">·</span>
                                <FileUp size={10} className="shrink-0" />
                            </>
                        )}
                    </div>

                    {/* ── Hover CTA ── */}
                    {!isExpired && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-humg-blue dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {i18n.t('exams:card.view')} <ArrowRight size={12} />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
