import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search, Plus, FileText, Clock, Eye, Trash2, Edit3,
    Upload, Send, Archive, Filter, X, BookOpen,
    CalendarClock, Database, ListChecks, Loader2, RotateCcw,
    CheckCircle2
} from 'lucide-react';
import { useExams } from '@/features/exams/hooks/useExams';
import { useQuestionBank } from '@/features/exams/hooks/useQuestionBank';
import { examRepository } from '@/features/exams/api';
import { DocxImportModal } from './DocxImportModal';
import { QuestionEditor } from './QuestionEditor';
import { LatexRenderer } from './LatexRenderer';
import { QuestionBankSkeleton, ExamGridSkeleton } from './ExamSkeletons';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import type { ExamSummary, ExamStatus, Question, CreateQuestionRequest, QuestionType } from '@/features/exams/types/exam.types';

type SubView = 'bank' | 'exams';

const STATUS_OPTIONS: { value: ExamStatus | null; label: string }[] = [
    { value: null, label: i18n.t('exams:quiz.allLabel') },
    { value: 'DRAFT', label: i18n.t('exams:quiz.statusDraft') },
    { value: 'PUBLISHED', label: i18n.t('exams:quiz.statusPublished') },
    { value: 'ARCHIVED', label: i18n.t('exams:quiz.statusArchived') },
];

