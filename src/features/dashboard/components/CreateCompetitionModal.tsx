import React, { useState, useEffect, useRef } from 'react';
import {
    X, Trophy, Image as ImageIcon, CheckCircle, MapPin,
    Clock, Layout, Loader2, Link as LinkIcon,
    FileText, ChevronRight, ChevronLeft, Wand2, AlignLeft, Info, Users, Calendar,
    Gift, Plus, Trash2, Eye, EyeOff, BookOpen, Search
} from 'lucide-react';

import { MagneticWrapper } from '@/components/ui/MagneticWrapper';
import { CreateCompetitionRequest, Subject, Prize } from '@/features/competitions/types/competition.types';
import { ApiCompetitionRepository } from '@/features/competitions/api/ApiCompetitionRepository';
import { examRepository } from '@/features/exams/api';
import type { ExamSummary } from '@/features/exams/types/exam.types';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { extractErrorMessage } from '@/utils/errorUtils';
import { sanitizeHtml } from '@/utils/sanitize';


const CONTENT_TEMPLATE = `<h3 style="color:#0f172a;font-weight:700;margin-top:0;margin-bottom:0.5em;font-size:1.125rem;">1. Giới thiệu chung</h3>
<p style="color:#475569;margin:0 0 0.75em;">Cuộc thi nhằm tạo sân chơi học thuật, khuyến khích tinh thần nghiên cứu và vận dụng kiến thức vào thực tế.</p>
<h3 style="color:#0f172a;font-weight:700;margin-top:1em;margin-bottom:0.5em;font-size:1.125rem;">2. Đối tượng tham gia</h3>
<ul style="color:#475569;margin:0 0 0.75em;padding-left:1.5rem;">
<li>Sinh viên các khóa K65, K66, K67.</li>
<li>Yêu thích môn học và muốn cải thiện điểm quá trình.</li>
</ul>`;

const RULES_TEMPLATE = `<h3 style="color:#0f172a;font-weight:700;margin-top:0;margin-bottom:0.5em;font-size:1.125rem;">1. Hình thức làm bài</h3>
<p style="color:#475569;margin:0 0 0.75em;">Thi trắc nghiệm trên máy tính (hoặc tự luận). Thời gian: 60 phút.</p>
<h3 style="color:#0f172a;font-weight:700;margin-top:1em;margin-bottom:0.5em;font-size:1.125rem;">2. Quy định phòng thi</h3>
<ul style="color:#475569;margin:0 0 0.75em;padding-left:1.5rem;">
<li>Thí sinh có mặt trước giờ thi 15 phút.</li>
<li>Xuất trình thẻ sinh viên hoặc CCCD.</li>
<li>Nghiêm cấm sử dụng tài liệu và điện thoại.</li>
</ul>`;


const generateTimeOptions = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 15) {
            const hour = i.toString().padStart(2, '0');
            const minute = j.toString().padStart(2, '0');
            times.push(`${hour}:${minute}`);
        }
    }
    return times;
};
const TIME_OPTIONS = generateTimeOptions();

interface CreateCompetitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const competitionRepo = new ApiCompetitionRepository();


const inputClasses = "w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-humg-blue/10 focus:border-humg-blue outline-none shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-humg-blue/40 text-slate-900 dark:text-white placeholder:text-slate-400";
const labelClasses = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide text-[11px]";
const blockClasses = "bg-white dark:bg-slate-900 rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800/60 relative overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]";

