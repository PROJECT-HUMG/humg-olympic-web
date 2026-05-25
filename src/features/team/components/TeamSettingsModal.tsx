import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';

import { X, Save, Settings, Loader2, AlertTriangle, Upload } from 'lucide-react';
import { Team, TeamStatus, UpdateTeamPayload } from '@/features/team/types/team.types';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/apiClient';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';

interface TeamSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    team: Team;
    onUpdate: (data: UpdateTeamPayload) => void;
    onDelete?: (teamId: number) => void;
    isLoading?: boolean;
}

export const TeamSettingsModal = ({
    isOpen, onClose, team, onUpdate, onDelete, isLoading = false
}: TeamSettingsModalProps) => {
    const { user } = useAuth();
    const isLecturer = user?.role === 'LECTURER';

    const [formData, setFormData] = useState<UpdateTeamPayload>({
        name: team.name, description: team.description, status: team.status, academicYear: team.academicYear, avatarUrl: team.avatarUrl
    });
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) setFormData({ name: team.name, description: team.description, status: team.status, academicYear: team.academicYear, avatarUrl: team.avatarUrl });
    }, [isOpen, team]);

    if (!isOpen) return null;

    const handleSubmit = (e: FormEvent) => { e.preventDefault(); onUpdate(formData); };

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
            showToast(i18n.t('features:team.logoUpdateSuccess'), 'success');
        } catch (error) {
            console.error('Error upload avatar:', error);
            showToast(i18n.t('features:team.logoUploadFailed'), 'error');
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-20">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={!isLoading ? onClose : undefined} />
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><Settings size={18} /></span>
                            {i18n.t('features:team.settings.title')}
                        </h2>
                    </div>
                    <button onClick={onClose} disabled={isLoading} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={22} /></button>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar">
                    <form id="settings-form" onSubmit={handleSubmit} className="space-y-5">
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

                                    <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity backdrop-blur-[2px]">
                                        <Upload size={20} className="mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{i18n.t('features:team.settings.changeLogo')}</span>
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
                                {i18n.t('features:team.settings.avatarHint')}
                            </p>
                        </div>

                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{i18n.t('features:team.settings.teamName')}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-[border-color,box-shadow] font-medium"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Status & Year Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{i18n.t('features:team.settings.status')}</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none appearance-none font-medium cursor-pointer focus:ring-2 focus:ring-blue-500/50"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as TeamStatus })}
                                    disabled={isLoading}
                                >
                                    <option value="ACTIVE">{i18n.t('features:team.settings.statusActive')}</option>
                                    <option value="FINISHED">{i18n.t('features:team.settings.statusFinished')}</option>
                                    {/* PENDING chỉ hiển thị cho ADMIN, không hiển thị cho LECTURER */}
                                    {!isLecturer && <option value="PENDING">{i18n.t('features:team.settings.statusPending')}</option>}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{i18n.t('features:team.settings.yearLabel')}</label>
                                <input type="text" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl text-slate-500 font-bold cursor-not-allowed" value={formData.academicYear} disabled />
                            </div>
                        </div>

                        {/* Desc */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{i18n.t('features:team.settings.description')}</label>
                            <textarea
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px] resize-none transition-[border-color,box-shadow]"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        {/* DANGER ZONE */}
                        {onDelete && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                                <h4 className="flex items-center gap-2 text-red-600 font-bold mb-2 text-sm"><AlertTriangle size={16} /> {i18n.t('features:team.settings.dangerZone')}</h4>
                                <p className="text-xs text-red-500/80 mb-3">{i18n.t('features:team.settings.dangerHint')}</p>
                                <button
                                    type="button"
                                    onClick={() => onDelete(team.id)}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-white dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 font-bold rounded-lg text-sm hover:bg-red-50 transition-colors"
                                >
                                    {i18n.t('features:team.settings.disbandTeam')}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 sticky bottom-0 z-20">
                    <button onClick={onClose} disabled={isLoading} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">{i18n.t('features:team.settings.cancel')}</button>
                    <button
                        type="submit"
                        form="settings-form"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {i18n.t('features:team.settings.saveChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
};