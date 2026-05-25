import { useEffect, useState } from 'react';
import { AdminResourceCategoryUpsertRequest } from '@/features/admin/types/admin.types';
import { ModalShell, FormField, inputBaseClass, inputErrorClass, inputNormalClass, inputDisabledClass } from './ModalShell';
import i18n from '@/i18n';

interface AdminResourceCategoryModalProps {
    isOpen: boolean;
    mode: 'create' | 'update';
    onClose: () => void;
    onSubmit: (payload: AdminResourceCategoryUpsertRequest, id?: number) => Promise<void>;
    isSubmitting: boolean;
    initialId?: number;
    initialValues?: AdminResourceCategoryUpsertRequest;
}

export const AdminResourceCategoryModal = ({ isOpen, mode, onClose, onSubmit, isSubmitting, initialId, initialValues }: AdminResourceCategoryModalProps) => {
    const [categoryId, setCategoryId] = useState('');
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('#3B82F6');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) return;
        setCategoryId(initialId ? String(initialId) : '');
        setLabel(initialValues?.label || '');
        setColor(initialValues?.color || '#3B82F6');
        setErrors({});
    }, [isOpen, initialId, initialValues]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!label.trim()) newErrors.label = i18n.t('dashboard:admin.resourceCategoryModal.nameRequired');
        if (!color.trim()) newErrors.color = i18n.t('dashboard:admin.resourceCategoryModal.colorRequired');
        else if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) newErrors.color = i18n.t('dashboard:admin.resourceCategoryModal.colorInvalid');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        await onSubmit({ label, color }, categoryId ? Number(categoryId) : undefined);
        onClose();
    };

    return (
        <ModalShell isOpen={isOpen} title={mode === 'create' ? i18n.t('dashboard:admin.resourceCategoryModal.createTitle') : i18n.t('dashboard:admin.resourceCategoryModal.updateTitle')} onClose={onClose}>
            {mode === 'update' && (
                <FormField label="Category ID">
                    <input type="number" className={`${inputBaseClass} ${inputDisabledClass}`} placeholder="Category ID" value={categoryId} disabled readOnly />
                </FormField>
            )}
            <FormField label={i18n.t('dashboard:admin.resourceCategoryModal.nameLabel')} required error={errors.label}>
                <input type="text" className={`${inputBaseClass} ${errors.label ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.resourceCategoryModal.placeholder')} value={label} onChange={(e) => setLabel(e.target.value)} />
            </FormField>
            <FormField label={i18n.t('dashboard:admin.resourceCategoryModal.colorLabel')} required error={errors.color}>
                <div className="flex gap-2">
                    <input type="text" className={`flex-1 ${inputBaseClass} ${errors.color ? inputErrorClass : inputNormalClass}`} placeholder="#3B82F6" value={color} onChange={(e) => setColor(e.target.value)} />
                    <input type="color" className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
            </FormField>
            <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? i18n.t('dashboard:admin.resourceCategoryModal.saving') : i18n.t('dashboard:admin.resourceCategoryModal.saveBtn')}
            </button>
        </ModalShell>
    );
};
