import { useState, useCallback, useRef, useMemo, Fragment, type DragEvent } from 'react';
import {
    X, Upload, FileText, AlertTriangle, Check, Loader2,
    Trash2, ChevronDown, ChevronUp, Plus, Minus,
    CircleCheck, CircleX,
} from 'lucide-react';
import { LatexRenderer } from './LatexRenderer';
import i18n from '@/i18n';
import type { CreateQuestionRequest, DocxImportResponse, QuestionType } from '@/features/exams/types/exam.types';

interface DocxImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File) => Promise<DocxImportResponse | null>;
    onConfirm: (questions: CreateQuestionRequest[]) => Promise<void>;
    importing?: boolean;
}

type Step = 'upload' | 'processing' | 'preview';

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
    SINGLE_CHOICE: i18n.t('exams:typeLabels.singleChoice'),
    MULTIPLE_CHOICE: i18n.t('exams:typeLabels.multipleChoice'),
    SHORT_ANSWER: i18n.t('exams:typeLabels.shortAnswer'),
    SHORT_ANSWER_MULTI: i18n.t('exams:typeLabels.shortAnswerMulti'),
};

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
    { value: 'SINGLE_CHOICE', label: i18n.t('exams:typeLabels.singleChoice') },
    { value: 'MULTIPLE_CHOICE', label: i18n.t('exams:typeLabels.multipleChoice') },
    { value: 'SHORT_ANSWER', label: i18n.t('exams:typeLabels.shortAnswer') },
];

