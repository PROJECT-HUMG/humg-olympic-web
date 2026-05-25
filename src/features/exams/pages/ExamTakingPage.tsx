import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock, ChevronLeft, ChevronRight, Send, AlertTriangle,
    CheckCircle2, Loader2, X, List, Maximize, Minimize, Type, Flag, Info, Sigma, Plus, Trash2
} from 'lucide-react';
import { examAttemptRepository } from '@/features/exams/api';
import { loadAnswers, saveAnswer, clearAnswers, countAnswered, cleanupOldAttempts } from '@/features/exams/utils/answerStorage';
import { LATEX_SNIPPETS_COMPACT } from '@/features/exams/utils/latexSnippets';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { ApiError } from '@/lib/api/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useActionLogger } from '@/features/exams/hooks/useActionLogger';
import { LatexRenderer } from '@/features/exams/components/LatexRenderer';
import { ExamTakingSkeleton } from '@/features/exams/components/ExamSkeletons';
import type { ExamTakingQuestion, LocalAnswer, StartExamResponse } from '@/features/exams/types/attempt.types';

// ─── Option letter labels ───────────────────────────────────
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// ─── Timer Hook ──────────────────────────────────────────
function useCountdown(expiresAt: string | null) {
    const [secondsLeft, setSecondsLeft] = useState<number>(0);

    useEffect(() => {
        if (!expiresAt) return;
        const calcRemaining = () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
        setSecondsLeft(calcRemaining());
        const interval = setInterval(() => {
            const remaining = calcRemaining();
            setSecondsLeft(remaining);
            if (remaining <= 0) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const isUrgent = secondsLeft <= 300;
    const isCritical = secondsLeft <= 60;

    return { secondsLeft, minutes, seconds, isUrgent, isCritical, formatted: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` };
}

// ─── Confirm Modal (#19 fix: memoized) ───────────────────
const SubmitConfirmModal = memo<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    totalQuestions: number;
    answeredCount: number;
}>(({ isOpen, onClose, onConfirm, isLoading, totalQuestions, answeredCount }) => {
    if (!isOpen) return null;
    const unanswered = totalQuestions - answeredCount;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 animate-fade-in-up"
                style={{ animationDuration: '0.15s' }}
                onClick={onClose}
            />
            <div
                className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 mx-4 animate-fade-in-up"
                style={{ animationDuration: '0.2s' }}
            >
                <div className="text-center mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                        <Send size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{i18n.t('exams:taking.confirmTitle')}</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {i18n.t('exams:taking.answered')} <span className="text-blue-600 dark:text-blue-400 font-bold">{answeredCount}/{totalQuestions}</span>
                    </div>
                    {unanswered > 0 && (
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5 mt-3 bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg">
                            <AlertTriangle size={14} /> {i18n.t('exams:taking.unanswered', { count: unanswered })}
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        {i18n.t('exams:taking.goBackBtn')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                        {isLoading ? i18n.t('exams:taking.submitting') : i18n.t('exams:taking.submitBtn')}
                    </button>
                </div>
            </div>
        </div>
    );
});
SubmitConfirmModal.displayName = 'SubmitConfirmModal';

// ─── Question Card (Azota Style) ─────────────────────
// #18 fix: memoized to prevent re-render on every timer tick
const QuestionCard = memo<{
    question: ExamTakingQuestion;
    index: number;
    answer: LocalAnswer | undefined;
    onAnswer: (questionId: number, answer: LocalAnswer) => void;
    isFlagged: boolean;
    onToggleFlag: (qId: number) => void;
    fontSizeClass: string;
}>(({ question, index, answer, onAnswer, isFlagged, onToggleFlag, fontSizeClass }) => {
    const [showLatexToolbar, setShowLatexToolbar] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleOptionClick = (optionId: number) => {
        if (question.type === 'SINGLE_CHOICE') {
            onAnswer(question.id, { selectedOptionIds: [optionId] });
        } else if (question.type === 'MULTIPLE_CHOICE') {
            const current = answer?.selectedOptionIds || [];
            const next = current.includes(optionId)
                ? current.filter(id => id !== optionId)
                : [...current, optionId];
            onAnswer(question.id, { selectedOptionIds: next });
        }
    };

    const isOptionSelected = (optionId: number) => answer?.selectedOptionIds?.includes(optionId) ?? false;

    // Insert LaTeX snippet at cursor for short answer
    const insertSnippet = useCallback((snippet: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const currentVal = answer?.textAnswer || '';
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = currentVal.slice(0, start);
        const after = currentVal.slice(end);
        const inMath = (before.split('$').length - 1) % 2 === 1;
        const inserted = inMath ? snippet : `$${snippet}$`;
        const newVal = before + inserted + after;
        onAnswer(question.id, { textAnswer: newVal });
        requestAnimationFrame(() => {
            ta.focus();
            const pos = start + inserted.length;
            ta.setSelectionRange(pos, pos);
        });
    }, [answer?.textAnswer, onAnswer, question.id]);

    const isShortAnswer = question.type === 'SHORT_ANSWER' || question.type === 'SHORT_ANSWER_MULTI';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Question header bar */}
            <div className="px-4 py-3 md:px-5 md:py-3.5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-sm">
                        {index + 1}
                    </span>
                    <span className="font-semibold text-blue-900 dark:text-blue-200 text-sm">
                        {i18n.t('exams:taking.question', { index: index + 1 })}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-blue-700 dark:text-blue-300">
                    <button
                        onClick={() => onToggleFlag(question.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors font-medium border ${isFlagged ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                    >
                        <Flag size={14} className={isFlagged ? 'fill-amber-500 text-amber-500' : ''} />
                        <span className="hidden sm:inline">{isFlagged ? i18n.t('exams:taking.flagged') : i18n.t('exams:taking.markFlag')}</span>
                    </button>
                    <span className="hidden sm:inline px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-800/40 font-medium">
                        {question.type === 'SINGLE_CHOICE' ? i18n.t('exams:taking.oneAnswer') : question.type === 'MULTIPLE_CHOICE' ? i18n.t('exams:taking.multiAnswer') : question.type === 'SHORT_ANSWER_MULTI' ? i18n.t('exams:taking.essayMulti') : i18n.t('exams:taking.essay')}
                    </span>
                    <span className="font-semibold">{i18n.t('exams:taking.points', { count: question.points })}</span>
                </div>
            </div>

            {/* Question content */}
            <div className="p-4 md:p-6">
                <div className={`text-slate-800 dark:text-slate-100 leading-relaxed mb-5 font-medium ${fontSizeClass}`}>
                    <LatexRenderer content={question.content} block />
                </div>

                {/* Options with A/B/C/D labels */}
                {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') && (
                    <div className="space-y-2.5">
                        {question.options.map((option, optIdx) => {
                            const selected = isOptionSelected(option.id);
                            const letter = OPTION_LETTERS[optIdx] || String(optIdx + 1);
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleOptionClick(option.id)}
                                    className={`w-full text-left px-3.5 py-3 md:px-4 md:py-3.5 rounded-xl border-2 transition-colors duration-150 flex items-center gap-3 group
                                        ${selected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    {/* Letter circle */}
                                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-colors duration-150
                                        ${selected
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                        }`}
                                    >
                                        {selected && question.type === 'SINGLE_CHOICE' ? (
                                            <CheckCircle2 size={18} />
                                        ) : (
                                            letter
                                        )}
                                    </div>
                                    {/* Option text */}
                                    <span className={`leading-relaxed flex-1 min-w-0 ${selected ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-700 dark:text-slate-300'} ${fontSizeClass}`}>
                                        <LatexRenderer content={option.content} />
                                    </span>
                                    {/* Multi-choice check indicator */}
                                    {question.type === 'MULTIPLE_CHOICE' && selected && (
                                        <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Short answer (single) */}
                {question.type === 'SHORT_ANSWER' && (
                    <div className="space-y-3">
                        {/* Info bar */}
                        <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-xs text-blue-700 dark:text-blue-300 font-medium">
                            <Info size={14} className="shrink-0 mt-0.5" />
                            <span>{i18n.t('exams:taking.shortAnswerInfo')}</span>
                        </div>

                        {/* LaTeX toolbar toggle */}
                        <button
                            type="button"
                            onClick={() => setShowLatexToolbar(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${showLatexToolbar
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                        >
                            <Sigma size={14} />
                            {showLatexToolbar ? i18n.t('exams:taking.hideLatex') : i18n.t('exams:taking.showLatex')}
                        </button>

                        {/* LaTeX quick-insert toolbar */}
                        {showLatexToolbar && (
                            <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                {LATEX_SNIPPETS_COMPACT.map((s, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        title={s.title}
                                        onClick={() => insertSnippet(s.insert)}
                                        className="px-2 py-1 text-xs font-mono font-medium bg-white dark:bg-slate-800
                                            text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600
                                            hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700
                                            dark:hover:bg-blue-900/20 dark:hover:text-blue-400
                                            transition-colors active:scale-95"
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <textarea
                            ref={textareaRef}
                            rows={3}
                            placeholder={i18n.t('exams:taking.answerPlaceholder')}
                            value={answer?.textAnswer || ''}
                            onChange={e => onAnswer(question.id, { textAnswer: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600
                                bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm md:text-base
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors
                                placeholder:text-slate-400 resize-none font-mono"
                        />
                        {answer?.textAnswer && answer.textAnswer.includes('$') && (
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
                                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <CheckCircle2 size={12} /> {i18n.t('exams:taking.preview')}
                                </p>
                                <div className="text-slate-900 dark:text-white text-sm md:text-base">
                                    <LatexRenderer content={answer.textAnswer} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Short answer multi-part */}
                {question.type === 'SHORT_ANSWER_MULTI' && (
                    <MultiPartAnswer
                        questionId={question.id}
                        answer={answer}
                        onAnswer={onAnswer}
                        fontSizeClass={fontSizeClass}
                    />
                )}
            </div>
        </div >
    );
});
QuestionCard.displayName = 'QuestionCard';

// ─── Multi-Part Answer Component ──────────────────────────
const PART_LETTERS = 'abcdefghijklmnopqrstuvwxyz';

const MultiPartAnswer = ({ questionId, answer, onAnswer, fontSizeClass }: {
    questionId: number;
    answer: LocalAnswer | undefined;
    onAnswer: (questionId: number, answer: LocalAnswer) => void;
    fontSizeClass: string;
}) => {
    const parts = answer?.textAnswers ?? [''];
    const [showLatex, setShowLatex] = useState(false);

    const updatePart = (idx: number, value: string) => {
        const next = [...parts];
        next[idx] = value;
        onAnswer(questionId, { textAnswers: next });
    };

    const addPart = () => {
        onAnswer(questionId, { textAnswers: [...parts, ''] });
    };

    const removePart = (idx: number) => {
        if (parts.length <= 1) return;
        const next = parts.filter((_, i) => i !== idx);
        onAnswer(questionId, { textAnswers: next });
    };

    const hasLatex = parts.some(p => p.includes('$'));

    return (
        <div className="space-y-3">
            {/* Info */}
            <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-xs text-blue-700 dark:text-blue-300 font-medium">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>{i18n.t('exams:taking.multiPartInfo')}</span>
            </div>

            {/* LaTeX toolbar */}
            <button
                type="button"
                onClick={() => setShowLatex(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${showLatex
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
            >
                <Sigma size={14} />
                {showLatex ? i18n.t('exams:taking.hideLatex') : i18n.t('exams:taking.showLatex')}
            </button>
            {showLatex && (
                <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    {LATEX_SNIPPETS_COMPACT.map((s, i) => (
                        <button
                            key={i}
                            type="button"
                            title={s.title}
                            className="px-2 py-1 text-xs font-mono font-medium bg-white dark:bg-slate-800
                                text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600
                                hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700
                                dark:hover:bg-blue-900/20 dark:hover:text-blue-400
                                transition-colors active:scale-95
                                cursor-copy"
                            onMouseDown={e => {
                                e.preventDefault();
                                const focused = document.activeElement as HTMLTextAreaElement | null;
                                if (focused?.tagName === 'TEXTAREA' && focused.dataset.partIdx) {
                                    const idx = Number(focused.dataset.partIdx);
                                    const val = parts[idx] || '';
                                    const start = focused.selectionStart;
                                    const end = focused.selectionEnd;
                                    const before = val.slice(0, start);
                                    const after = val.slice(end);
                                    const inMath = (before.split('$').length - 1) % 2 === 1;
                                    const inserted = inMath ? s.insert : `$${s.insert}$`;
                                    updatePart(idx, before + inserted + after);
                                    requestAnimationFrame(() => {
                                        focused.focus();
                                        const pos = start + inserted.length;
                                        focused.setSelectionRange(pos, pos);
                                    });
                                }
                            }}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Part inputs */}
            <div className="space-y-2">
                {parts.map((part, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                        <span className="w-8 h-10 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-bold shrink-0">
                            {PART_LETTERS[idx] || idx + 1})
                        </span>
                        <textarea
                            data-part-idx={idx}
                            rows={2}
                            placeholder={i18n.t('exams:listing.partPlaceholder', { label: PART_LETTERS[idx] || idx + 1 })}
                            value={part}
                            onChange={e => updatePart(idx, e.target.value)}
                            className={`flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600
                                bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors
                                placeholder:text-slate-400 resize-none font-mono ${fontSizeClass}`}
                        />
                        {parts.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removePart(idx)}
                                className="w-8 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add part button */}
            <button
                type="button"
                onClick={addPart}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
            >
                <Plus size={14} /> {i18n.t('exams:taking.addPart', { part: PART_LETTERS[parts.length] || String(parts.length + 1) })}
            </button>

            {/* Preview */}
            {hasLatex && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> {i18n.t('exams:taking.preview')}
                    </p>
                    {parts.filter(p => p.trim()).map((p, i) => (
                        <div key={i} className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-slate-500">{PART_LETTERS[i]})</span>
                            <div className="text-slate-900 dark:text-white text-sm">
                                <LatexRenderer content={p} />
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
};


// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export const ExamTakingPage = () => {
    const { slug, attemptId } = useParams<{ slug: string; attemptId: string }>();
    const navigate = useNavigate();
    const numericAttemptId = attemptId ? Number(attemptId) : null;

    const [examData, setExamData] = useState<StartExamResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, LocalAnswer>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showNav, setShowNav] = useState(false);
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0=sm, 1=base, 2=lg, 3=xl
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [cheatWarnings, setCheatWarnings] = useState(0);
    const actionLogger = useActionLogger();
    const { logDebounced } = actionLogger;

    const autoSubmitRef = useRef(false);
    // #4 fix: ref to always have latest answers for submit
    const answersRef = useRef(answers);
    useEffect(() => { answersRef.current = answers; }, [answers]);
    const { refreshUserProfile } = useAuth();



    useEffect(() => {
        if (!numericAttemptId) return;

        // Clean up old attempts to prevent taking up too much storage space
        cleanupOldAttempts(3);

        const cached = sessionStorage.getItem(`exam_session_${numericAttemptId}`);
        if (cached) {
            try {
                const data: StartExamResponse = JSON.parse(cached);
                setExamData(data);
                setAnswers(loadAnswers(numericAttemptId));
                actionLogger.log('EXAM_START', undefined, `attemptId=${numericAttemptId}`);
            } catch { /* fall through */ }
        }
        setLoading(false);
    }, [numericAttemptId]);

    // ─── Navigate with logging ───────────────────────
    const navigateToQuestion = useCallback((index: number | ((prev: number) => number), source?: string) => {
        setCurrentIndex(prev => {
            const next = typeof index === 'function' ? index(prev) : index;
            if (next !== prev) {
                actionLogger.log('NAVIGATE', undefined, `${prev + 1}→${next + 1}${source ? ` (${source})` : ''}`);
            }
            return next;
        });
    }, [actionLogger]);

    const timer = useCountdown(examData?.expiresAt || null);

    // ─── ANTI-CHEAT TRACKER & FULLSCREEN ───────────────
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !submitting && examData && timer.secondsLeft > 0) {
                setCheatWarnings(prev => prev + 1);
                actionLogger.log('TAB_SWITCH', undefined, 'Tab switched away');
                showToast(i18n.t('exams:taking.cheatWarning'), 'error');
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [submitting, examData, timer?.secondsLeft, cheatWarnings]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen().catch(() => { });
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // ─── Paste detection ─────────────────────────────
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
                const text = e.clipboardData?.getData('text/plain') || '';
                actionLogger.log('PASTE', undefined, text.length > 100 ? `${text.slice(0, 100)}…` : text);
            }
        };
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);
    // ───────────────────────────────────────────────────
    const timerStarted = useRef(false);
    const submitRef = useRef<((auto: boolean) => void) | undefined>(undefined);

    // Track when timer actually starts counting (not initial 0)
    useEffect(() => {
        if (timer.secondsLeft > 0) timerStarted.current = true;
    }, [timer.secondsLeft]);

    const handleAnswer = useCallback((questionId: number, answer: LocalAnswer) => {
        if (!numericAttemptId) return;
        logDebounced('ANSWER_CHANGE', questionId);
        setAnswers(prev => {
            const next = { ...prev, [questionId]: answer };
            saveAnswer(numericAttemptId, questionId, answer);
            return next;
        });
    }, [numericAttemptId, actionLogger]);

    const handleSubmit = useCallback(async (isAutoSubmit = false) => {
        if (!numericAttemptId || submitting) return;
        setSubmitting(true);
        try {
            // #4 fix: read from ref to always get latest answers
            const currentAnswers = { ...answersRef.current };
            const answerList = Object.entries(currentAnswers).map(([qId, a]) => ({
                questionId: Number(qId),
                selectedOptionIds: a.selectedOptionIds,
                textAnswer: a.textAnswer,
                textAnswers: a.textAnswers,
            }));
            actionLogger.log('EXAM_SUBMIT', undefined, isAutoSubmit ? 'auto' : 'manual');
            const confirmation = await examAttemptRepository.submitExam(numericAttemptId, {
                answers: answerList,
                actionLogs: actionLogger.getLogs(),
            });
            clearAnswers(numericAttemptId);
            sessionStorage.removeItem(`exam_session_${numericAttemptId}`);
            if (refreshUserProfile) {
                refreshUserProfile().catch(console.error);
            }
            showToast(isAutoSubmit ? i18n.t('exams:taking.autoSubmit') : i18n.t('exams:taking.submitSuccess'), isAutoSubmit ? 'info' : 'success');
            navigate(`/exams/${slug}/submitted/${numericAttemptId}`, {
                replace: true,
                state: {
                    submitStatus: confirmation.status,
                    requirePaperSubmission: confirmation.requirePaperSubmission,
                },
            });
        } catch (err: unknown) {
            const message = err instanceof ApiError ? err.message : i18n.t('exams:taking.submitFailed');
            showToast(message, 'error');
        } finally {
            setSubmitting(false);
            setShowSubmitModal(false);
        }
    }, [numericAttemptId, submitting, slug, navigate]);

    // Keep ref in sync with latest handleSubmit
    useEffect(() => { submitRef.current = (auto: boolean) => handleSubmit(auto); }, [handleSubmit]);

    // Auto-submit when time expires
    useEffect(() => {
        if (timer.secondsLeft <= 0 && timerStarted.current && examData && !autoSubmitRef.current && !submitting) {
            autoSubmitRef.current = true;
            submitRef.current?.(true);
        }
    }, [timer.secondsLeft, examData, submitting]);

    const questions = examData?.exam.questions || [];
    const currentQuestion = questions[currentIndex];
    const answeredCount = countAnswered(answers);

    // ─── Loading ─────────────────────────────
    if (loading) return <ExamTakingSkeleton />;

    // ─── Invalid session ─────────────────────
    if (!examData || !currentQuestion) {
        return (
            <div className="min-h-screen pt-20 pb-16 flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
                <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg max-w-sm w-full">
                    <AlertTriangle size={40} className="mx-auto text-amber-500 mb-3" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{i18n.t('exams:taking.invalidSession')}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{i18n.t('exams:taking.invalidSessionDesc')}</p>
                    <button onClick={() => navigate(slug ? `/exams/${slug}` : '/competitions')} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
                        {i18n.t('exams:taking.goBackNav')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans">

            {/* ─── Top Header Bar ─────────────────────── */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 md:h-[60px] flex items-center justify-between gap-3">
                    {/* Left: Exam title */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate">
                            {examData.exam.title}
                        </h1>
                    </div>

                    {/* Center: Timer */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-mono text-sm md:text-base font-bold tracking-wide transition-colors
                        ${timer.isCritical
                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                            : timer.isUrgent
                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                        }`}
                    >
                        <Clock size={14} className={timer.isCritical ? 'animate-bounce' : ''} />
                        {timer.formatted}
                    </div>

                    {/* Right: Progress + Submit + Nav toggle */}
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        {/* Font Size Toggle */}
                        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                            <button onClick={() => setFontSizeLevel(Math.max(0, fontSizeLevel - 1))} className="p-1 rounded text-slate-500 hover:bg-white dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors" title={i18n.t('exams:taking.decreaseFontSize')}><Type size={14} /></button>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">{fontSizeLevel + 1}</span>
                            <button onClick={() => setFontSizeLevel(Math.min(3, fontSizeLevel + 1))} className="p-1 rounded text-slate-500 hover:bg-white dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors" title={i18n.t('exams:taking.increaseFontSize')}><Type size={16} /></button>
                        </div>
                        {/* Fullscreen Toggle */}
                        <button onClick={toggleFullscreen} className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors" title={isFullscreen ? i18n.t('exams:taking.exitFullscreen') : i18n.t('exams:taking.fullscreen')}>
                            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <CheckCircle2 size={14} className="text-blue-500" />
                            {answeredCount}/{questions.length}
                        </span>
                        <button
                            onClick={() => setShowNav(!showNav)}
                            className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <List size={18} className="text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-0.5 bg-slate-100 dark:bg-slate-700">
                    <div
                        className="h-full bg-blue-500 transition-[width] duration-500 ease-out"
                        style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* ─── Main Content ────────────────────────── */}
            <div className="pt-[60px] md:pt-[64px] pb-[72px] md:pb-[80px]">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
                    <div className="flex gap-5 lg:gap-6">

                        {/* ─── Question Area (Left) ──────────── */}
                        <div className="flex-1 min-w-0">
                            <div
                                key={currentIndex}
                                className="animate-fade-in-up"
                                style={{ animationDuration: '0.15s' }}
                            >
                                <QuestionCard
                                    question={currentQuestion}
                                    index={currentIndex}
                                    answer={answers[currentQuestion.id]}
                                    onAnswer={handleAnswer}
                                    isFlagged={flagged.has(currentQuestion.id)}
                                    onToggleFlag={(qId) => {
                                        const wasF = flagged.has(qId);
                                        setFlagged(prev => { const n = new Set(prev); if (n.has(qId)) n.delete(qId); else n.add(qId); return n; });
                                    }}
                                    fontSizeClass={['text-sm', 'text-base', 'text-lg', 'text-xl'][fontSizeLevel]}
                                />
                            </div>
                        </div>

                        {/* ─── Sidebar (Desktop) ─────────────── */}
                        <div className="hidden lg:block w-[260px] xl:w-[280px] shrink-0">
                            <div className="sticky top-[76px]">
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                    {/* Sidebar header */}
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{i18n.t('exams:taking.questionList')}</h3>
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {answeredCount}/{questions.length}
                                        </span>
                                    </div>

                                    {/* Question grid */}
                                    <div className="p-3">
                                        <div className="grid grid-cols-6 gap-1.5">
                                            {questions.map((q, i) => {
                                                const a = answers[q.id];
                                                const isAnswered = !!(a?.selectedOptionIds?.length || a?.textAnswer?.trim() || a?.textAnswers?.some(t => t.trim()));
                                                const isCurrent = i === currentIndex;
                                                const isFlag = flagged.has(q.id);
                                                return (
                                                    <button
                                                        key={q.id}
                                                        onClick={() => navigateToQuestion(i, 'sidebar')}
                                                        className={`w-full aspect-square rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center relative
                                                            ${isCurrent
                                                                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300 dark:ring-blue-500 scale-105'
                                                                : isFlag
                                                                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                                                    : isAnswered
                                                                        ? 'bg-blue-500 text-white'
                                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                            }`}
                                                    >
                                                        {i + 1}
                                                        {isFlag && isAnswered && !isCurrent && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 space-y-2 text-xs">
                                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded bg-blue-500" />
                                                {i18n.t('exams:taking.answeredLabel')}
                                            </span>
                                            <span className="font-bold text-slate-900 dark:text-white">{answeredCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-600" />
                                                {i18n.t('exams:taking.notAnsweredLabel')}
                                            </span>
                                            <span className="font-bold text-slate-900 dark:text-white">{questions.length - answeredCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-amber-600 dark:text-amber-500">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 dark:bg-amber-900/40 dark:border-amber-700" />
                                                {i18n.t('exams:taking.flagLabel')}
                                            </span>
                                            <span className="font-bold">{flagged.size}</span>
                                        </div>
                                    </div>

                                    {/* Submit button */}
                                    <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            onClick={() => setShowSubmitModal(true)}
                                            className="w-full py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-colors"
                                        >
                                            <Send size={14} /> {i18n.t('exams:taking.submitExam')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ─── Mobile Sidebar Drawer ──────────── */}
                        {showNav && (
                            <div className="fixed inset-0 z-[60] lg:hidden" onClick={() => setShowNav(false)}>
                                <div
                                    className="absolute inset-0 bg-black/40 animate-fade-in-up"
                                    style={{ animationDuration: '0.15s' }}
                                />
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col animate-slide-in-right"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {/* Drawer header */}
                                    <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{i18n.t('exams:taking.questionList')}</h3>
                                        <button onClick={() => setShowNav(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <X size={18} className="text-slate-500" />
                                        </button>
                                    </div>

                                    {/* Drawer grid */}
                                    <div className="flex-1 overflow-y-auto p-4">
                                        <div className="grid grid-cols-5 gap-2">
                                            {questions.map((q, i) => {
                                                const a = answers[q.id];
                                                const isAnswered = !!(a?.selectedOptionIds?.length || a?.textAnswer?.trim() || a?.textAnswers?.some(t => t.trim()));
                                                const isCurrent = i === currentIndex;
                                                const isFlag = flagged.has(q.id);
                                                return (
                                                    <button
                                                        key={q.id}
                                                        onClick={() => { navigateToQuestion(i, 'mobile-nav'); setShowNav(false); }}
                                                        className={`w-full aspect-square rounded-lg text-sm font-bold transition-colors flex items-center justify-center relative
                                                                ${isCurrent
                                                                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                                                : isFlag
                                                                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                                                    : isAnswered
                                                                        ? 'bg-blue-500 text-white'
                                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        {i + 1}
                                                        {isFlag && isAnswered && !isCurrent && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Stats */}
                                        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2 text-xs">
                                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500" /> {i18n.t('exams:taking.answeredLabel')}</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{answeredCount}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-600" /> {i18n.t('exams:taking.notAnsweredLabel')}</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{questions.length - answeredCount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Drawer submit */}
                                    <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            onClick={() => { setShowNav(false); setShowSubmitModal(true); }}
                                            className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-colors"
                                        >
                                            <Send size={16} /> {i18n.t('exams:taking.submitExam')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Bottom Navigation Bar ───────────────── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-safe">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
                    <button
                        onClick={() => navigateToQuestion(i => Math.max(0, i - 1), 'prev')}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm font-semibold
                            bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors
                            disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} /> <span className="hidden sm:inline">{i18n.t('exams:taking.prevQuestion')}</span>
                    </button>

                    {/* Center: current / total */}
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                        <span className="text-blue-600 dark:text-blue-400">{currentIndex + 1}</span>
                        <span className="text-slate-400 dark:text-slate-500">/</span>
                        <span className="text-slate-500 dark:text-slate-400">{questions.length}</span>
                    </div>

                    <button
                        onClick={() => navigateToQuestion(i => Math.min(questions.length - 1, i + 1), 'next')}
                        disabled={currentIndex >= questions.length - 1}
                        className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm font-semibold
                            bg-blue-600 text-white hover:bg-blue-700 transition-colors
                            disabled:opacity-40 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        <span className="hidden sm:inline">{i18n.t('exams:taking.nextQuestion')}</span> <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <SubmitConfirmModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onConfirm={() => handleSubmit(false)}
                isLoading={submitting}
                totalQuestions={questions.length}
                answeredCount={answeredCount}
            />
        </div>
    );
};