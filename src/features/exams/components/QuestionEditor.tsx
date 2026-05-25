import { useState, useCallback, useRef, Fragment, type ElementType } from 'react';
import {
    X, Plus, Trash2, Eye, CircleDot, SquareCheck, TextCursorInput, Check,
    BookOpen, ChevronDown, ChevronUp, ListOrdered,
} from 'lucide-react';
import { LatexRenderer } from './LatexRenderer';
import { LATEX_SNIPPETS } from '@/features/exams/utils/latexSnippets';
import i18n from '@/i18n';
import type { QuestionType, CreateQuestionRequest, QuestionOption, Question, Subject } from '@/features/exams/types/exam.types';

// LaTeX snippets imported from shared latexSnippets.ts

const CHEAT_SHEET = [
    { syntax: '$x^2$', result: 'x²', desc: i18n.t('exams:editor.cheatPower') },
    { syntax: '$\\frac{a}{b}$', result: 'a/b', desc: i18n.t('exams:editor.cheatFraction') },
    { syntax: '$\\sqrt{x}$', result: '√x', desc: i18n.t('exams:editor.cheatSqrt2') },
    { syntax: '$\\sqrt[n]{x}$', result: 'ⁿ√x', desc: i18n.t('exams:editor.cheatSqrtN') },
    { syntax: '$\\sum_{i=1}^{n}$', result: 'Σ', desc: i18n.t('exams:editor.cheatSum') },
    { syntax: '$\\int_a^b$', result: '∫', desc: i18n.t('exams:editor.cheatIntegral') },
    { syntax: '$\\pi, \\alpha, \\beta$', result: 'π, α, β', desc: i18n.t('exams:editor.cheatGreek') },
    { syntax: '$\\vec{v}$', result: 'v⃗', desc: i18n.t('exams:editor.cheatVector') },
    { syntax: '$\\overline{AB}$', result: 'AB̄', desc: i18n.t('exams:editor.cheatSegment') },
    { syntax: '$\\angle ABC$', result: '∠ABC', desc: i18n.t('exams:editor.cheatAngle') },
    { syntax: '$$...$$', result: i18n.t('exams:editor.cheatDisplayResult'), desc: i18n.t('exams:editor.cheatDisplayBlock') },
];

interface QuestionEditorProps {
    initialData?: Question;
    subjectId?: number;       // pre-filled (e.g. from active filter)
    subjects: Subject[];      // list for dropdown
    onSave: (data: CreateQuestionRequest) => void;
    onCancel: () => void;
    saving?: boolean;
}

const typeOptions: { value: QuestionType; label: string; icon: ElementType; desc: string }[] = [
    { value: 'SINGLE_CHOICE', label: i18n.t('exams:typeLabels.singleChoice'), icon: CircleDot, desc: i18n.t('exams:editor.singleChoiceDesc') },
    { value: 'MULTIPLE_CHOICE', label: i18n.t('exams:typeLabels.multipleChoice'), icon: SquareCheck, desc: i18n.t('exams:editor.multipleChoiceDesc') },
    { value: 'SHORT_ANSWER', label: i18n.t('exams:typeLabels.shortAnswer'), icon: TextCursorInput, desc: i18n.t('exams:editor.shortAnswerDesc') },
    { value: 'SHORT_ANSWER_MULTI', label: i18n.t('exams:typeLabels.shortAnswerMulti'), icon: ListOrdered, desc: i18n.t('exams:editor.shortAnswerMultiDesc') },
];

const ANSWER_LABELS = 'abcdefghijklmnopqrstuvwxyz';