export const DocxImportModal = ({
    isOpen,
    onClose,
    onImport,
    onConfirm,
    importing = false,
}: DocxImportModalProps) => {
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<DocxImportResponse | null>(null);
    const [questions, setQuestions] = useState<CreateQuestionRequest[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [warningsDismissed, setWarningsDismissed] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const reset = useCallback(() => {
        setStep('upload');
        setFile(null);
        setResult(null);
        setQuestions([]);
        setDragActive(false);
        setConfirming(false);
        setExpandedIdx(null);
        setWarningsDismissed(false);
    }, []);

    const handleClose = () => { reset(); onClose(); };

    const handleFile = useCallback(async (selectedFile: File) => {
        if (!selectedFile.name.endsWith('.docx')) return;
        setFile(selectedFile);
        setStep('processing');

        const response = await onImport(selectedFile);
        if (response) {
            setResult(response);
            setQuestions(response.questions);
            setStep('preview');
        } else {
            setStep('upload');
            setFile(null);
        }
    }, [onImport]);

    const handleDrop = useCallback((e: DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) handleFile(droppedFile);
    }, [handleFile]);

    const handleConfirm = async () => {
        setConfirming(true);
        await onConfirm(questions);
        setConfirming(false);
        handleClose();
    };

    // ─── Question Editing Helpers ─────────────────────────

    const updateQuestion = useCallback((idx: number, updates: Partial<CreateQuestionRequest>) => {
        setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, ...updates } : q));
    }, []);

    const removeQuestion = useCallback((idx: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== idx));
        if (expandedIdx === idx) setExpandedIdx(null);
        else if (expandedIdx !== null && expandedIdx > idx) setExpandedIdx(expandedIdx - 1);
    }, [expandedIdx]);

    const toggleOption = useCallback((qIdx: number, optIdx: number) => {
        setQuestions(prev => prev.map((q, qi) => {
            if (qi !== qIdx || !q.options) return q;
            const isMulti = q.type === 'MULTIPLE_CHOICE';
            const newOptions = q.options.map((o, oi) => ({
                ...o,
                isCorrect: isMulti
                    ? (oi === optIdx ? !o.isCorrect : o.isCorrect)    // multi: toggle
                    : (oi === optIdx),                                 // single: radio
            }));
            return { ...q, options: newOptions };
        }));
    }, []);

    const updateOptionContent = useCallback((qIdx: number, optIdx: number, content: string) => {
        setQuestions(prev => prev.map((q, qi) => {
            if (qi !== qIdx || !q.options) return q;
            return { ...q, options: q.options.map((o, oi) => oi === optIdx ? { ...o, content } : o) };
        }));
    }, []);

    const addOption = useCallback((qIdx: number) => {
        setQuestions(prev => prev.map((q, qi) => {
            if (qi !== qIdx || !q.options) return q;
            const nextLabel = String.fromCharCode(65 + q.options.length); // A, B, C ...
            return { ...q, options: [...q.options, { label: nextLabel, content: '', isCorrect: false }] };
        }));
    }, []);

    const removeOption = useCallback((qIdx: number, optIdx: number) => {
        setQuestions(prev => prev.map((q, qi) => {
            if (qi !== qIdx || !q.options) return q;
            return { ...q, options: q.options.filter((_, oi) => oi !== optIdx) };
        }));
    }, []);

    // Count questions with issues (no correct answer marked)
    const issueCount = useMemo(() => {
        return questions.filter(q => {
            if (q.type === 'SHORT_ANSWER') return !q.correctAnswer?.trim();
            return !q.options?.some(o => o.isCorrect);
        }).length;
    }, [questions]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[72px] p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl
                border border-slate-200 dark:border-neutral-800 overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-neutral-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                            <Upload size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Smart Import – Word to JSON</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {step === 'upload' && i18n.t('exams:docxImport.uploadDesc')}
                                {step === 'processing' && i18n.t('exams:docxImport.processing')}
                                {step === 'preview' && i18n.t('exams:docxImport.previewCount', { count: questions.length })}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Step indicator */}
                {step !== 'upload' && (
                    <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 dark:bg-neutral-950 border-b border-slate-100 dark:border-neutral-800 shrink-0">
                        {(['upload', 'processing', 'preview'] as Step[]).map((s, i) => (
                            <Fragment key={s}>
                                <div className={`flex items-center gap-1.5 text-xs font-medium ${step === s ? 'text-blue-600 dark:text-blue-400'
                                    : (['upload', 'processing'].indexOf(step) < i ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400')
                                    }`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-blue-600 text-white'
                                        : (['upload', 'processing'].indexOf(step) < i ? 'bg-slate-200 dark:bg-neutral-700 text-slate-500' : 'bg-emerald-500 text-white')
                                        }`}>{i + 1}</div>
                                    {s === 'upload' ? i18n.t('exams:docxImport.stepUpload') : s === 'processing' ? i18n.t('exams:docxImport.stepAnalyze') : i18n.t('exams:docxImport.stepEditConfirm')}
                                </div>
                                {i < 2 && <div className="flex-1 h-px bg-slate-200 dark:bg-neutral-700" />}
                            </Fragment>
                        ))}
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Step 1: Upload */}
                    {step === 'upload' && (
                        <div className="p-6">
                            <div
                                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl
                                    cursor-pointer transition-colors duration-200 ${dragActive
                                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                                        : 'border-slate-200 dark:border-neutral-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-neutral-800'
                                    }`}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${dragActive
                                    ? 'bg-blue-100 dark:bg-blue-900/30'
                                    : 'bg-slate-100 dark:bg-neutral-800'
                                    }`}>
                                    <FileText size={28} className={dragActive ? 'text-blue-600' : 'text-slate-400'} />
                                </div>
                                <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    {dragActive ? i18n.t('exams:docxImport.dropHere') : i18n.t('exams:docxImport.dragOrClick')}
                                </p>
                                <p className="text-sm text-slate-400 dark:text-slate-500">
                                    {i18n.t('exams:docxImport.supportDocx')}
                                </p>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".docx"
                                    className="hidden"
                                    onChange={e => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFile(f);
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Processing */}
                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-20 px-6">
                            <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                            <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">
                                {i18n.t('exams:docxImport.analyzing')}
                            </p>
                            <p className="text-sm text-slate-400">{file?.name}</p>
                        </div>
                    )}

                    {/* Step 3: Interactive Preview & Edit */}
                    {step === 'preview' && (
                        <div className="p-6 space-y-4">
                            {/* Warnings */}
                            {result?.warnings && result.warnings.length > 0 && !warningsDismissed && (
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                    <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">{i18n.t('exams:docxImport.warningTitle')}</p>
                                        <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-0.5 list-disc ml-4">
                                            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                    <button onClick={() => setWarningsDismissed(true)} className="p-1 rounded hover:bg-amber-200/50 transition-colors shrink-0">
                                        <X size={14} className="text-amber-600" />
                                    </button>
                                </div>
                            )}

                            {/* Issue summary */}
                            {issueCount > 0 && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/50 text-sm">
                                    <CircleX size={16} className="text-red-500 shrink-0" />
                                    <span className="text-red-700 dark:text-red-400">
                                        <span dangerouslySetInnerHTML={{ __html: i18n.t('exams:docxImport.issueCount', { count: issueCount }) }} />
                                    </span>
                                </div>
                            )}

                            {/* Question list */}
                            <div className="space-y-2">
                                {questions.map((q, idx) => {
                                    const isExpanded = expandedIdx === idx;
                                    const hasIssue = q.type === 'SHORT_ANSWER'
                                        ? !q.correctAnswer?.trim()
                                        : !q.options?.some(o => o.isCorrect);

                                    return (
                                        <div key={idx} className={`rounded-xl border transition-colors ${hasIssue
                                            ? 'border-red-200 dark:border-red-800/50 bg-red-50/30 dark:bg-red-900/5'
                                            : 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50'
                                            }`}>
                                            {/* Collapsed header */}
                                            <div
                                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-neutral-800/70 transition-colors"
                                                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                                            >
                                                <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0 ${hasIssue
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                    {idx + 1}
                                                </span>

                                                <div className="flex-1 min-w-0">
                                                    <div className="text-base text-slate-800 dark:text-slate-200 truncate">
                                                        <LatexRenderer content={q.content.slice(0, 100) + (q.content.length > 100 ? '...' : '')} />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded ${q.type === 'SINGLE_CHOICE' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                        : q.type === 'MULTIPLE_CHOICE' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-neutral-700 dark:text-slate-400'
                                                        }`}>
                                                        {QUESTION_TYPE_LABELS[q.type]}
                                                    </span>
                                                    <span className="text-sm text-slate-400">{q.points}{i18n.t('exams:grading.pointsSuffix')}</span>
                                                    {hasIssue && <CircleX size={16} className="text-red-500" />}
                                                    {!hasIssue && <CircleCheck size={16} className="text-emerald-500" />}
                                                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                                </div>
                                            </div>

                                            {/* Expanded editor */}
                                            {isExpanded && (
                                                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-neutral-700/50 space-y-3">
                                                    {/* Type + Points row */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 block">{i18n.t('exams:docxImport.questionTypeLabel')}</label>
                                                            <select
                                                                value={q.type}
                                                                onChange={e => {
                                                                    const newType = e.target.value as QuestionType;
                                                                    const updates: Partial<CreateQuestionRequest> = { type: newType };
                                                                    if (newType === 'SHORT_ANSWER') {
                                                                        updates.options = undefined;
                                                                        updates.correctAnswer = q.correctAnswer || '';
                                                                    } else if (!q.options || q.options.length === 0) {
                                                                        updates.options = ['A', 'B', 'C', 'D'].map(l => ({ label: l, content: '', isCorrect: false }));
                                                                        updates.correctAnswer = undefined;
                                                                    }
                                                                    updateQuestion(idx, updates);
                                                                }}
                                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700
                                                                    rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
                                                            >
                                                                {QUESTION_TYPE_OPTIONS.map(o => (
                                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="w-24">
                                                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 block">{i18n.t('exams:docxImport.pointsLabel')}</label>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                value={q.points}
                                                                onChange={e => updateQuestion(idx, { points: Number(e.target.value) })}
                                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700
                                                                    rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div>
                                                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 block">{i18n.t('exams:docxImport.contentLabel')}</label>
                                                        <textarea
                                                            value={q.content}
                                                            onChange={e => updateQuestion(idx, { content: e.target.value })}
                                                            rows={3}
                                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700
                                                                rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                                                        />
                                                        {q.content.includes('$') && (
                                                            <div className="mt-1 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                                                <p className="text-xs font-medium text-blue-500 mb-1">{i18n.t('exams:docxImport.latexPreview')}</p>
                                                                <div className="text-base text-slate-800 dark:text-slate-200">
                                                                    <LatexRenderer content={q.content} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Options (for choice questions) */}
                                                    {q.type !== 'SHORT_ANSWER' && q.options && (
                                                        <div>
                                                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                                                                {q.type === 'SINGLE_CHOICE' ? i18n.t('exams:docxImport.answersSingle') : i18n.t('exams:docxImport.answersMultiple')}
                                                            </label>
                                                            <div className="space-y-1.5">
                                                                {q.options.map((opt, oi) => (
                                                                    <div key={oi} className="flex items-center gap-2">
                                                                        {/* Correct toggle */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleOption(idx, oi)}
                                                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                                                                                ${opt.isCorrect
                                                                                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                                                                                    : 'bg-slate-200 dark:bg-neutral-600 text-slate-500 dark:text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'
                                                                                }`}
                                                                            title={opt.isCorrect ? i18n.t('exams:docxImport.correctMark') : i18n.t('exams:docxImport.markAsCorrect')}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                        <input
                                                                            type="text"
                                                                            value={opt.content}
                                                                            onChange={e => updateOptionContent(idx, oi, e.target.value)}
                                                                            placeholder={i18n.t('exams:docxImport.answerPlaceholder', { label: opt.label })}
                                                                            className={`flex-1 px-3 py-1.5 rounded-lg text-sm border outline-none transition-colors
                                                                                ${opt.isCorrect
                                                                                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300'
                                                                                    : 'border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-800 dark:text-slate-200'
                                                                                } focus:ring-2 focus:ring-blue-500/20`}
                                                                        />
                                                                        {
                                                                            q.options!.length > 2 && (
                                                                                <button
                                                                                    onClick={() => removeOption(idx, oi)}
                                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                                >
                                                                                    <Minus size={14} />
                                                                                </button>
                                                                            )
                                                                        }
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    onClick={() => addOption(idx)}
                                                                    className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20
                                                                        px-3 py-1.5 rounded-lg transition-colors font-medium"
                                                                >
                                                                    <Plus size={14} />
                                                                    {i18n.t('exams:docxImport.addAnswer')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Short answer input */}
                                                    {q.type === 'SHORT_ANSWER' && (
                                                        <div>
                                                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 block">{i18n.t('exams:docxImport.correctAnswerLabel')}</label>
                                                            <input
                                                                type="text"
                                                                value={q.correctAnswer || ''}
                                                                onChange={e => updateQuestion(idx, { correctAnswer: e.target.value })}
                                                                placeholder={i18n.t('exams:docxImport.correctAnswerPlaceholder')}
                                                                className="w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700
                                                                    rounded-lg text-sm text-emerald-800 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Explanation */}
                                                    <div>
                                                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 block">{i18n.t('exams:docxImport.explanationLabel')}</label>
                                                        <textarea
                                                            value={q.explanation || ''}
                                                            onChange={e => updateQuestion(idx, { explanation: e.target.value })}
                                                            rows={2}
                                                            placeholder={i18n.t('exams:docxImport.explanationPlaceholder')}
                                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700
                                                                rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                                                        />
                                                    </div>

                                                    {/* Delete button */}
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => removeQuestion(idx)}
                                                            className="flex items-center gap-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                                                                px-3 py-1.5 rounded-lg transition-colors font-medium"
                                                        >
                                                            <Trash2 size={14} />
                                                            {i18n.t('exams:docxImport.deleteQuestion')}
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                            }
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer for preview step */}
                {step === 'preview' && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={reset}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                            >
                                {i18n.t('exams:docxImport.chooseOther')}
                            </button>
                            {issueCount > 0 && (
                                <span className="text-sm text-red-500 font-medium">
                                    {i18n.t('exams:docxImport.errorsToFix', { count: issueCount })}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleConfirm}
                            disabled={questions.length === 0 || confirming}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                                disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
                        >
                            {confirming && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            <Check size={16} />
                            {i18n.t('exams:docxImport.confirmBtn', { count: questions.length })}
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
};
