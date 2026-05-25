import { useEffect, useState, useRef } from 'react';
import { UploadCloud, ImageIcon, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api/apiClient';
import { AdminBadgeUpsertRequest } from '@/features/admin/types/admin.types';
import { ModalShell, FormField, inputBaseClass, inputErrorClass, inputNormalClass, inputDisabledClass } from './ModalShell';
import i18n from '@/i18n';

interface AdminBadgeModalProps {
    isOpen: boolean;
    mode: 'create' | 'update';
    onClose: () => void;
    onSubmit: (payload: AdminBadgeUpsertRequest, id?: number) => Promise<void>;
    isSubmitting: boolean;
    initialId?: number;
    initialValues?: AdminBadgeUpsertRequest;
}

export const AdminBadgeModal = ({ isOpen, mode, onClose, onSubmit, isSubmitting, initialId, initialValues }: AdminBadgeModalProps) => {
    const [badgeId, setBadgeId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<AdminBadgeUpsertRequest['type']>('NATIONAL');
    const [subject, setSubject] = useState<AdminBadgeUpsertRequest['subject']>('MATH');
    const [level, setLevel] = useState(1);
    const [iconUrl, setIconUrl] = useState('');
    const [iconPreview, setIconPreview] = useState('');
    const [iconUploading, setIconUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) return;
        setBadgeId(initialId ? String(initialId) : '');
        setName(initialValues?.name || '');
        setDescription(initialValues?.description || '');
        setType(initialValues?.type || 'NATIONAL');
        setSubject(initialValues?.subject || 'MATH');
        setLevel(initialValues?.level || 1);
        const existingUrl = initialValues?.iconUrl || '';
        setIconUrl(existingUrl);
        setIconPreview(existingUrl);
        setErrors({});
    }, [isOpen, initialId, initialValues]);

    const handleIconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const blobUrl = URL.createObjectURL(file);
        setIconPreview(blobUrl);
        setIconUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await api.post<{ url: string }>('/news/upload-image', formData);
            setIconUrl(res.url);
            setIconPreview(res.url);
        } catch {
            setIconPreview(iconUrl);
        } finally {
            setIconUploading(false);
            URL.revokeObjectURL(blobUrl);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleIconRemove = () => {
        setIconUrl('');
        setIconPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = i18n.t('dashboard:admin.badge.nameRequired');
        if (!description.trim()) newErrors.description = i18n.t('dashboard:admin.badge.descRequired');
        if (level < 1) newErrors.level = i18n.t('dashboard:admin.badge.levelRequired');
        if (mode === 'update' && !badgeId) newErrors.badgeId = i18n.t('dashboard:admin.badge.badgeIdRequired');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        await onSubmit(
            { name, description, type, subject, level, iconUrl: iconUrl.trim() || null },
            badgeId ? Number(badgeId) : undefined
        );
        onClose();
    };

    return (
        <ModalShell isOpen={isOpen} title={mode === 'create' ? i18n.t('dashboard:admin.badge.title') : i18n.t('dashboard:admin.badge.titleUpdate')} onClose={onClose}>
            {mode === 'update' && (
                <FormField label="Badge ID" error={errors.badgeId}>
                    <input type="number" className={`${inputBaseClass} ${inputDisabledClass}`} placeholder="Badge ID" value={badgeId} onChange={(e) => setBadgeId(e.target.value)} disabled readOnly />
                </FormField>
            )}
            <FormField label={i18n.t('dashboard:admin.badge.nameLabel')} required error={errors.name}>
                <input type="text" className={`${inputBaseClass} ${errors.name ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.badge.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label={i18n.t('dashboard:admin.badge.descLabel')} required error={errors.description}>
                <textarea className={`${inputBaseClass} ${errors.description ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.badge.descPlaceholder')} value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
                <FormField label={i18n.t('dashboard:admin.badge.typeLabel')}>
                    <select className={`${inputBaseClass} ${inputNormalClass}`} value={type} onChange={(e) => setType(e.target.value as AdminBadgeUpsertRequest['type'])}>
                        <option value="NATIONAL">{i18n.t('dashboard:admin.badge.typeNational')}</option>
                        <option value="SCHOOL">{i18n.t('dashboard:admin.badge.typeSchool')}</option>
                        <option value="STREAK">{i18n.t('dashboard:admin.badge.typeStreak')}</option>
                        <option value="LEARNING">{i18n.t('dashboard:admin.badge.typeLearning')}</option>
                        <option value="TEAM">{i18n.t('dashboard:admin.badge.typeTeam')}</option>
                    </select>
                </FormField>
                <FormField label={i18n.t('dashboard:admin.badge.subjectLabel')}>
                    <select className={`${inputBaseClass} ${inputNormalClass}`} value={subject} onChange={(e) => setSubject(e.target.value as AdminBadgeUpsertRequest['subject'])}>
                        <option value="MATH">{i18n.t('dashboard:admin.badge.subjectMath')}</option>
                        <option value="PHYSICS">{i18n.t('dashboard:admin.badge.subjectPhysics')}</option>
                        <option value="CHEMISTRY">{i18n.t('dashboard:admin.badge.subjectChemistry')}</option>
                        <option value="ENGLISH">{i18n.t('dashboard:admin.badge.subjectEnglish')}</option>
                        <option value="ART">{i18n.t('dashboard:admin.badge.subjectArt')}</option>
                        <option value="GENERAL">{i18n.t('dashboard:admin.badge.subjectGeneral')}</option>
                        <option value="ALGEBRA">{i18n.t('dashboard:admin.badge.subjectAlgebra')}</option>
                        <option value="CALCULUS">{i18n.t('dashboard:admin.badge.subjectCalculus')}</option>
                    </select>
                </FormField>
            </div>
            <FormField label="Level" required error={errors.level}>
                <input type="number" className={`${inputBaseClass} ${errors.level ? inputErrorClass : inputNormalClass}`} placeholder="Level" min={1} max={4} value={level} onChange={(e) => setLevel(Number(e.target.value))} />
            </FormField>
            <FormField label={i18n.t('dashboard:admin.badge.iconLabel')}>
                <div className="space-y-2">
                    <div
                        className="relative group rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/50 h-28 flex items-center justify-center cursor-pointer"
                        onClick={() => !iconUploading && fileInputRef.current?.click()}
                    >
                        {iconPreview ? (
                            <img src={iconPreview} alt="preview" className={`w-full h-full object-contain p-3 transition-opacity ${iconUploading ? 'opacity-40' : 'opacity-100'}`} onError={() => setIconPreview('')} />
                        ) : (
                            <div className="flex flex-col items-center gap-1.5 text-slate-400 pointer-events-none">
                                <ImageIcon size={24} />
                                <span className="text-xs">{i18n.t('dashboard:admin.badge.iconClickSelect')}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <div className="p-2.5 bg-white/90 rounded-full text-slate-800 shadow-lg" title={i18n.t('dashboard:admin.badge.iconSelectImage')}><UploadCloud size={18} /></div>
                            {iconUrl && (
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleIconRemove(); }} className="p-2.5 bg-red-500/90 rounded-full text-white shadow-lg hover:bg-red-600" title={i18n.t('dashboard:admin.badge.iconRemoveImage')}>
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        {iconUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
                                <Loader2 size={24} className="animate-spin text-humg-blue" />
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleIconFileChange} />
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <ImageIcon size={11} />
                        {iconPreview ? i18n.t('dashboard:admin.badge.iconHoverHint') : i18n.t('dashboard:admin.badge.iconSelectHint')}
                    </p>
                </div>
            </FormField>
            <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? i18n.t('dashboard:admin.saving') : i18n.t('dashboard:admin.badge.save')}
            </button>
        </ModalShell>
    );
};
