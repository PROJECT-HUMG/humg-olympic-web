import { useState, useEffect, useRef, useCallback } from 'react';
import {
    X, Image as ImageIcon, CheckCircle, MapPin,
    Clock, Layout, Loader2, Pencil,
    Plus, Trash2, Link as LinkIcon, Eye, EyeOff, GraduationCap, Search, ChevronDown
} from 'lucide-react';

import type { ExamSummary } from '@/features/exams/types/exam.types';
import { examRepository } from '@/features/exams/api';
import { format } from 'date-fns';
import type { CompetitionDetail, CompetitionUpdateRequest, Subject, Prize, TimelineEvent } from '@/features/competitions/types/competition.types';
import { competitionRepository } from '@/features/competitions/api';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { extractErrorMessage } from '@/utils/errorUtils';
import { sanitizeHtml } from '@/utils/sanitize';

const TIME_OPTIONS = (() => {
    const t: string[] = [];
    for (let i = 0; i < 24; i++)
        for (let j = 0; j < 60; j += 15)
            t.push(`${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`);
    return t;
})();

const inputClasses = "w-full px-4 py-3 bg-white dark:bg-slate-900/50 border rounded-xl transition-colors duration-200 focus:ring-2 focus:ring-humg-blue/20 focus:border-humg-blue outline-none shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400";
const labelClasses = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide text-[11px]";

function parseToDateAndTime(iso?: string | null): { date: string; time: string } {
    if (!iso) return { date: '', time: '08:00' };
    try {
        const d = new Date(iso);
        return {
            date: format(d, 'yyyy-MM-dd'),
            time: format(d, 'HH:mm'),
        };
    } catch {
        return { date: '', time: '08:00' };
    }
}

interface EditCompetitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    competition: CompetitionDetail | null;
    onSuccess: () => void;
    onUpdate: (data: CompetitionUpdateRequest, image?: File) => Promise<CompetitionDetail>;
}

