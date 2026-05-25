import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Clock, Hash,
    CalendarClock, BookOpen, Search, Check,
    Shuffle, Dices, FileText, X, Loader2, Lock, RefreshCw, CheckCircle2, Circle, Camera, GraduationCap
} from 'lucide-react';
import { examRepository } from '@/features/exams/api';
import { LatexRenderer } from '@/features/exams/components/LatexRenderer';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { ApiError } from '@/lib/api/apiClient';
import type {
    Question, QuestionType, QuestionQueryParams,
    ExamCategory, CreateExamRequest, UpdateExamRequest, ExamDetail, GradingMode,
} from '@/features/exams/types/exam.types';
import type { Subject } from '@/features/competitions/types/competition.types';

const TYPE_LABELS: Record<QuestionType, string> = {
    SINGLE_CHOICE: i18n.t('exams:typeLabels.singleChoice'),
    MULTIPLE_CHOICE: i18n.t('exams:typeLabels.multipleChoice'),
    SHORT_ANSWER: i18n.t('exams:typeLabels.shortAnswer'),
    SHORT_ANSWER_MULTI: i18n.t('exams:typeLabels.shortAnswerMulti'),
};

export const CreateExamPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const [saving, setSaving] = useState(false);
    const [loadingExam, setLoadingExam] = useState(false);

    // ─── Lookups ────────────────────────────────────────
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [categories, setCategories] = useState<ExamCategory[]>([]);
    useEffect(() => {
        (async () => {
            try {
                const [s, c] = await Promise.all([examRepository.getSubjects(), examRepository.getCategories()]);
                setSubjects(s);
                setCategories(c);
            } catch { /* silently fail */ }
        })();
    }, []);

    // ─── Exam Metadata ──────────────────────────────────
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState<number | ''>('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [duration, setDuration] = useState(90);
    const [startDatetime, setStartDatetime] = useState('');
    const [endDatetime, setEndDatetime] = useState('');
    const [shuffleEnabled, setShuffleEnabled] = useState(false);
    const [enableAccessCode, setEnableAccessCode] = useState(false);
    const [accessCodeValue, setAccessCodeValue] = useState('');
    const [requirePaper, setRequirePaper] = useState(false);
    const [gradingMode, setGradingMode] = useState<GradingMode>('AUTO');

    // ─── Load existing exam for edit mode ───────────────
    useEffect(() => {
        if (!isEditMode || !id) return;
        setLoadingExam(true);
        examRepository.getExamDetail(Number(id)).then((exam: ExamDetail) => {
            setTitle(exam.title);
            setDescription(exam.description ?? '');
            setSubjectId(exam.subjectId);
            setCategoryId(exam.categoryId);
            setDuration(exam.duration);
            setStartDatetime(exam.startDatetime ? new Date(exam.startDatetime).toISOString().slice(0, 16) : '');
            setEndDatetime(exam.endDatetime ? new Date(exam.endDatetime).toISOString().slice(0, 16) : '');
            const map = new Map<number, Question>();
            exam.questions.forEach(q => map.set(q.id, q));
            setSelectedQuestionsMap(map);
            setSelectedIds(new Set(exam.questions.map(q => q.id)));
            if (exam.accessCode) {
                setEnableAccessCode(true);
                setAccessCodeValue(exam.accessCode);
            }
            if (exam.requirePaperSubmission) {
                setRequirePaper(true);
            }
            if (exam.gradingMode) {
                setGradingMode(exam.gradingMode);
            }
        }).catch((err: unknown) => {
            const msg = err instanceof ApiError ? err.message : i18n.t('exams:create.loadFailed');
            showToast(msg, 'error');
        }).finally(() => setLoadingExam(false));
    }, [id, isEditMode]);

    // ─── Question Picker ────────────────────────────────
    const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
    const [bankTotal, setBankTotal] = useState(0);
    const [bankPage, setBankPage] = useState(1);
    const [bankSearch, setBankSearch] = useState('');
    const [bankTypeFilter, setBankTypeFilter] = useState<QuestionType | null>(null);
    const [bankLoading, setBankLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [selectedQuestionsMap, setSelectedQuestionsMap] = useState<Map<number, Question>>(new Map());
    const [randomCount, setRandomCount] = useState<number>(0);
    const [showRandomInput, setShowRandomInput] = useState(false);

    const BANK_LIMIT = 10;

    useEffect(() => {
        if (!subjectId) {
            setBankQuestions([]);
            setBankTotal(0);
            return;
        }
        const timer = setTimeout(async () => {
            setBankLoading(true);
            try {
                const params: QuestionQueryParams = {
                    page: bankPage,
                    limit: BANK_LIMIT,
                    search: bankSearch || undefined,
                    subjectId: Number(subjectId),
                    type: bankTypeFilter ?? undefined,
                };
                const res = await examRepository.getQuestions(params);
                setBankQuestions(res.data);
                setBankTotal(res.total);
            } catch {
                setBankQuestions([]);
            } finally {
                setBankLoading(false);
            }
        }, bankSearch ? 300 : 0);
        return () => clearTimeout(timer);
    }, [bankPage, bankSearch, bankTypeFilter, subjectId]);

    useEffect(() => { setBankPage(1); }, [bankSearch, bankTypeFilter, subjectId]);

    const bankTotalPages = useMemo(() => Math.max(1, Math.ceil(bankTotal / BANK_LIMIT)), [bankTotal]);

    const totalPoints = useMemo(() => Array.from(selectedQuestionsMap.values()).reduce((sum, q) => sum + (q.points ?? 0), 0), [selectedQuestionsMap]);
    const passingScore = useMemo(() => Math.round(totalPoints * 0.4), [totalPoints]);

    // ─── Selection Helpers ──────────────────────────────
    const toggleQuestion = useCallback((id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                setSelectedQuestionsMap(m => { const nm = new Map(m); nm.delete(id); return nm; });
            } else {
                next.add(id);
                const q = bankQuestions.find(q => q.id === id);
                if (q) setSelectedQuestionsMap(m => new Map(m).set(id, q));
            }
            return next;
        });
    }, [bankQuestions]);

    const selectAll = useCallback(() => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            bankQuestions.forEach(q => next.add(q.id));
            return next;
        });
        setSelectedQuestionsMap(m => {
            const nm = new Map(m);
            bankQuestions.forEach(q => nm.set(q.id, q));
            return nm;
        });
    }, [bankQuestions]);

    const deselectAll = useCallback(() => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            bankQuestions.forEach(q => next.delete(q.id));
            return next;
        });
        setSelectedQuestionsMap(m => {
            const nm = new Map(m);
            bankQuestions.forEach(q => nm.delete(q.id));
            return nm;
        });
    }, [bankQuestions]);

    const handleRandomPick = useCallback(async () => {
        if (randomCount <= 0) return;
        if (!subjectId) {
            showToast(i18n.t('exams:selectSubjectFirst'), 'error');
            return;
        }
        try {
            const res = await examRepository.getQuestions({
                limit: 200, subjectId: Number(subjectId), type: bankTypeFilter ?? undefined, search: bankSearch || undefined,
            });
            const available = res.data.filter(q => !selectedIds.has(q.id));
            const shuffled = [...available].sort(() => Math.random() - 0.5);
            const picked = shuffled.slice(0, randomCount);
            setSelectedIds(prev => {
                const next = new Set(prev);
                picked.forEach(q => next.add(q.id));
                return next;
            });
            setSelectedQuestionsMap(m => {
                const nm = new Map(m);
                picked.forEach(q => nm.set(q.id, q));
                return nm;
            });
            showToast(i18n.t('exams:randomPicked', { count: picked.length }), 'success');
            setShowRandomInput(false);
        } catch (err: unknown) {
            const msg = err instanceof ApiError ? err.message : i18n.t('exams:randomFailed');
            showToast(msg, 'error');
        }
    }, [randomCount, subjectId, bankTypeFilter, bankSearch, selectedIds]);

    const removeSelected = useCallback((id: number) => {
        setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        setSelectedQuestionsMap(m => { const nm = new Map(m); nm.delete(id); return nm; });
    }, []);

    // ─── Submit ─────────────────────────────────────────
    const isValid = title.trim() && subjectId && categoryId && selectedIds.size > 0;

    const validate = (): string[] => {
        const missing: string[] = [];
        if (!title.trim()) missing.push(i18n.t('exams:create.missingExamName'));
        if (!subjectId) missing.push(i18n.t('exams:create.missingSubject'));
        if (!categoryId) missing.push(i18n.t('exams:create.missingCategory'));
        if (selectedIds.size === 0) missing.push(i18n.t('exams:create.missingQuestions'));
        return missing;
    };

    const handleSubmit = async () => {
        const missing = validate();
        if (missing.length > 0) return showToast(i18n.t('exams:missingFields', { fields: missing.join(', ') }), 'error');
        setSaving(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || undefined,
                subjectId: Number(subjectId),
                categoryId: Number(categoryId),
                duration, totalPoints, passingScore,
                startDatetime: startDatetime ? new Date(startDatetime).toISOString() : null,
                endDatetime: endDatetime ? new Date(endDatetime).toISOString() : null,
                questionIds: Array.from(selectedIds),
                shuffle: shuffleEnabled,
                accessCode: enableAccessCode ? (accessCodeValue.trim() || null) : null,
                requirePaperSubmission: requirePaper,
                gradingMode,
            };
            if (isEditMode && id) {
                await examRepository.updateExam(Number(id), payload as UpdateExamRequest);
                showToast(i18n.t('exams:updateExamSuccess'), 'success');
                navigate(`/exams/${id}/preview`);
            } else {
                const created = await examRepository.createExam(payload as CreateExamRequest);
                showToast(i18n.t('exams:createExamSuccess'), 'success');
                navigate(`/exams/${created.id}/preview`);
            }
        } catch (err: unknown) {
            const msg = err instanceof ApiError ? err.message : (isEditMode ? i18n.t('exams:updateExamFailed') : i18n.t('exams:createExamFailed'));
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const selectedOnPage = bankQuestions.filter(q => selectedIds.has(q.id)).length;
    const allOnPageSelected = bankQuestions.length > 0 && selectedOnPage === bankQuestions.length;

    const inputClass = "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors dark:text-white placeholder:text-slate-400";
    const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2";

    return (
        <div className="min-h-screen relative font-sans text-slate-800 dark:text-slate-200">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 relative z-10">

                {/* ── Header ── */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 shrink-0"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {loadingExam ? i18n.t('exams:create.loading') : isEditMode ? i18n.t('exams:create.editTitle') : i18n.t('exams:create.createTitle')}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{i18n.t('exams:create.subtitle')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ══════ Left: Exam Metadata ══════ */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 lg:sticky lg:top-24">

                            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <FileText size={18} className="text-slate-500" />
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{i18n.t('exams:create.generalConfig')}</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>{i18n.t('exams:create.examName')} <span className="text-red-500">*</span></label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={i18n.t('exams:create.examNamePlaceholder')} className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>{i18n.t('exams:create.description')}</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder={i18n.t('exams:create.descPlaceholder')} className={`${inputClass} resize-none`} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}><BookOpen size={14} className="text-slate-400" /> {i18n.t('exams:create.subject')} <span className="text-red-500">*</span></label>
                                        <select value={subjectId} onChange={e => setSubjectId(e.target.value ? Number(e.target.value) : '')} className={inputClass}>
                                            <option value="">{i18n.t('exams:create.selectPlaceholder')}</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}><Hash size={14} className="text-slate-400" /> {i18n.t('exams:create.category')} <span className="text-red-500">*</span></label>
                                        <select value={categoryId} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : '')} className={inputClass}>
                                            <option value="">{i18n.t('exams:create.selectPlaceholder')}</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}><Clock size={14} className="text-slate-400" /> {i18n.t('exams:create.durationLabel')}</label>
                                    <input type="number" min={1} value={duration} onChange={e => setDuration(Number(e.target.value))} className={inputClass} />
                                </div>

                                {/* Datetime Group */}
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{i18n.t('exams:create.startOpen')}</label>
                                            <input type="datetime-local" value={startDatetime} onChange={e => setStartDatetime(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{i18n.t('exams:create.endClose')}</label>
                                            <input type="datetime-local" value={endDatetime} min={startDatetime || undefined} onChange={e => setEndDatetime(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 italic">{i18n.t('exams:create.alwaysOpenHint')}</p>
                                </div>

                                {/* ── Toggles ── */}
                                <div className="space-y-2.5">
                                    <ToggleRow active={shuffleEnabled} onClick={() => setShuffleEnabled(!shuffleEnabled)} icon={<Shuffle size={16} />} label={i18n.t('exams:create.shuffle')} />

                                    <div className={`rounded-xl border transition-colors overflow-hidden ${enableAccessCode ? 'border-blue-300 dark:border-blue-700' : 'border-slate-200 dark:border-slate-700'}`}>
                                        <ToggleRow active={enableAccessCode} onClick={() => setEnableAccessCode(!enableAccessCode)} icon={<Lock size={16} />} label={i18n.t('exams:create.requireCode')} noBorder />
                                        <div className={`px-4 transition-all duration-300 ${enableAccessCode ? 'pb-4 max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={accessCodeValue}
                                                    onChange={e => setAccessCodeValue(e.target.value.replace(/\s/g, '').toUpperCase())}
                                                    placeholder={i18n.t('exams:create.codePlaceholder')}
                                                    maxLength={20}
                                                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20 uppercase dark:text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                                                        let code = '';
                                                        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
                                                        setAccessCodeValue(code);
                                                    }}
                                                    className="p-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                                                    title={i18n.t('exams:create.generateCode')}
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <ToggleRow active={requirePaper} onClick={() => setRequirePaper(!requirePaper)} icon={<Camera size={16} />} label={i18n.t('exams:create.requirePaper')} />

                                    {/* Grading Mode */}
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            <GraduationCap size={16} className="text-slate-400" /> {i18n.t('exams:create.gradingMode')}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(['AUTO', 'MANUAL'] as GradingMode[]).map(mode => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setGradingMode(mode)}
                                                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${gradingMode === mode
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600'
                                                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {gradingMode === mode ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                                    {mode === 'AUTO' ? i18n.t('exams:create.gradingAuto') : i18n.t('exams:create.gradingManual')}
                                                </button>
                                            ))}
                                        </div>
                                        {gradingMode === 'MANUAL' && (
                                            <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
                                                {i18n.t('exams:create.manualGradingHint')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* ── Summary + Submit ── */}
                                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2 border border-slate-100 dark:border-slate-700">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">{i18n.t('exams:create.selectedLabel')}</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{selectedIds.size} <span className="text-sm font-normal text-slate-500">{i18n.t('exams:create.questionsUnit')}</span></span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">{i18n.t('exams:create.totalPointsLabel')}</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{totalPoints} <span className="text-sm font-normal text-slate-500">{i18n.t('exams:create.pointsUnit')}</span></span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">{i18n.t('exams:create.passScoreLabel')} <span className="text-xs">(40%)</span>:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{passingScore} <span className="text-sm font-normal text-slate-500">{i18n.t('exams:create.pointsUnit')}</span></span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={!isValid || saving}
                                        className="w-full py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                        {saving ? i18n.t('exams:create.saving') : isEditMode ? i18n.t('exams:create.saveExam') : i18n.t('exams:create.createExamBtn')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══════ Right: Question Picker ══════ */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex-1 flex flex-col">

                            {/* ── Toolbar ── */}
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
                                    <BookOpen size={18} className="text-slate-500" /> {i18n.t('exams:create.pickQuestions')}
                                </h2>

                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder={i18n.t('exams:create.searchPlaceholder')}
                                            value={bankSearch}
                                            onChange={e => setBankSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-colors"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {([null, 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SHORT_ANSWER'] as (QuestionType | null)[]).map(t => (
                                            <button
                                                key={t ?? 'all'}
                                                onClick={() => setBankTypeFilter(t)}
                                                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${bankTypeFilter === t
                                                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {t ? TYPE_LABELS[t] : i18n.t('exams:create.allTypes')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── Select All & Random ── */}
                            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300 group">
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${allOnPageSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'}`}>
                                        {allOnPageSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={allOnPageSelected} onChange={() => allOnPageSelected ? deselectAll() : selectAll()} />
                                    {i18n.t('exams:create.selectAll')}
                                </label>

                                <div className="flex items-center gap-2">
                                    {showRandomInput ? (
                                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <input type="number" min={1} max={bankTotal} value={randomCount} onChange={e => setRandomCount(Number(e.target.value))} className="w-14 px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-sm text-center outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white font-semibold" />
                                            <button onClick={handleRandomPick} className="px-3 py-1.5 text-sm font-bold bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors">
                                                {i18n.t('exams:create.randomPick')}
                                            </button>
                                            <button onClick={() => setShowRandomInput(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setRandomCount(Math.min(10, bankTotal || 10)); setShowRandomInput(true); }}
                                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <Dices size={14} /> {i18n.t('exams:create.randomPick')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ── Question List ── */}
                            <div className="flex-1 overflow-y-auto">
                                {bankLoading ? (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="px-5 py-5 flex items-start gap-3 animate-pulse">
                                                <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-md shrink-0 mt-1" />
                                                <div className="flex-1 space-y-3">
                                                    <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
                                                    <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800 rounded-md" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : bankQuestions.length === 0 ? (
                                    <div className="py-16 text-center px-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                            <BookOpen size={28} className="text-slate-400" />
                                        </div>
                                        <p className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            {bankSearch || bankTypeFilter ? i18n.t('exams:create.noQuestions') : i18n.t('exams:create.noQuestions')}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {subjectId ? i18n.t('exams:create.noQuestionsHint') : i18n.t('exams:create.noQuestionsHint')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {bankQuestions.map(q => {
                                            const checked = selectedIds.has(q.id);
                                            return (
                                                <label key={q.id} className={`flex items-start gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${checked ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}>
                                                    <div className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'}`}>
                                                        {checked && <Check size={14} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleQuestion(q.id)} />

                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-sm leading-relaxed mb-2 transition-colors ${checked ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                                                            <LatexRenderer content={q.content} />
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                                {TYPE_LABELS[q.type]}
                                                            </span>
                                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                                {i18n.t('exams:create.points', { count: q.points })}
                                                            </span>
                                                            {q.options && q.options.length > 0 && (
                                                                <span className="text-xs text-slate-500">
                                                                    {i18n.t('exams:create.answerStats', { count: q.options.length })} • <span className="text-emerald-600 dark:text-emerald-400">{i18n.t('exams:create.correctCount', { count: q.options.filter(o => o.isCorrect).length })}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ── Pagination ── */}
                            {!bankLoading && bankTotalPages > 1 && (
                                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <button disabled={bankPage <= 1} onClick={() => setBankPage(p => p - 1)} className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        {i18n.t('exams:create.prevPage')}
                                    </button>
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                        {bankPage} <span className="text-slate-400 dark:text-slate-500 font-normal">/ {bankTotalPages}</span>
                                    </span>
                                    <button disabled={bankPage >= bankTotalPages} onClick={() => setBankPage(p => p + 1)} className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        {i18n.t('exams:create.nextPage')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Selected Chips ── */}
                        {selectedIds.size > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-emerald-500" /> {i18n.t('exams:create.selectedQuestions')}
                                    </h3>
                                    <button onClick={() => { setSelectedIds(new Set()); setSelectedQuestionsMap(new Map()); }} className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors">
                                        {i18n.t('exams:create.clearAll')}
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-2">
                                    {Array.from(selectedIds).map(id => (
                                        <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-lg group">
                                            #{id}
                                            <button onClick={() => removeSelected(id)} className="text-slate-400 hover:text-rose-500 transition-colors p-0.5 rounded">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// Reusable Toggle Row
// ═══════════════════════════════════════════════════════════
const ToggleRow = ({ active, onClick, icon, label, noBorder }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; noBorder?: boolean }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors ${noBorder ? '' : `rounded-xl border ${active ? 'border-blue-300 dark:border-blue-700' : 'border-slate-200 dark:border-slate-700'}`}`}
    >
        <span className={`flex items-center gap-2.5 text-sm font-semibold ${active ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
            {icon} {label}
        </span>
        <div className={`w-10 h-5 rounded-full transition-colors relative ${active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
    </button>
);