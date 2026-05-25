import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';

import { X, Save, Calendar, BookOpen, Plus, Loader2, Sparkles, Target, Upload } from 'lucide-react';
import { CreateTeamPayload } from '@/features/team/types/team.types';
import { api } from '@/lib/api/apiClient';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';

interface CreateTeamModalProps {
    isOpen: boolean; onClose: () => void; onSubmit: (data: CreateTeamPayload) => Promise<void>; isLoading?: boolean;
}

const INITIAL_FORM_STATE: CreateTeamPayload = { name: '', subject: '', academicYear: '', description: '' };
const SUBJECTS = [i18n.t('features:team.subjects.algebra'), i18n.t('features:team.subjects.calculus'), i18n.t('features:team.subjects.physics'), i18n.t('features:team.subjects.chemistry'), i18n.t('features:team.subjects.english')];
const getAcademicYears = () => { const y = new Date().getFullYear(); return [`${y}-${y + 1}`, `${y + 1}-${y + 2}`]; };

export const CreateTeamModal = ({ isOpen, onClose, onSubmit, isLoading = false }: CreateTeamModalProps) => {
    const [formData, setFormData] = useState<CreateTeamPayload>(INITIAL_FORM_STATE);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (isOpen) setFormData({ ...INITIAL_FORM_STATE, academicYear: getAcademicYears()[0] }); }, [isOpen]);
    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => { e.preventDefault(); await onSubmit(formData); };

    const handleUploadAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast(i18n.t('features:team.imageOnly'), 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast(i18n.t('features:team.imageTooLarge'), 'error');
            return;
        }

        try {
            setIsUploadingAvatar(true);
            const uploadFormData = new FormData();
            uploadFormData.append('image', file);

            const res = await api.post<{ url: string }>('/news/upload-image', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({ ...prev, avatarUrl: res.url }));
            showToast(i18n.t('features:team.logoUploadSuccess'), 'success');
        } catch (error) {
            console.error('Error upload avatar:', error);
            showToast(i18n.t('features:team.logoUploadFailed'), 'error');
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" onClick={!isLoading ? onClose : undefined} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30"><Plus size={24} /></span>
                            {i18n.t('features:team.create.title')}
                        </h3>
                        <p className="text-slate-500 font-medium ml-1 mt-1">{i18n.t('features:team.create.subtitle')}</p>
                    </div>
                    <button onClick={onClose} disabled={isLoading} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <form id="create-team-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* 0. Avatar Upload */}
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500 shadow-sm relative">
                                    {isUploadingAvatar ? (
                                        <Loader2 size={28} className="animate-spin text-indigo-500" />
                                    ) : (
                                        <img
                                            src={formData.avatarUrl || '/assets/logo.png'}
                                            alt="Team Logo Preview"
                                            className={`w-full h-full object-cover transition-opacity ${!formData.avatarUrl ? 'opacity-50 p-4' : ''}`}
                                        />
                                    )}

                                    {/* Overlap interaction */}
                                    <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity backdrop-blur-[2px]">
                                        <Upload size={20} className="mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{i18n.t('features:team.create.changeLogo')}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleUploadAvatar}
                                            disabled={isUploadingAvatar || isLoading}
                                        />
                                    </label>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-3 font-medium text-center">
                                {i18n.t('features:team.create.avatarHint')}<br />
                                <span className={formData.avatarUrl ? 'text-emerald-500' : ''}>
                                    {formData.avatarUrl ? i18n.t('features:team.create.avatarUploaded') : i18n.t('features:team.create.avatarDefault')}
                                </span>
                            </p>
                        </div>

                        {/* 1. Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{i18n.t('features:team.create.teamName')} <span className="text-red-500">*</span></label>
                                <input required type="text" disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-colors font-semibold" placeholder={i18n.t('features:team.create.teamNamePlaceholder')} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{i18n.t('features:team.create.yearLabel')}</label>
                                <div className="relative">
                                    <select disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none font-semibold cursor-pointer" value={formData.academicYear} onChange={e => setFormData({ ...formData, academicYear: e.target.value })}>
                                        {getAcademicYears().map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Calendar size={18} /></div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Visual Subject Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><BookOpen size={16} /> {i18n.t('features:team.create.subjectLabel')} <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {SUBJECTS.map(sub => (
                                    <button
                                        key={sub} type="button" disabled={isLoading}
                                        onClick={() => setFormData({ ...formData, subject: sub })}
                                        className={`px-4 py-3 rounded-xl border font-bold text-sm transition-colors ${formData.subject === sub
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30 transform scale-105'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                            }`}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Description */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Target size={16} /> {i18n.t('features:team.create.descLabel')}</label>
                            <textarea
                                disabled={isLoading}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-colors resize-none h-24 font-medium"
                                placeholder={i18n.t('features:team.create.descPlaceholder')}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex justify-end gap-3">
                    <button onClick={onClose} disabled={isLoading} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{i18n.t('features:team.create.cancelBtn')}</button>
                    <button form="create-team-form" type="submit" disabled={isLoading} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/30 flex items-center gap-2 hover:scale-105 transition-colors">
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        <span>{i18n.t('features:team.create.submitBtn')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};