const EditCompetitionModal = ({
    isOpen,
    onClose,
    competition,
    onSuccess,
    onUpdate,
}: EditCompetitionModalProps) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [title, setTitle] = useState('');
    const [subjectId, setSubjectId] = useState<string>('');
    const [type, setType] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endDate, setEndDate] = useState('');
    const [endTimeVal, setEndTimeVal] = useState('11:00');
    const [deadlineDate, setDeadlineDate] = useState('');
    const [deadlineTime, setDeadlineTime] = useState('23:59');
    const [location, setLocation] = useState('');
    const [maxParticipants, setMaxParticipants] = useState<number>(50);
    const [image, setImage] = useState<File | null>(null);
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [rules, setRules] = useState('');
    const [prizes, setPrizes] = useState<Omit<Prize, 'id'>[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    // Exam linking
    const [examId, setExamId] = useState<number | undefined>(undefined);
    const [examTitle, setExamTitle] = useState<string | undefined>(undefined);
    const [examPickerOpen, setExamPickerOpen] = useState(false);
    const [examSearch, setExamSearch] = useState('');
    const [examOptions, setExamOptions] = useState<ExamSummary[]>([]);
    const [examPage, setExamPage] = useState(0);
    const [examHasMore, setExamHasMore] = useState(true);
    const [examLoading, setExamLoading] = useState(false);
    const examLastRef = useCallback((node: HTMLDivElement) => {
        if (examLoading) return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && examHasMore) setExamPage(p => p + 1);
        });
        if (node) obs.observe(node);
    }, [examLoading, examHasMore]);

    useEffect(() => {
        if (!image) {
            setImagePreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(image);
        setImagePreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [image]);

    useEffect(() => {
        if (!isOpen) return;
        const fetchSubjects = async () => {
            setIsLoadingSubjects(true);
            try {
                const data = await competitionRepository.getSubjects();
                setSubjects(data);
            } catch (e) {
                showToast(i18n.t('dashboard:loadSubjectsFailed'), 'error');
            } finally {
                setIsLoadingSubjects(false);
            }
        };
        fetchSubjects();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !competition) return;
        setTitle(competition.title);
        setType(competition.type);
        setLocation(competition.location || '');
        setMaxParticipants(competition.maxParticipants || 50);
        setSummary(competition.summary || '');
        setContent(competition.content || '');
        setRules(competition.rules || '');
        setPrizes((competition.prizes || []).map((p) => ({ rankName: p.rankName, prizeValue: p.prizeValue, quantity: p.quantity })));
        if (competition.prizes?.length === 0) setPrizes([{ rankName: i18n.t('dashboard:competitionModal.defaultFirst'), prizeValue: '', quantity: 1 }]);

        const start = parseToDateAndTime(competition.startTime);
        const end = parseToDateAndTime(competition.endTime);
        const deadline = parseToDateAndTime(competition.registrationDeadline);
        setStartDate(start.date);
        setStartTime(start.time);
        setEndDate(end.date);
        setEndTimeVal(end.time);
        setDeadlineDate(deadline.date);
        setDeadlineTime(deadline.time);

        if (subjects.length > 0) {
            const match = subjects.find((s) => s.name === competition.subjectName);
            setSubjectId(match ? String(match.id) : String(subjects[0].id));
        } else {
            setSubjectId('');
        }
        setImage(null);
        setStep(1);
        // Restore exam link
        setExamId(competition.examId);
        setExamTitle(competition.examTitle);
    }, [isOpen, competition, subjects.length]);

    useEffect(() => {
        if (competition && subjects.length > 0 && !subjectId) {
            const match = subjects.find((s) => s.name === competition.subjectName);
            setSubjectId(match ? String(match.id) : String(subjects[0].id));
        }
    }, [competition, subjects, subjectId]);

    useEffect(() => {
        if (startDate && !endDate) setEndDate(startDate);
    }, [startDate]);

    // Fetch exams for picker
    useEffect(() => {
        if (!examPickerOpen) return;
        const t = setTimeout(async () => {
            setExamLoading(true);
            try {
                const res = await examRepository.getExams({ page: examPage, limit: 10, search: examSearch || undefined, status: 'PUBLISHED' });
                setExamOptions(prev => examPage === 0 ? res.data : [...prev, ...res.data]);
                setExamHasMore(res.data.length === 10);
            } finally { setExamLoading(false); }
        }, 300);
        return () => clearTimeout(t);
    }, [examPickerOpen, examPage, examSearch]);

    if (!isOpen) return null;

    const combineDateTime = (dateStr: string, timeStr: string): Date | null => {
        if (!dateStr) return null;
        return new Date(`${dateStr}T${timeStr}:00`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!competition) return;
        if (!title.trim() || !subjectId || !startDate || !location) {
            showToast(i18n.t('dashboard:fillRequiredFields'), 'error');
            return;
        }
        if (!summary.trim()) {
            showToast(i18n.t('dashboard:competition.summaryRequired'), 'error');
            return;
        }
        const invalidPrize = prizes.some((p) => !p.rankName.trim() || !p.prizeValue.trim());
        if (invalidPrize) {
            showToast(i18n.t('dashboard:competition.prizeInfoRequired'), 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const startISO = combineDateTime(startDate, startTime)?.toISOString() ?? '';
            const endISO = combineDateTime(endDate, endTimeVal)?.toISOString();
            const deadlineISO = combineDateTime(deadlineDate, deadlineTime)?.toISOString();

            const data: CompetitionUpdateRequest = {
                title,
                subjectId: parseInt(subjectId, 10),
                type,
                startTime: startISO,
                endTime: endISO,
                registrationDeadline: deadlineISO,
                location,
                summary,
                maxParticipants,
                content: content || summary,
                rules: rules || i18n.t('dashboard:competitionModal.updating'),
                timeline: (competition.timeline || []).map((e: TimelineEvent) => ({
                    title: e.title,
                    eventTime: e.eventTime,
                    description: e.description,
                })),
                prizes,
                examId,
            };
            await onUpdate(data, image || undefined);
            showToast(i18n.t('dashboard:competition.updateSuccess'), 'success');
            onSuccess();
            onClose();
        } catch (err: unknown) {
            showToast(extractErrorMessage(err, i18n.t('dashboard:competition.updateFailed')), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrizeChange = (index: number, field: keyof Omit<Prize, 'id'>, value: string | number) => {
        const next = [...prizes];
        next[index] = { ...next[index], [field]: value };
        setPrizes(next);
    };

    const TimeSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
        <select className={`${inputClasses} appearance-none pr-8 cursor-pointer font-mono text-center`} value={value} onChange={(e) => onChange(e.target.value)}>
            {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
            ))}
        </select>
    );

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center pt-20 md:pt-28 px-2 sm:px-4 pb-4 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
            <div className="relative bg-white dark:bg-slate-900 w-full max-h-[90vh] max-w-3xl shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden my-4">
                <div className="flex-none px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Pencil size={20} className="text-humg-blue" />
                        {i18n.t('dashboard:competitionModal.editTitle')}
                    </h2>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                <form id="edit-competition-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div>
                        <label className={labelClasses}>{i18n.t('dashboard:competitionModal.titleLabel')} *</label>
                        <input type="text" className={inputClasses} value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>{i18n.t('dashboard:competitionModal.subjectLabel')} *</label>
                            <select className={inputClasses} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={isLoadingSubjects}>
                                <option value="">{i18n.t('dashboard:competitionModal.selectSubject')}</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>{i18n.t('dashboard:competitionModal.typeLabel')}</label>
                            <div className="flex border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl">
                                <button type="button" onClick={() => setType('OFFLINE')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${type === 'OFFLINE' ? 'bg-humg-blue text-white' : 'text-slate-500'}`}>
                                    <MapPin size={16} className="inline mr-1" /> {i18n.t('dashboard:competitionModal.typeOffline')}
                                </button>
                                <button type="button" onClick={() => setType('ONLINE')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${type === 'ONLINE' ? 'bg-humg-blue text-white' : 'text-slate-500'}`}>
                                    <Layout size={16} className="inline mr-1" /> {i18n.t('dashboard:competitionModal.typeOnline')}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>{i18n.t('dashboard:competitionModal.startFrom')} *</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input type="date" className={`${inputClasses} min-h-[44px]`} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                                <div className="w-full sm:w-28 shrink-0"><TimeSelect value={startTime} onChange={setStartTime} /></div>
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>{i18n.t('dashboard:competitionModal.endTo')}</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input type="date" className={`${inputClasses} min-h-[44px]`} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                <div className="w-full sm:w-28 shrink-0"><TimeSelect value={endTimeVal} onChange={setEndTimeVal} /></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>{i18n.t('dashboard:competitionModal.regDeadline')}</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input type="date" className={`${inputClasses} min-h-[44px]`} value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} />
                            <div className="w-full sm:w-28 shrink-0"><TimeSelect value={deadlineTime} onChange={setDeadlineTime} /></div>
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>
                            {type === 'OFFLINE' ? i18n.t('dashboard:competitionModal.locationLabel') : i18n.t('dashboard:competitionModal.linkLabel')} *
                        </label>
                        <input
                            type="text"
                            className={inputClasses}
                            placeholder={type === 'OFFLINE' ? i18n.t('dashboard:competitionModal.locationPlaceholder') : i18n.t('dashboard:competitionModal.linkPlaceholder')}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>{i18n.t('dashboard:competitionModal.maxParticipants')}</label>
                        <input type="number" min={1} className={inputClasses} value={maxParticipants} onChange={(e) => setMaxParticipants(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className={labelClasses}>{i18n.t('dashboard:competitionModal.coverImage')}</label>
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setImage(e.target.files[0])} />
                        {image && imagePreviewUrl ? (
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                                <div className="aspect-video max-h-40 w-full max-w-sm bg-slate-100 dark:bg-slate-800">
                                    <img src={imagePreviewUrl} alt={i18n.t('dashboard:competitionModal.coverPreview')} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">{image.name}</span>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-humg-blue hover:underline">{i18n.t('dashboard:competitionModal.changeImage')}</button>
                                </div>
                            </div>
                        ) : competition?.imageUrl ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <img src={competition.imageUrl} alt="" className="h-24 w-32 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="h-12 px-4 border border-dashed rounded-xl flex items-center gap-2 hover:border-humg-blue text-slate-400 hover:text-humg-blue text-sm font-medium">
                                    <ImageIcon size={18} /> {i18n.t('dashboard:competitionModal.changeImage')}
                                </button>
                            </div>
                        ) : (
                            <div className="h-12 border border-dashed rounded-xl flex items-center justify-center cursor-pointer max-w-xs hover:border-humg-blue text-slate-400 hover:text-humg-blue" onClick={() => fileInputRef.current?.click()}>
                                <span className="text-sm flex items-center gap-2"><ImageIcon size={16} /> {i18n.t('dashboard:competitionModal.uploadImage')}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className={labelClasses}>{i18n.t('dashboard:competitionModal.summaryLabel')} *</label>
                        <textarea className={`${inputClasses} h-24 resize-none`} value={summary} onChange={(e) => setSummary(e.target.value)} required />
                    </div>
                    <div>
                        <label className={labelClasses}>{i18n.t('dashboard:competitionModal.contentDetail')}</label>
                        <textarea className={`${inputClasses} h-28 font-mono text-sm`} value={content} onChange={(e) => setContent(e.target.value)} />
                        <details className="group mt-2">
                            <summary className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-humg-blue list-none [&::-webkit-details-marker]:hidden">
                                <Eye size={16} className="group-open:hidden" /><EyeOff size={16} className="hidden group-open:inline" /> {i18n.t('dashboard:competitionModal.preview')}
                            </summary>
                            <div className="mt-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 min-h-[60px] prose dark:prose-invert prose-sm max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:font-bold" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content || `<span class="text-slate-400">${i18n.t('dashboard:competitionModal.noContent')}</span>`) }} />
                        </details>
                    </div>
                    <div>
                        <label className={labelClasses}>{i18n.t('dashboard:competitionModal.rulesLabel')}</label>
                        <textarea className={`${inputClasses} h-28 font-mono text-sm`} value={rules} onChange={(e) => setRules(e.target.value)} />
                        <details className="group mt-2">
                            <summary className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-humg-blue list-none [&::-webkit-details-marker]:hidden">
                                <Eye size={16} className="group-open:hidden" /><EyeOff size={16} className="hidden group-open:inline" /> {i18n.t('dashboard:competitionModal.preview')}
                            </summary>
                            <div className="mt-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 min-h-[60px] prose dark:prose-invert prose-sm max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:font-bold" dangerouslySetInnerHTML={{ __html: sanitizeHtml(rules || `<span class="text-slate-400">${i18n.t('dashboard:competitionModal.noContent')}</span>`) }} />
                        </details>
                    </div>
                    <div>
                        <label className={labelClasses}>{i18n.t('dashboard:competitionModal.prizeStructure')}</label>
                        <div className="space-y-4">
                            {prizes.map((p, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_80px] gap-2 flex-1 min-w-0">
                                        <input type="text" placeholder={i18n.t('dashboard:modals.editPrizeName')} className={`${inputClasses} py-2.5 min-h-[44px]`} value={p.rankName} onChange={(e) => handlePrizeChange(idx, 'rankName', e.target.value)} />
                                        <input type="text" placeholder={i18n.t('dashboard:modals.editPrizeValue')} className={`${inputClasses} py-2.5 min-h-[44px]`} value={p.prizeValue} onChange={(e) => handlePrizeChange(idx, 'prizeValue', e.target.value)} />
                                        <input type="number" min={1} className={`${inputClasses} py-2.5 min-h-[44px] text-center`} value={p.quantity} onChange={(e) => handlePrizeChange(idx, 'quantity', Number(e.target.value))} />
                                    </div>
                                    <button type="button" onClick={() => setPrizes((prev) => prev.filter((_, i) => i !== idx))} className="p-3 min-h-[44px] self-center sm:self-auto text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors touch-manipulation" aria-label={i18n.t('dashboard:actions.deleteTooltip')}>
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => setPrizes((prev) => [...prev, { rankName: '', prizeValue: '', quantity: 1 }])} className="text-sm font-bold text-humg-blue flex items-center gap-2 py-3 px-4 rounded-xl hover:bg-humg-blue/10 transition-colors min-h-[44px] touch-manipulation">
                                <Plus size={18} /> {i18n.t('dashboard:competitionModal.addPrize')}
                            </button>
                        </div>
                    </div>
                    {/* Exam Linking */}
                    <div>
                        <label className={labelClasses}>
                            <GraduationCap size={14} className="inline mb-0.5 mr-1" />
                            {i18n.t('dashboard:competitionModal.selectExam')} ({i18n.t('common:optional')})
                        </label>
                        <div className="relative">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setExamPickerOpen(!examPickerOpen); setExamSearch(''); setExamPage(0); }}
                                    className={`${inputClasses} flex items-center justify-between py-2.5 text-left ${examPickerOpen ? 'border-humg-blue ring-2 ring-humg-blue/10' : ''
                                        }`}
                                >
                                    <span className={examId ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400'}>
                                        {examId ? (examOptions.find(e => e.id === examId)?.title || examTitle || `Exam #${examId}`) : i18n.t('dashboard:competitionModal.examNotLinked')}
                                    </span>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${examPickerOpen ? 'rotate-180 text-humg-blue' : ''}`} />
                                </button>
                                {examId && (
                                    <button type="button" onClick={() => { setExamId(undefined); setExamTitle(undefined); }}
                                        className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            {examPickerOpen && (
                                <div
                                    className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                                >
                                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            <input autoFocus type="text" placeholder={i18n.t('dashboard:modals.searchExam')} className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm border-none focus:ring-2 focus:ring-humg-blue/20 outline-none" onChange={e => { setExamSearch(e.target.value); setExamPage(0); }} />
                                        </div>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto p-1">
                                        {examOptions.map((exam, i) => (
                                            <div key={exam.id} ref={i === examOptions.length - 1 ? examLastRef : null}
                                                onClick={() => { setExamId(exam.id); setExamTitle(exam.title); setExamPickerOpen(false); }}
                                                className={`px-3 py-2 rounded-lg cursor-pointer flex justify-between items-center mb-0.5 ${examId === exam.id ? 'bg-blue-50 dark:bg-blue-900/20 text-humg-blue' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                    }`}
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">{exam.title}</p>
                                                    <p className="text-xs text-slate-400">{exam.subjectName} · {exam.questionCount} {i18n.t('dashboard:competitionModal.questions')} · {exam.duration} {i18n.t('dashboard:competitionModal.minutes')}</p>
                                                </div>
                                                {examId === exam.id && <CheckCircle size={15} className="text-humg-blue shrink-0 ml-2" />}
                                            </div>
                                        ))}
                                        {examLoading && <div className="p-3 text-center text-xs text-slate-400 flex justify-center"><Loader2 size={12} className="animate-spin mr-2" /> {i18n.t('dashboard:competitionModal.loadingExams')}</div>}
                                        {!examLoading && examOptions.length === 0 && <div className="p-4 text-center text-xs text-slate-400">{i18n.t('dashboard:competitionModal.noExamsFound')}</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                        {examId && <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1"><CheckCircle size={11} className="text-green-500" /> {i18n.t('dashboard:competitionModal.examLinked')}</p>}
                    </div>
                </form>
                <div className="flex-none px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                        {i18n.t('dashboard:competitionModal.cancelBtn')}
                    </button>
                    <button type="submit" form="edit-competition-form" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold bg-humg-blue text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70">
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                        {isSubmitting ? i18n.t('dashboard:competitionModal.saving') : i18n.t('dashboard:competitionModal.saveChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCompetitionModal;
export { EditCompetitionModal };