const DEFAULT_OPTIONS: Omit<QuestionOption, 'id'>[] = [
    { label: 'A', content: '', isCorrect: false },
    { label: 'B', content: '', isCorrect: false },
    { label: 'C', content: '', isCorrect: false },
    { label: 'D', content: '', isCorrect: false },
];

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const QuestionEditor = ({
    initialData,
    subjectId,
    subjects,
    onSave,
    onCancel,
    saving = false,
}: QuestionEditorProps) => {
    const [type, setType] = useState<QuestionType>(initialData?.type ?? 'SINGLE_CHOICE');
    const [content, setContent] = useState(initialData?.content ?? '');
    const [explanation, setExplanation] = useState(initialData?.explanation ?? '');
    const [points, setPoints] = useState(initialData?.points ?? 1);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>(initialData?.subjectId ?? subjectId ?? '');
    const [options, setOptions] = useState<Omit<QuestionOption, 'id'>[]>(
        initialData?.options?.map(o => ({ label: o.label, content: o.content, isCorrect: o.isCorrect }))
        ?? [...DEFAULT_OPTIONS]
    );
    const [correctAnswer, setCorrectAnswer] = useState(initialData?.correctAnswer ?? '');
    const [correctAnswers, setCorrectAnswers] = useState<string[]>(initialData?.correctAnswers ?? ['']);
    const [showPreview, setShowPreview] = useState(true);
    const [showCheatSheet, setShowCheatSheet] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const correctAnswerRef = useRef<HTMLTextAreaElement>(null);
    const multiAnswerRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

    // Generic LaTeX snippet inserter for any textarea
    const insertAtCursor = useCallback((ref: React.RefObject<HTMLTextAreaElement | null>, currentValue: string, setValue: (v: string) => void, snippet: string) => {
        const ta = ref.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = currentValue.slice(0, start);
        const after = currentValue.slice(end);
        const inMath = (before.split('$').length - 1) % 2 === 1;
        const inserted = inMath ? snippet : `$${snippet}$`;
        setValue(before + inserted + after);
        requestAnimationFrame(() => {
            ta.focus();
            const pos = start + inserted.length;
            ta.setSelectionRange(pos, pos);
        });
    }, []);

    // Insert LaTeX snippet at cursor position (content textarea)
    const insertSnippet = useCallback((snippet: string) => {
        insertAtCursor(textareaRef, content, setContent, snippet);
    }, [content, insertAtCursor]);

    // Insert LaTeX snippet for correctAnswer field
    const insertCorrectAnswerSnippet = useCallback((snippet: string) => {
        insertAtCursor(correctAnswerRef, correctAnswer, setCorrectAnswer, snippet);
    }, [correctAnswer, insertAtCursor]);

    // Insert LaTeX snippet for multi-answer field at index
    const insertMultiAnswerSnippet = useCallback((index: number, snippet: string) => {
        const ref = { current: multiAnswerRefs.current[index] };
        const currentVal = correctAnswers[index] || '';
        insertAtCursor(ref, currentVal, (v) => {
            setCorrectAnswers(prev => { const next = [...prev]; next[index] = v; return next; });
        }, snippet);
    }, [correctAnswers, insertAtCursor]);

    // ─── Option handlers ─────────────────────────────────

    const updateOption = useCallback((index: number, field: keyof Omit<QuestionOption, 'id'>, value: string | boolean) => {
        setOptions(prev => {
            const updated = [...prev];
            if (field === 'isCorrect' && type === 'SINGLE_CHOICE') {
                // For single choice, only one can be correct
                updated.forEach((o, i) => {
                    updated[i] = { ...o, isCorrect: i === index };
                });
            } else {
                updated[index] = { ...updated[index], [field]: value };
            }
            return updated;
        });
    }, [type]);

    const addOption = useCallback(() => {
        setOptions(prev => [
            ...prev,
            { label: LABELS[prev.length] || `${prev.length + 1}`, content: '', isCorrect: false },
        ]);
    }, []);

    const removeOption = useCallback((index: number) => {
        setOptions(prev => {
            const updated = prev.filter((_, i) => i !== index);
            // Re-label
            return updated.map((o, i) => ({ ...o, label: LABELS[i] || `${i + 1}` }));
        });
    }, []);

    // ─── Submit ──────────────────────────────────────────

    const handleSubmit = () => {
        if (!content.trim() || !selectedSubjectId) return;

        const data: CreateQuestionRequest = {
            type,
            content: content.trim(),
            explanation: explanation.trim() || undefined,
            points,
            subjectId: Number(selectedSubjectId),
        };

        if (type === 'SHORT_ANSWER') {
            data.correctAnswer = correctAnswer.trim();
        } else if (type === 'SHORT_ANSWER_MULTI') {
            data.correctAnswers = correctAnswers.map(a => a.trim()).filter(Boolean);
        } else {
            data.options = options.map(o => ({
                label: o.label,
                content: o.content,
                isCorrect: o.isCorrect,
            }));
        }

        onSave(data);
    };

    const isValid = content.trim() && selectedSubjectId && (
        type === 'SHORT_ANSWER'
            ? correctAnswer.trim()
            : type === 'SHORT_ANSWER_MULTI'
                ? correctAnswers.some(a => a.trim())
                : options.some(o => o.isCorrect) && options.every(o => o.content.trim())
    );

    return (
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-neutral-800">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {initialData ? i18n.t('exams:editor.editTitle') : i18n.t('exams:editor.addTitle')}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`p-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5 ${showPreview
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-neutral-800'
                            }`}
                    >
                        <Eye size={15} />
                        {i18n.t('exams:editor.preview')}
                    </button>
                    <button onClick={onCancel} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="p-5 space-y-5">
                {/* Subject selector — bắt buộc */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {i18n.t('exams:editor.subjectLabel')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selectedSubjectId}
                        onChange={e => setSelectedSubjectId(e.target.value ? Number(e.target.value) : '')}
                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border rounded-xl text-sm outline-none
                            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors
                            appearance-none cursor-pointer dark:text-white
                            ${!selectedSubjectId ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-neutral-700'}`}
                    >
                        <option value="">{i18n.t('exams:editor.selectSubject')}</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    {!selectedSubjectId && (
                        <p className="mt-1 text-xs text-red-500">{i18n.t('exams:editor.subjectRequired')}</p>
                    )}
                </div>

                {/* Question type selector */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {i18n.t('exams:editor.questionType')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {typeOptions.map(opt => {
                            const Icon = opt.icon;
                            const active = type === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setType(opt.value)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${active
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                                        }`}
                                >
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${active
                                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-slate-400'
                                        }`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-medium ${active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {opt.label}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content & Preview side-by-side on desktop */}
                <div>
                    {/* Label row */}
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {i18n.t('exams:editor.contentLabel')}
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowCheatSheet(v => !v)}
                            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400
                                hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2.5 py-1 rounded-lg transition-colors"
                        >
                            <BookOpen size={14} />
                            {i18n.t('exams:editor.latexSyntax')}
                            {showCheatSheet ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>

                    {/* Cheat sheet */}
                    {showCheatSheet && (
                        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wide">{i18n.t('exams:editor.latexCheatSheet')}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                {CHEAT_SHEET.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-white dark:bg-neutral-800 rounded-lg border border-blue-100 dark:border-blue-800/20">
                                        <code className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0 truncate max-w-[90px]">{item.syntax}</code>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">→</span>
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2" dangerouslySetInnerHTML={{ __html: i18n.t('exams:editor.latexUsageHint') }} />
                        </div>
                    )}

                    {/* LaTeX quick-insert toolbar */}
                    <div className="flex flex-wrap gap-1 mb-2">
                        {LATEX_SNIPPETS.map((group, gi) => (
                            <Fragment key={gi}>
                                {group.map((s, si) => (
                                    <button
                                        key={si}
                                        type="button"
                                        title={s.title}
                                        onClick={() => insertSnippet(s.insert)}
                                        className="px-2.5 py-1.5 text-sm font-medium font-mono bg-slate-100 dark:bg-neutral-800
                                            text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-neutral-700
                                            hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700
                                            dark:hover:bg-blue-900/20 dark:hover:border-blue-700 dark:hover:text-blue-400
                                            transition-colors duration-150 active:scale-95"
                                    >
                                        {s.label}
                                    </button>
                                ))}
                                {gi < LATEX_SNIPPETS.length - 1 && (
                                    <div className="w-px h-6 bg-slate-200 dark:bg-neutral-700 self-center mx-0.5" />
                                )}
                            </Fragment>
                        ))}
                    </div>

                    {/* Textarea + live preview */}
                    <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={4}
                            placeholder={i18n.t('exams:editor.contentPlaceholder')}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700
                                rounded-xl text-base text-slate-800 dark:text-slate-200 placeholder-slate-400
                                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-colors font-mono"
                        />
                        {showPreview && (
                            <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{i18n.t('exams:editor.previewLabel')}</p>
                                <div className="text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                                    {content ? <LatexRenderer content={content} /> : <span className="text-slate-400 italic">{i18n.t('exams:editor.noContent')}</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Answer options (for choice types) */}
                {(type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {type === 'SINGLE_CHOICE' ? i18n.t('exams:editor.answersSingle') : i18n.t('exams:editor.answersMultiple')}
                        </label>
                        <div className="space-y-2">
                            {options.map((option, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    {/* Correct toggle */}
                                    <button
                                        type="button"
                                        onClick={() => updateOption(idx, 'isCorrect', !option.isCorrect)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${option.isCorrect
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-slate-300 dark:border-neutral-600 text-transparent hover:border-emerald-400'
                                            }`}
                                        title={option.isCorrect ? i18n.t('exams:editor.correctAnswer') : i18n.t('exams:editor.markCorrect')}
                                    >
                                        <Check size={14} />
                                    </button>

                                    {/* Label */}
                                    <span className="w-7 text-center text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {option.label}
                                    </span>

                                    {/* Content input */}
                                    <input
                                        type="text"
                                        value={option.content}
                                        onChange={e => updateOption(idx, 'content', e.target.value)}
                                        placeholder={i18n.t('exams:editor.answerPlaceholder', { label: option.label })}
                                        className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700
                                            rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400
                                            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors"
                                    />

                                    {/* Remove (if > 2 options) */}
                                    {options.length > 2 && (
                                        <button
                                            onClick={() => removeOption(idx)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {options.length < 8 && (
                                <button
                                    onClick={addOption}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400
                                        hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors w-full justify-center
                                        border border-dashed border-blue-300 dark:border-blue-800"
                                >
                                    <Plus size={16} />
                                    {i18n.t('exams:editor.addAnswer')}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Short answer input with LaTeX support */}
                {type === 'SHORT_ANSWER' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {i18n.t('exams:editor.correctAnswerLabel')} <span className="text-xs text-slate-400">{i18n.t('exams:editor.latexSupport')}</span>
                        </label>
                        {/* LaTeX toolbar for correct answer */}
                        <div className="flex flex-wrap gap-1 mb-2">
                            {LATEX_SNIPPETS.map((group, gi) => (
                                <Fragment key={gi}>
                                    {group.map((s, si) => (
                                        <button
                                            key={si}
                                            type="button"
                                            title={s.title}
                                            onClick={() => insertCorrectAnswerSnippet(s.insert)}
                                            className="px-2 py-1 text-xs font-medium font-mono bg-slate-100 dark:bg-neutral-800
                                                text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-neutral-700
                                                hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700
                                                dark:hover:bg-blue-900/20 dark:hover:border-blue-700 dark:hover:text-blue-400
                                                transition-colors duration-150 active:scale-95"
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                    {gi < LATEX_SNIPPETS.length - 1 && (
                                        <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700 self-center mx-0.5" />
                                    )}
                                </Fragment>
                            ))}
                        </div>
                        <div className={`grid gap-3 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                            <textarea
                                ref={correctAnswerRef}
                                rows={2}
                                value={correctAnswer}
                                onChange={e => setCorrectAnswer(e.target.value)}
                                placeholder={i18n.t('exams:editor.correctAnswerPlaceholder')}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700
                                    rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400
                                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-colors font-mono"
                            />
                            {showPreview && correctAnswer.trim() && (
                                <div className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{i18n.t('exams:editor.previewLabel')}</p>
                                    <div className="text-sm text-slate-800 dark:text-slate-200">
                                        <LatexRenderer content={correctAnswer} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Multi-part short answer with LaTeX support */}
                {type === 'SHORT_ANSWER_MULTI' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {i18n.t('exams:editor.correctAnswerLabel')} <span className="text-xs text-slate-400">{i18n.t('exams:editor.latexSupportMulti')}</span>
                        </label>
                        <div className="space-y-3">
                            {correctAnswers.map((ans, idx) => (
                                <div key={idx} className="border border-slate-200 dark:border-neutral-700 rounded-xl p-3 bg-slate-50/50 dark:bg-neutral-800/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {ANSWER_LABELS[idx] || `${idx + 1}`})
                                        </span>
                                        {correctAnswers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setCorrectAnswers(prev => prev.filter((_, i) => i !== idx))}
                                                className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    {/* LaTeX toolbar per answer */}
                                    <div className="flex flex-wrap gap-0.5 mb-1.5">
                                        {LATEX_SNIPPETS.flat().slice(0, 12).map((s, si) => (
                                            <button
                                                key={si}
                                                type="button"
                                                title={s.title}
                                                onClick={() => insertMultiAnswerSnippet(idx, s.insert)}
                                                className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-neutral-800
                                                    text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-neutral-700
                                                    hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400
                                                    transition-colors active:scale-95"
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className={`grid gap-2 ${showPreview && ans.trim() ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                                        <textarea
                                            ref={el => { multiAnswerRefs.current[idx] = el; }}
                                            rows={1}
                                            value={ans}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setCorrectAnswers(prev => { const n = [...prev]; n[idx] = val; return n; });
                                            }}
                                            placeholder={i18n.t('exams:editor.multiAnswerPlaceholder', { label: ANSWER_LABELS[idx] || String(idx + 1) })}
                                            className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700
                                                rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400
                                                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-colors font-mono"
                                        />
                                        {showPreview && ans.trim() && (
                                            <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700">
                                                <p className="text-[10px] font-medium text-slate-400 mb-1">{i18n.t('exams:editor.previewLabel')}</p>
                                                <div className="text-sm text-slate-800 dark:text-slate-200">
                                                    <LatexRenderer content={ans} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {correctAnswers.length < 10 && (
                                <button
                                    type="button"
                                    onClick={() => setCorrectAnswers(prev => [...prev, ''])}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400
                                        hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors w-full justify-center
                                        border border-dashed border-blue-300 dark:border-blue-800"
                                >
                                    <Plus size={16} />
                                    {i18n.t('exams:editor.addAnswer')}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Points + Explanation row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {i18n.t('exams:editor.points')}
                        </label>
                        <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={points}
                            onChange={e => setPoints(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700
                                rounded-xl text-sm text-slate-800 dark:text-slate-200
                                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {i18n.t('exams:editor.explanation')} <span className="text-xs text-slate-400">{i18n.t('exams:editor.optional')}</span>
                        </label>
                        <input
                            type="text"
                            value={explanation}
                            onChange={e => setExplanation(e.target.value)}
                            placeholder={i18n.t('exams:editor.explanationPlaceholder')}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700
                                rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400
                                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950">
                <button
                    onClick={onCancel}
                    className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                    {i18n.t('exams:editor.cancel')}
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!isValid || saving}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                        disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
                >
                    {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {initialData ? i18n.t('exams:editor.update') : i18n.t('exams:editor.addQuestion')}
                </button>
            </div>
        </div>
    );
};
