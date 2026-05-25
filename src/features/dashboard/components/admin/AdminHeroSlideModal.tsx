import { useEffect, useState } from 'react';
import { AdminHeroSlideUpsertRequest } from '@/features/admin/types/admin.types';
import { ModalShell, FormField, inputBaseClass, inputErrorClass, inputNormalClass, inputDisabledClass } from './ModalShell';
import i18n from '@/i18n';

interface AdminHeroSlideModalProps {
    isOpen: boolean;
    mode: 'create' | 'update';
    onClose: () => void;
    onSubmit: (payload: AdminHeroSlideUpsertRequest, id?: number | string) => Promise<void>;
    isSubmitting: boolean;
    initialId?: number | string;
    initialValues?: AdminHeroSlideUpsertRequest;
}

export const AdminHeroSlideModal = ({ isOpen, mode, onClose, onSubmit, isSubmitting, initialId, initialValues }: AdminHeroSlideModalProps) => {
    const [slideId, setSlideId] = useState('');
    const [label, setLabel] = useState('');
    const [title, setTitle] = useState('');
    const [imageFile, setImageFile] = useState<File | undefined>();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) return;
        setSlideId(initialId ? String(initialId) : '');
        setLabel(initialValues?.label || '');
        setTitle(initialValues?.title || '');
        setImageFile(undefined);
        setImagePreview(null);
        setErrors({});
    }, [isOpen, initialId, initialValues]);

    useEffect(() => {
        return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
    }, [imagePreview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageFile(file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!label.trim()) newErrors.label = i18n.t('dashboard:admin.heroSlideModal.labelRequired');
        if (!title.trim()) newErrors.title = i18n.t('dashboard:admin.heroSlideModal.titleRequired');
        if (mode === 'create' && !imageFile) newErrors.imageFile = i18n.t('dashboard:admin.heroSlideModal.imageRequired');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        await onSubmit({ label, title, imageFile }, slideId || undefined);
        onClose();
    };

    return (
        <ModalShell isOpen={isOpen} title={mode === 'create' ? i18n.t('dashboard:admin.heroSlideModal.createTitle') : i18n.t('dashboard:admin.heroSlideModal.updateTitle')} onClose={onClose}>
            {mode === 'update' && (
                <FormField label={i18n.t('dashboard:admin.heroSlideModal.idLabel')}>
                    <input type="text" className={`${inputBaseClass} ${inputDisabledClass}`} placeholder={i18n.t('dashboard:admin.heroSlideModal.idPlaceholder')} value={slideId} disabled readOnly />
                </FormField>
            )}
            <FormField label={i18n.t('dashboard:admin.heroSlideModal.labelLabel')} required error={errors.label}>
                <input type="text" className={`${inputBaseClass} ${errors.label ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.heroSlideModal.labelPlaceholder')} value={label} onChange={(e) => setLabel(e.target.value)} />
            </FormField>
            <FormField label={i18n.t('dashboard:admin.heroSlideModal.titleLabel')} required error={errors.title}>
                <input type="text" className={`${inputBaseClass} ${errors.title ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.heroSlideModal.titlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>
            <FormField label={i18n.t('dashboard:admin.heroSlideModal.imageLabel')} required={mode === 'create'} error={errors.imageFile}>
                <input type="file" accept="image/*" className={`${inputBaseClass} ${errors.imageFile ? inputErrorClass : inputNormalClass} border-dashed`} onChange={handleFileChange} />
                {imagePreview && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                            {imageFile?.name} ({(imageFile?.size ? (imageFile.size / 1024).toFixed(1) : 0)} KB)
                        </div>
                    </div>
                )}
            </FormField>
            <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? i18n.t('dashboard:admin.heroSlideModal.saving') : i18n.t('dashboard:admin.heroSlideModal.saveBtn')}
            </button>
        </ModalShell>
    );
};