const statusConfig: Record<ExamStatus, { label: string; color: string }> = {
    DRAFT: { label: i18n.t('exams:quiz.statusDraft'), color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    PUBLISHED: { label: i18n.t('exams:quiz.statusPublished'), color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
    ARCHIVED: { label: i18n.t('exams:quiz.statusArchived'), color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500' },
};

const TYPE_LABELS: Record<QuestionType, string> = {
    SINGLE_CHOICE: i18n.t('exams:typeLabels.singleChoice'),
    MULTIPLE_CHOICE: i18n.t('exams:typeLabels.multipleChoice'),
    SHORT_ANSWER: i18n.t('exams:typeLabels.shortAnswer'),
    SHORT_ANSWER_MULTI: i18n.t('exams:typeLabels.shortAnswerMulti'),
};

const TYPE_FILTER_OPTIONS: { value: QuestionType | null; label: string }[] = [
    { value: null, label: i18n.t('exams:quiz.allLabel') },
    { value: 'SINGLE_CHOICE', label: i18n.t('exams:typeLabels.singleChoice') },
    { value: 'MULTIPLE_CHOICE', label: i18n.t('exams:typeLabels.multipleChoice') },
    { value: 'SHORT_ANSWER', label: i18n.t('exams:typeLabels.shortAnswer') },
    { value: 'SHORT_ANSWER_MULTI', label: i18n.t('exams:typeLabels.shortAnswerMulti') },
];

export const QuizBuilderTab = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const subView = (searchParams.get('eview') as SubView) || 'bank';

    const setSubView = useCallback((view: SubView) => {
        setSearchParams(prev => {
            if (view === 'bank') {
                prev.delete('eview');
            } else {
                prev.set('eview', view);
            }
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    return (
        <div className="space-y-6">
            {/* ── Segmented Control ── */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mx-auto sm:mx-0">
                <button
                    onClick={() => setSubView('bank')}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${subView === 'bank'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    <Database size={16} /> {i18n.t('exams:quiz.questionBank')}
                </button>
                <button
                    onClick={() => setSubView('exams')}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${subView === 'exams'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    <ListChecks size={16} /> {i18n.t('exams:quiz.examManage')}
                </button>
            </div>

            {subView === 'bank' && <QuestionBankView />}
            {subView === 'exams' && <ExamListView />}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// QUESTION BANK VIEW
// ═══════════════════════════════════════════════════════════
const QuestionBankView = () => {
    const {
        questions, loading, page, setPage, totalPages, total,
        searchQuery, setSearch, activeSubjectId, setSubject, activeType, setType,
        subjects, deleteQuestion, refresh,
    } = useQuestionBank();

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleSaveQuestion = useCallback(async (data: CreateQuestionRequest) => {
        setSaving(true);
        try {
            if (editingQuestion) {
                await examRepository.updateQuestion(editingQuestion.id, data);
                showToast(i18n.t('exams:questionUpdateSuccess'), 'success');
            } else {
                await examRepository.createQuestion(data);
                showToast(i18n.t('exams:questionCreateSuccess'), 'success');
            }
            setIsEditorOpen(false);
            setEditingQuestion(null);
            refresh();
        } catch {
            showToast(i18n.t('exams:questionSaveFailed'), 'error');
        } finally {
            setSaving(false);
        }
    }, [editingQuestion, refresh]);

    const handleImportConfirm = useCallback(async (parsedQuestions: CreateQuestionRequest[]) => {
        for (const q of parsedQuestions) {
            await examRepository.createQuestion(q);
        }
        showToast(i18n.t('exams:importAdded', { count: parsedQuestions.length }), 'success');
        refresh();
    }, [refresh]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        await deleteQuestion(deletingId);
        setDeletingId(null);
        setIsDeleting(false);
    }, [deletingId, deleteQuestion]);

    const handleImportDocx = useCallback(async (file: File) => {
        try {
            return await examRepository.importDocx(file);
        } catch {
            showToast(i18n.t('exams:importFailed'), 'error');
            return null;
        }
    }, []);

    const hasActiveFilters = activeSubjectId !== null || activeType !== null;

    return (
        <div className="space-y-5">
            {/* ── Search + Actions ── */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1 min-w-0">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder={i18n.t('exams:quiz.searchQuestion')}
                        value={searchQuery}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-colors"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${showFilters || hasActiveFilters
                            ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Filter size={14} /> {i18n.t('exams:quiz.filter')}
                    </button>

                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap"
                    >
                        <Upload size={14} /> <span className="hidden sm:inline">{i18n.t('exams:quiz.importWord')}</span><span className="sm:hidden">{i18n.t('exams:quiz.importFile')}</span>
                    </button>

                    <button
                        onClick={() => { setEditingQuestion(null); setIsEditorOpen(true); }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors whitespace-nowrap"
                    >
                        <Plus size={14} /> {i18n.t('exams:quiz.createQuestion')}
                    </button>
                </div>
            </div>

            {/* ── Filters ── */}
            {showFilters && (
                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    {/* Subject filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16 shrink-0 flex items-center gap-1.5"><BookOpen size={13} /> {i18n.t('exams:quiz.subjectLabel')}</span>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setSubject(null)}
                                className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-colors ${!activeSubjectId ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >{i18n.t('exams:quiz.allLabel')}</button>
                            {subjects.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSubject(s.id === activeSubjectId ? null : s.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors border ${s.id === activeSubjectId ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:border-blue-300'}`}
                                >
                                    {s.color && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />}
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Type filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16 shrink-0 flex items-center gap-1.5"><Database size={13} /> {i18n.t('exams:quiz.typeLabel')}</span>
                        <div className="flex flex-wrap items-center gap-2">
                            {TYPE_FILTER_OPTIONS.map(opt => (
                                <button
                                    key={opt.value ?? 'all'}
                                    onClick={() => setType(opt.value)}
                                    className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeType === opt.value ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                >{opt.label}</button>
                            ))}
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="pt-1">
                            <button onClick={() => { setSubject(null); setType(null); setSearch(''); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                <X size={14} /> {i18n.t('exams:quiz.clearFilter')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Editor ── */}
            {isEditorOpen && (
                <div className="mb-4">
                    <QuestionEditor
                        initialData={editingQuestion ?? undefined}
                        subjectId={activeSubjectId ?? undefined}
                        subjects={subjects}
                        onSave={handleSaveQuestion}
                        onCancel={() => { setIsEditorOpen(false); setEditingQuestion(null); }}
                        saving={saving}
                    />
                </div>
            )}

            {/* ── Question List ── */}
            {loading ? (
                <QuestionBankSkeleton />
            ) : questions.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Database size={28} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
                        {searchQuery || hasActiveFilters ? i18n.t('exams:quiz.emptySearchTitle') : i18n.t('exams:quiz.emptyTitle')}
                    </h3>
                    <p className="text-sm text-slate-500 mb-5">
                        {searchQuery || hasActiveFilters ? i18n.t('exams:quiz.emptySearchHint') : i18n.t('exams:quiz.emptyHint')}
                    </p>
                    {!searchQuery && !hasActiveFilters && (
                        <button onClick={() => { setEditingQuestion(null); setIsEditorOpen(true); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-colors">
                            {i18n.t('exams:quiz.createFirst')}
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {questions.map(q => (
                        <QuestionBankCard
                            key={q.id}
                            question={q}
                            onEdit={() => { setEditingQuestion(q); setIsEditorOpen(true); }}
                            onDelete={() => setDeletingId(q.id)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center mt-5">
                    <PaginationControls current={page} total={totalPages} onChange={setPage} />
                </div>
            )}

            {/* Modals */}
            <DocxImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImportDocx} onConfirm={handleImportConfirm} />
            <ConfirmModal isOpen={!!deletingId} onClose={() => !isDeleting && setDeletingId(null)} onConfirm={handleDeleteConfirm} isLoading={isDeleting} title={i18n.t('exams:quiz.deleteQuestion')} message={i18n.t('exams:quiz.deleteQuestionMsg')} confirmText={i18n.t('exams:quiz.deleteQuestion')} variant="danger" />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// QUESTION BANK CARD
// ═══════════════════════════════════════════════════════════
const QuestionBankCard = ({ question, onEdit, onDelete }: { question: Question; onEdit: () => void; onDelete: () => void }) => {
    return (
        <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="p-4 md:p-5 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start gap-3 justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                {TYPE_LABELS[question.type]}
                            </span>
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                {i18n.t('exams:quiz.points', { count: question.points })}
                            </span>
                            {question.subject && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                    {question.subject.color && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: question.subject.color }} />}
                                    {question.subject.name}
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed pr-2">
                            <LatexRenderer content={question.content} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={onEdit} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:text-blue-400 dark:hover:bg-slate-800 transition-colors" title={i18n.t('exams:quiz.editBtn')}>
                            <Edit3 size={16} />
                        </button>
                        <button onClick={onDelete} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-colors" title={i18n.t('exams:quiz.deleteBtn')}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Options Preview */}
                {question.options && question.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {question.options.map((o, i) => (
                            <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border ${o.isCorrect
                                ? 'bg-emerald-50 border-slate-200 text-emerald-700 dark:bg-emerald-900/10 dark:border-slate-700 dark:text-emerald-400'
                                : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                }`}>
                                {o.isCorrect && <CheckCircle2 size={12} className="shrink-0" />} {o.label}
                            </span>
                        ))}
                    </div>
                )}

                {/* Short Answer preview */}
                {question.type === 'SHORT_ANSWER' && question.correctAnswer && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 border border-slate-200 text-emerald-700 dark:bg-emerald-900/10 dark:border-slate-700 dark:text-emerald-400">
                            <CheckCircle2 size={12} className="shrink-0" /> {i18n.t('exams:quiz.correctAnswer')}<LatexRenderer content={question.correctAnswer} />
                        </div>
                    </div>
                )}

                {/* Multi-answer preview */}
                {question.type === 'SHORT_ANSWER_MULTI' && question.correctAnswers && question.correctAnswers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        {question.correctAnswers.map((ans, idx) => (
                            <div key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 border border-slate-200 text-emerald-700 dark:bg-emerald-900/10 dark:border-slate-700 dark:text-emerald-400 mr-2">
                                <CheckCircle2 size={12} className="shrink-0" /> {String.fromCharCode(97 + idx)}){' '}<LatexRenderer content={ans} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// EXAM LIST VIEW
// ═══════════════════════════════════════════════════════════
const ExamListView = () => {
    const navigate = useNavigate();
    const {
        exams, loading, page, setPage, totalPages,
        searchQuery, setSearch, activeSubjectId, setSubject,
        activeCategoryId, setCategory, activeStatus, setStatus,
        subjects, categories, deleteExam, publishExam, archiveExam, reopenExam,
    } = useExams();

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [actioningId, setActioningId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<'publish' | 'archive' | 'reopen' | null>(null);

    const handlePublish = useCallback(async (id: number) => {
        if (actioningId) return;
        setActioningId(id); setActionType('publish');
        await publishExam(id);
        setActioningId(null); setActionType(null);
    }, [actioningId, publishExam]);

    const handleArchive = useCallback(async (id: number) => {
        if (actioningId) return;
        setActioningId(id); setActionType('archive');
        await archiveExam(id);
        setActioningId(null); setActionType(null);
    }, [actioningId, archiveExam]);

    const handleReopen = useCallback(async (id: number) => {
        if (actioningId) return;
        setActioningId(id); setActionType('reopen');
        await reopenExam(id);
        setActioningId(null); setActionType(null);
    }, [actioningId, reopenExam]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        await deleteExam(deletingId);
        setDeletingId(null); setIsDeleting(false);
    }, [deletingId, deleteExam]);

    const hasActiveFilters = activeSubjectId !== null || activeCategoryId !== null || activeStatus !== null;

    return (
        <div className="space-y-5">
            {/* ── Search + Actions ── */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1 min-w-0">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder={i18n.t('exams:quiz.searchExam')}
                        value={searchQuery}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-colors"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${showFilters || hasActiveFilters
                            ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <Filter size={14} /> {i18n.t('exams:quiz.filter')}
                    </button>

                    <button
                        onClick={() => navigate('/exams/create')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors whitespace-nowrap"
                    >
                        <Plus size={14} /> {i18n.t('exams:quiz.createExam')}
                    </button>
                </div>
            </div>

            {/* ── Filters ── */}
            {showFilters && (
                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    {/* Subject filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20 shrink-0 flex items-center gap-1.5"><BookOpen size={13} /> {i18n.t('exams:quiz.subjectLabel')}</span>
                        <div className="flex flex-wrap items-center gap-2">
                            <button onClick={() => setSubject(null)} className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-colors ${!activeSubjectId ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{i18n.t('exams:quiz.allLabel')}</button>
                            {subjects.map(s => (
                                <button key={s.id} onClick={() => setSubject(s.id === activeSubjectId ? null : s.id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors border ${s.id === activeSubjectId ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:border-blue-300'}`}>
                                    {s.color && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />} {s.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20 shrink-0 flex items-center gap-1.5"><ListChecks size={13} /> {i18n.t('exams:quiz.categoryLabel')}</span>
                            <select value={activeCategoryId ?? ''} onChange={e => setCategory(e.target.value ? Number(e.target.value) : null)} className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors cursor-pointer">
                                <option value="">{i18n.t('exams:quiz.allLabel')}</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20 shrink-0 flex items-center gap-1.5"><CalendarClock size={13} /> {i18n.t('exams:quiz.statusLabel')}</span>
                            <div className="flex flex-wrap items-center gap-2">
                                {STATUS_OPTIONS.map(opt => (
                                    <button key={opt.value ?? 'all'} onClick={() => setStatus(opt.value)} className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeStatus === opt.value ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="pt-1">
                            <button onClick={() => { setSubject(null); setCategory(null); setStatus(null); setSearch(''); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                <X size={14} /> {i18n.t('exams:quiz.clearFilter')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Exam Grid ── */}
            {loading ? (
                <ExamGridSkeleton />
            ) : exams.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ListChecks size={28} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
                        {searchQuery || hasActiveFilters ? i18n.t('exams:quiz.emptyExamSearch') : i18n.t('exams:quiz.emptyExam')}
                    </h3>
                    <p className="text-sm text-slate-500 mb-5">
                        {searchQuery || hasActiveFilters ? i18n.t('exams:quiz.emptyExamSearchHint') : i18n.t('exams:quiz.emptyExamHint')}
                    </p>
                    {!searchQuery && !hasActiveFilters && (
                        <button onClick={() => navigate('/exams/create')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-colors">
                            {i18n.t('exams:quiz.createExamNow')}
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exams.map(exam => (
                        <ExamCard
                            key={exam.id}
                            exam={exam}
                            onView={() => navigate(`/exams/${exam.id}/preview`)}
                            onEdit={() => navigate(`/exams/${exam.id}/edit`)}
                            onDelete={() => setDeletingId(exam.id)}
                            onPublish={() => handlePublish(exam.id)}
                            onArchive={() => handleArchive(exam.id)}
                            onReopen={() => handleReopen(exam.id)}
                            isPublishing={actioningId === exam.id && actionType === 'publish'}
                            isArchiving={actioningId === exam.id && actionType === 'archive'}
                            isReopening={actioningId === exam.id && actionType === 'reopen'}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <PaginationControls current={page} total={totalPages} onChange={setPage} />
                </div>
            )}

            <ConfirmModal isOpen={!!deletingId} onClose={() => !isDeleting && setDeletingId(null)} onConfirm={handleDeleteConfirm} isLoading={isDeleting} title={i18n.t('exams:quiz.deleteExam')} message={i18n.t('exams:quiz.deleteExamMsg')} confirmText={i18n.t('exams:quiz.deleteBtn')} variant="danger" />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// EXAM CARD
// ═══════════════════════════════════════════════════════════
interface ExamCardProps {
    exam: ExamSummary;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onPublish: () => void;
    onArchive: () => void;
    onReopen: () => void;
    isPublishing?: boolean;
    isArchiving?: boolean;
    isReopening?: boolean;
}

const ExamCard = ({ exam, onView, onEdit, onDelete, onPublish, onArchive, onReopen, isPublishing = false, isArchiving = false, isReopening = false }: ExamCardProps) => {
    const config = statusConfig[exam.status];
    const isBusy = isPublishing || isArchiving || isReopening;

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="p-5 flex-1 flex flex-col cursor-pointer" onClick={onView}>

                {/* Meta Labels */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {exam.subjectColor && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: exam.subjectColor }} />}
                        {exam.subjectName}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {exam.categoryName}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${config.color}`}>
                        {config.label}
                    </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {exam.title}
                </h3>

                {/* Stats */}
                <div className="mt-auto space-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><FileText size={14} className="text-slate-400" /> {i18n.t('exams:quiz.questionsCount', { count: exam.questionCount })}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {i18n.t('exams:quiz.durationVal', { count: exam.duration })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <CalendarClock size={14} className="shrink-0" />
                        {exam.startDatetime || exam.endDatetime ? (
                            <span className="text-sm">{new Date(exam.startDatetime || exam.endDatetime!).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        ) : (
                            <span className="text-sm font-semibold text-slate-500">{i18n.t('exams:quiz.alwaysOpen')}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                    <button onClick={onView} className="shrink-0 flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Eye size={13} /> {i18n.t('exams:preview.view')}
                    </button>
                    <button onClick={onEdit} disabled={isBusy} className="shrink-0 flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50">
                        <Edit3 size={13} /> {i18n.t('exams:preview.editBtn')}
                    </button>

                    {exam.status === 'DRAFT' && (
                        <button onClick={onPublish} disabled={isPublishing} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-60">
                            {isPublishing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            {isPublishing ? i18n.t('exams:preview.busyLoading') : i18n.t('exams:preview.publish')}
                        </button>
                    )}
                    {exam.status === 'PUBLISHED' && (
                        <button onClick={onArchive} disabled={isArchiving} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
                            {isArchiving ? <Loader2 size={13} className="animate-spin" /> : <Archive size={13} />}
                            {isArchiving ? i18n.t('exams:preview.busyLoading') : i18n.t('exams:preview.archive')}
                        </button>
                    )}
                    {exam.status === 'ARCHIVED' && (
                        <button onClick={onReopen} disabled={isReopening} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
                            {isReopening ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                            {isReopening ? i18n.t('exams:preview.busyLoading') : i18n.t('exams:preview.reopen')}
                        </button>
                    )}

                    <button onClick={onDelete} disabled={isBusy} className="shrink-0 flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:text-rose-400 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50">
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
};