export const CreateCompetitionModal = ({ isOpen, onClose, onSuccess }: CreateCompetitionModalProps) => {
    const [step, setStep] = useState<1 | 2>(1);


    const [title, setTitle] = useState('');
    const [subjectId, setSubjectId] = useState<string>('');
    const [type, setType] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');
    const [isFeatured, setIsFeatured] = useState(false);

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

    const [prizes, setPrizes] = useState<Omit<Prize, 'id'>[]>([
        { rankName: i18n.t('dashboard:competitionModal.defaultFirst'), prizeValue: i18n.t('dashboard:competitionModal.defaultFirstValue'), quantity: 1 },
        { rankName: i18n.t('dashboard:competitionModal.defaultSecond'), prizeValue: i18n.t('dashboard:competitionModal.defaultSecondValue'), quantity: 2 },
        { rankName: i18n.t('dashboard:competitionModal.defaultThird'), prizeValue: i18n.t('dashboard:competitionModal.defaultThirdValue'), quantity: 3 },
    ]);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formBodyRef = useRef<HTMLFormElement>(null);

    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    // Exam picker (for ONLINE type)
    const [exams, setExams] = useState<ExamSummary[]>([]);
    const [examId, setExamId] = useState<number | ''>('');
    const [isLoadingExams, setIsLoadingExams] = useState(false);
    const [examSearch, setExamSearch] = useState('');

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
        if (step === 2 && formBodyRef.current) {
            const el = formBodyRef.current;
            requestAnimationFrame(() => el.scrollTo({ top: 0, behavior: 'smooth' }));
        }
    }, [step]);

    useEffect(() => {
        if (isOpen) {
            const fetchSubjects = async () => {
                setIsLoadingSubjects(true);
                try {
                    const data = await competitionRepo.getSubjects();
                    setSubjects(data);
                    if (data.length > 0 && !subjectId) setSubjectId(String(data[0].id));
                } catch (error) {
                    showToast(i18n.t('dashboard:competition.loadSubjectsFailed'), 'error');
                } finally {
                    setIsLoadingSubjects(false);
                }
            };
            fetchSubjects();
            setStep(1);
        }
    }, [isOpen]);


    useEffect(() => {
        if (startDate && !endDate) setEndDate(startDate);
    }, [startDate]);

    // Fetch exams when type is ONLINE and subject changes
    useEffect(() => {
        if (type !== 'ONLINE' || !subjectId) {
            setExams([]);
            return;
        }
        const fetchExams = async () => {
            setIsLoadingExams(true);
            try {
                const res = await examRepository.getExams({
                    subjectId: Number(subjectId),
                    status: 'PUBLISHED',
                    limit: 50,
                });
                setExams(res.data);
            } catch {
                setExams([]);
            } finally {
                setIsLoadingExams(false);
            }
        };
        fetchExams();
    }, [type, subjectId]);

    // Reset examId when switching to OFFLINE
    useEffect(() => {
        if (type === 'OFFLINE') {
            setExamId('');
        }
    }, [type]);

    if (!isOpen) return null;


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
    };

    const combineDateTime = (dateStr: string, timeStr: string): Date | null => {
        if (!dateStr) return null;
        return new Date(`${dateStr}T${timeStr}:00`);
    };


    const handleNextStep = () => {

        if (!title.trim() || !subjectId || !startDate || !endDate || !deadlineDate || !location || !maxParticipants) {
            showToast(i18n.t('dashboard:competition.fillRequired'), 'error');
            return;
        }


        const start = combineDateTime(startDate, startTime);
        const end = combineDateTime(endDate, endTimeVal);
        const deadline = combineDateTime(deadlineDate, deadlineTime);
        const now = new Date();

        if (start && end && end <= start) {
            showToast(i18n.t('dashboard:competition.endBeforeStart'), 'error');
            return;
        }

        if (start && deadline && deadline >= start) {
            showToast(i18n.t('dashboard:competition.deadlineBeforeStart'), 'error');
            return;
        }

        if (deadline && deadline < now) {
            showToast(i18n.t('dashboard:competition.deadlineExpired'), 'error');
        }

        setStep(2);
        // Scroll to top is done in useEffect when step becomes 2
    };


    const handleAddPrize = () => {
        setPrizes([...prizes, { rankName: '', prizeValue: '', quantity: 1 }]);
    };

    const handleRemovePrize = (index: number) => {
        const newPrizes = [...prizes];
        newPrizes.splice(index, 1);
        setPrizes(newPrizes);
    };

    const handlePrizeChange = (index: number, field: keyof Omit<Prize, 'id'>, value: string | number) => {
        const newPrizes = [...prizes];
        newPrizes[index] = { ...newPrizes[index], [field]: value };
        setPrizes(newPrizes);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!summary.trim()) {
            showToast(i18n.t('dashboard:competition.summaryRequired'), 'error');
            return;
        }


        const invalidPrize = prizes.some(p => !p.rankName.trim() || !p.prizeValue.trim());
        if (invalidPrize) {
            showToast(i18n.t('dashboard:competition.prizeInfoRequired'), 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const startISO = combineDateTime(startDate, startTime)?.toISOString() || '';
            const endISO = combineDateTime(endDate, endTimeVal)?.toISOString();
            const deadlineISO = combineDateTime(deadlineDate, deadlineTime)?.toISOString();

            const requestData: CreateCompetitionRequest = {
                title, subjectId: parseInt(subjectId), type,
                startTime: startISO,
                endTime: endISO,
                registrationDeadline: deadlineISO,
                location, summary, maxParticipants,
                content: content || summary,
                rules: rules || i18n.t('dashboard:competitionModal.updating'),
                timeline: [],
                prizes: prizes,
                isFeatured,
                ...(type === 'ONLINE' && examId ? { examId: Number(examId) } : {}),
            };

            await competitionRepo.createCompetition(requestData, image || undefined);
            showToast(i18n.t('dashboard:competition.createSuccess'), 'success');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: unknown) {
            showToast(extractErrorMessage(error, i18n.t('dashboard:competition.errorOccurred')), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };


    const TimeSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
        <div className="relative">
            <select
                className={`${inputClasses} appearance-none pr-8 cursor-pointer font-mono text-center`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {TIME_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Clock size={16} />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center pt-[60px] md:pt-[72px] px-0 md:px-4 pb-0 md:pb-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-900 w-full h-full md:h-auto md:max-h-[85vh] md:max-w-5xl shadow-2xl flex flex-col
                rounded-t-[24px] md:rounded-[24px] mt-auto md:mt-0 
                animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-5 duration-300
                border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
            >

                {/* 1. Header - Sticky & Glass */}
                <div className="flex-none px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                            <span className="p-2 bg-humg-blue/10 rounded-xl text-humg-blue shadow-sm shadow-humg-blue/10">
                                <Trophy size={20} />
                            </span>
                            {i18n.t('dashboard:competitionModal.createTitle')}
                        </h2>

                        {/* Pro Stepper */}
                        <div className="flex items-center gap-2 mt-2 ml-1 text-xs font-medium">
                            <div className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${step === 1 ? 'bg-humg-blue/10 text-humg-blue' : 'text-slate-400 dark:text-slate-500'}`}>
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${step === 1 ? 'border-humg-blue bg-humg-blue text-white shadow-sm shadow-humg-blue/30'
                                    : step > 1 ? 'border-humg-blue bg-humg-blue/10 text-humg-blue' : 'border-slate-200 dark:border-slate-600 text-slate-400'
                                    }`}>1</span>
                                <span>{i18n.t('dashboard:competitionModal.step1')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                                <ChevronRight size={10} className="text-slate-300 dark:text-slate-600" />
                                <div className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                            </div>
                            <div className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${step === 2 ? 'bg-humg-blue/10 text-humg-blue' : 'text-slate-400 dark:text-slate-500'}`}>
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${step === 2 ? 'border-humg-blue bg-humg-blue text-white shadow-sm shadow-humg-blue/30' : 'border-slate-200 dark:border-slate-600 text-slate-400'
                                    }`}>2</span>
                                <span>{i18n.t('dashboard:competitionModal.step2')}</span>
                            </div>
                        </div>
                    </div>
                    <MagneticWrapper strength={15}>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </MagneticWrapper>
                </div>

                {/* 2. Form Body - Content Area */}
                <form ref={formBodyRef} id="create-competition-form" onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-950/30 space-y-8">

                    {/* === STEP 1: GENERAL INFO === */}
                    <div className={step === 1 ? 'block space-y-6' : 'hidden'}>

                        {/* Title */}
                        <div>
                            <label className={labelClasses}>{i18n.t('dashboard:competitionModal.titleLabel')} <span className="text-red-500">*</span></label>
                            <input type="text" className={`${inputClasses} text-lg font-semibold`} placeholder={i18n.t('dashboard:modals.competitionTitle')} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Subject */}
                            <div>
                                <label className={labelClasses}>{i18n.t('dashboard:competitionModal.subjectLabel')} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select className={`${inputClasses} appearance-none cursor-pointer`} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={isLoadingSubjects}>
                                        <option value="" disabled>{i18n.t('dashboard:competitionModal.selectSubject')}</option>
                                        {subjects.map(sub => (<option key={sub.id} value={sub.id}>{sub.name}</option>))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        {isLoadingSubjects ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} className="rotate-90" />}
                                    </div>
                                </div>
                            </div>

                            {/* Type */}
                            <div>
                                <label className={labelClasses}>{i18n.t('dashboard:competitionModal.typeLabel')}</label>
                                <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl">
                                    <button type="button" onClick={() => setType('OFFLINE')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${type === 'OFFLINE' ? 'bg-slate-100 dark:bg-slate-800 text-humg-blue shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                        <MapPin size={18} /> {i18n.t('dashboard:competitionModal.typeOffline')}
                                    </button>
                                    <button type="button" onClick={() => setType('ONLINE')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${type === 'ONLINE' ? 'bg-slate-100 dark:bg-slate-800 text-humg-blue shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                        <Layout size={18} /> {i18n.t('dashboard:competitionModal.typeOnline')}
                                    </button>
                                </div>

                                {/* Featured Checkbox */}
                                <div className="flex items-center gap-2 mt-3 ml-1">
                                    <input
                                        type="checkbox"
                                        id="comp-featured"
                                        checked={isFeatured}
                                        onChange={e => setIsFeatured(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-humg-blue focus:ring-humg-blue cursor-pointer"
                                    />
                                    <label htmlFor="comp-featured" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                                        {i18n.t('dashboard:competitionModal.markFeatured')}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Exam Picker (only for ONLINE) */}
                        {type === 'ONLINE' && (
                            <div className={blockClasses}>
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <BookOpen size={18} className="text-indigo-500" /> {i18n.t('dashboard:competitionModal.selectExam')}
                                </h3>

                                {!subjectId ? (
                                    <p className="text-sm text-slate-400 italic">{i18n.t('dashboard:competitionModal.pleaseSelectSubject')}</p>
                                ) : isLoadingExams ? (
                                    <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                                        <Loader2 size={16} className="animate-spin" /> {i18n.t('dashboard:competitionModal.loadingExams')}
                                    </div>
                                ) : exams.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic py-2">{i18n.t('dashboard:competitionModal.noPublishedExams')}</p>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Search */}
                                        <div className="relative">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder={i18n.t('dashboard:modals.searchExam')}
                                                value={examSearch}
                                                onChange={e => setExamSearch(e.target.value)}
                                                className={`${inputClasses} pl-10 py-2.5 text-sm`}
                                            />
                                        </div>

                                        {/* Exam list */}
                                        <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                            {exams
                                                .filter(ex => !examSearch || ex.title.toLowerCase().includes(examSearch.toLowerCase()))
                                                .map(ex => (
                                                    <button
                                                        key={ex.id}
                                                        type="button"
                                                        onClick={() => {
                                                            if (ex.id === examId) {
                                                                setExamId('');
                                                                setLocation('');
                                                            } else {
                                                                setExamId(ex.id);
                                                                setLocation(`${window.location.origin}/exams/${ex.id}`);
                                                            }
                                                        }}
                                                        className={`w-full text-left p-3 rounded-xl border-2 transition-colors duration-200 ${examId === ex.id
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                                                            }`}
                                                    >
                                                        <p className={`text-sm font-semibold mb-1 ${examId === ex.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>
                                                            {ex.title}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                                            <span>{ex.questionCount} {i18n.t('dashboard:competitionModal.questions')}</span>
                                                            <span>•</span>
                                                            <span>{ex.duration} {i18n.t('dashboard:competitionModal.minutes')}</span>
                                                            <span>•</span>
                                                            <span>{ex.totalPoints} {i18n.t('dashboard:competitionModal.points')}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                        </div>

                                        {/* Selected summary */}
                                        {examId && (() => {
                                            const sel = exams.find(e => e.id === examId);
                                            return sel ? (
                                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/15 border border-indigo-200 dark:border-indigo-700 text-sm">
                                                    <CheckCircle size={16} className="text-indigo-600 shrink-0" />
                                                    <span className="text-indigo-700 dark:text-indigo-300 font-medium truncate">{sel.title}</span>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Date & Time Group - Highlighted */}
                        <div className={blockClasses}>
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-humg-blue"></div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Calendar size={18} className="text-humg-blue" /> {i18n.t('dashboard:competitionModal.timeSection')} <span className="text-red-500">*</span>
                            </h3>

                            <div className="space-y-6">
                                {/* Start & End */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <div>
                                        <label className="text-xs font-bold text-green-600 mb-2 block uppercase">{i18n.t('dashboard:competitionModal.startFrom')}</label>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1 min-w-0">
                                                <input type="date" className={`${inputClasses} min-h-[44px]`} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                                            </div>
                                            <div className="w-full sm:w-36 shrink-0"><TimeSelect value={startTime} onChange={setStartTime} /></div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">{i18n.t('dashboard:competitionModal.endTo')}</label>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1 min-w-0">
                                                <input type="date" className={`${inputClasses} min-h-[44px]`} value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} required />
                                            </div>
                                            <div className="w-full sm:w-36 shrink-0"><TimeSelect value={endTimeVal} onChange={setEndTimeVal} /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800"></div>

                                {/* Registration Deadline */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info size={16} className="text-red-500" />
                                        <label className="text-xs font-bold text-red-500 uppercase">{i18n.t('dashboard:competitionModal.regDeadline')}</label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 min-w-0">
                                            <input type="date" className={`${inputClasses} min-h-[44px] border-red-200 focus:border-red-500 focus:ring-red-100`} value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} required />
                                        </div>
                                        <div className="w-full sm:w-36 shrink-0">
                                            <div className="relative">
                                                <select className={`${inputClasses} appearance-none pr-8 cursor-pointer font-mono min-h-[44px] border-red-200 focus:border-red-500 focus:ring-red-100 text-center`} value={deadlineTime} onChange={(e) => setDeadlineTime(e.target.value)}>
                                                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                                <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Participants */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>
                                    {type === 'OFFLINE' ? i18n.t('dashboard:competitionModal.locationLabel') : i18n.t('dashboard:competitionModal.linkLabel')}
                                    <span className="text-red-500"> *</span>
                                </label>
                                <div className="relative">
                                    {type === 'OFFLINE' ? (
                                        <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    ) : (
                                        <LinkIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    )}
                                    <input
                                        type="text"
                                        className={`${inputClasses} pl-12`}
                                        placeholder={type === 'OFFLINE' ? i18n.t('dashboard:competitionModal.locationPlaceholder') : i18n.t('dashboard:competitionModal.linkPlaceholder')}
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>{i18n.t('dashboard:competitionModal.maxParticipants')}</label>
                                <div className="relative">
                                    <Users size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="number" min="1" className={`${inputClasses} pl-12`} value={maxParticipants} onChange={(e) => setMaxParticipants(parseInt(e.target.value))} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>{i18n.t('dashboard:competitionModal.coverImage')}</label>
                                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                                {image && imagePreviewUrl ? (
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                                        <div className="aspect-video max-h-48 w-full bg-slate-100 dark:bg-slate-800">
                                            <img src={imagePreviewUrl} alt={i18n.t('dashboard:competitionModal.coverPreview')} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-slate-800">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">{image.name}</span>
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-humg-blue hover:underline">{i18n.t('dashboard:competitionModal.changeImage')}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`h-[50px] border border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-colors bg-white dark:bg-slate-900 border-slate-300 hover:border-humg-blue hover:text-humg-blue text-slate-400`} onClick={() => fileInputRef.current?.click()}>
                                        <span className="text-sm font-medium flex items-center gap-2"><ImageIcon size={18} /> {i18n.t('dashboard:competitionModal.uploadImage')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* === STEP 2: CONTENT, RULES & PRIZES === */}
                    <div className={step === 2 ? 'block space-y-8' : 'hidden'}>
                        <div>
                            <label className={labelClasses}>{i18n.t('dashboard:competitionModal.summaryLabel')} <span className="text-red-500">*</span></label>
                            <textarea className={`${inputClasses} h-28 resize-none leading-relaxed`} placeholder={i18n.t('dashboard:modals.competitionSummary')} value={summary} onChange={(e) => setSummary(e.target.value)}></textarea>
                        </div>

                        {/* Prizes Section (New) */}
                        <div className={blockClasses}>
                            <div className="flex justify-between items-center mb-6">
                                <label className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Gift size={20} className="text-humg-amber" /> {i18n.t('dashboard:competitionModal.prizeStructure')}
                                </label>
                                <button type="button" onClick={handleAddPrize} className="text-xs font-bold text-white bg-humg-blue hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-md">
                                    <Plus size={14} /> {i18n.t('dashboard:competitionModal.addPrize')}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {prizes.map((prize, idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_80px] gap-3 flex-1 min-w-0">
                                            <input
                                                type="text"
                                                placeholder={i18n.t('dashboard:modals.prizeName')}
                                                className={`${inputClasses} py-2.5 text-sm min-h-[44px]`}
                                                value={prize.rankName}
                                                onChange={(e) => handlePrizeChange(idx, 'rankName', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder={i18n.t('dashboard:modals.prizeValue')}
                                                className={`${inputClasses} py-2.5 text-sm min-h-[44px]`}
                                                value={prize.prizeValue}
                                                onChange={(e) => handlePrizeChange(idx, 'prizeValue', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                min="1"
                                                className={`${inputClasses} py-2.5 text-sm text-center min-h-[44px]`}
                                                value={prize.quantity}
                                                onChange={(e) => handlePrizeChange(idx, 'quantity', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePrize(idx)}
                                            className="self-center sm:self-start p-3 min-h-[44px] text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors touch-manipulation"
                                            aria-label={i18n.t('dashboard:actions.deleteTooltip')}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                                {prizes.length === 0 && (
                                    <div className="text-center py-4 text-slate-400 text-sm border border-dashed rounded-xl">{i18n.t('dashboard:competitionModal.noPrizes')}</div>
                                )}
                            </div>
                        </div>

                        {/* Content & Rules with preview */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className={`space-y-4 ${blockClasses}`}>
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    <label className={labelClasses}><AlignLeft size={16} className="inline mr-1 text-humg-blue" /> {i18n.t('dashboard:competitionModal.contentDetail')}</label>
                                    <button type="button" onClick={() => setContent(CONTENT_TEMPLATE.trim())} className="text-xs font-bold text-humg-blue hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Wand2 size={12} /> {i18n.t('dashboard:competitionModal.templateBtn')}</button>
                                </div>
                                <textarea className={`${inputClasses} h-40 font-mono text-sm leading-relaxed`} placeholder={i18n.t('dashboard:modals.htmlSupported')} value={content} onChange={(e) => setContent(e.target.value)} />
                                <details className="group mt-2">
                                    <summary className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-500 hover:text-humg-blue list-none [&::-webkit-details-marker]:hidden transition-colors w-fit">
                                        <Eye size={16} className="group-open:hidden" /><EyeOff size={16} className="hidden group-open:inline" /> {i18n.t('dashboard:competitionModal.preview')}
                                    </summary>
                                    <div className="mt-3 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 min-h-[80px] prose dark:prose-invert prose-sm max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:font-bold shadow-inner" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content || `<span class="text-slate-400 italic">${i18n.t('dashboard:competitionModal.noContent')}</span>`) }} />
                                </details>
                            </div>
                            <div className={`space-y-4 ${blockClasses}`}>
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    <label className={labelClasses}><FileText size={16} className="inline mr-1 text-humg-blue" /> {i18n.t('dashboard:competitionModal.rulesLabel')}</label>
                                    <button type="button" onClick={() => setRules(RULES_TEMPLATE.trim())} className="text-xs font-bold text-humg-blue hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Wand2 size={12} /> {i18n.t('dashboard:competitionModal.templateBtn')}</button>
                                </div>
                                <textarea className={`${inputClasses} h-40 font-mono text-sm leading-relaxed`} placeholder={i18n.t('dashboard:modals.htmlSupported')} value={rules} onChange={(e) => setRules(e.target.value)} />
                                <details className="group mt-2">
                                    <summary className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-500 hover:text-humg-blue list-none [&::-webkit-details-marker]:hidden transition-colors w-fit">
                                        <Eye size={16} className="group-open:hidden" /><EyeOff size={16} className="hidden group-open:inline" /> {i18n.t('dashboard:competitionModal.preview')}
                                    </summary>
                                    <div className="mt-3 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 min-h-[80px] prose dark:prose-invert prose-sm max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:font-bold shadow-inner" dangerouslySetInnerHTML={{ __html: sanitizeHtml(rules || `<span class="text-slate-400 italic">${i18n.t('dashboard:competitionModal.noContent')}</span>`) }} />
                                </details>
                            </div>
                        </div>
                    </div>

                </form>

                {/* 3. Footer Actions */}
                <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center z-10">
                    {step === 1 ? (
                        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <Info size={16} className="text-humg-blue" /> {i18n.t('dashboard:competitionModal.fillRequiredHint')}
                        </div>
                    ) : (
                        <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-base">
                            <ChevronLeft size={20} /> {i18n.t('dashboard:competitionModal.goBack')}
                        </button>
                    )}

                    <div className="flex gap-4 ml-auto">
                        <MagneticWrapper strength={10}>
                            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-base">{i18n.t('dashboard:competitionModal.cancelBtn')}</button>
                        </MagneticWrapper>

                        {step === 1 ? (
                            <MagneticWrapper strength={15}>
                                <button type="button" onClick={handleNextStep} className="px-8 py-3 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/25 hover:bg-blue-700 hover:shadow-humg-blue/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 text-base group">
                                    {i18n.t('dashboard:competitionModal.nextBtn')} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </MagneticWrapper>
                        ) : (
                            <MagneticWrapper strength={15}>
                                <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-base group">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />}
                                    {isSubmitting ? i18n.t('dashboard:competitionModal.creating') : i18n.t('dashboard:competitionModal.submitBtn')}
                                </button>
                            </MagneticWrapper>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};