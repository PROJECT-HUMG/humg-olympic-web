import { useEffect, useState } from 'react';
import { AdminSubjectUpsertRequest } from '@/features/admin/types/admin.types';
import { ModalShell, FormField, inputBaseClass, inputErrorClass, inputNormalClass, inputDisabledClass } from './ModalShell';
import i18n from '@/i18n';

interface AdminSubjectModalProps {
    isOpen: boolean;
    mode: 'create' | 'update';
    onClose: () => void;
    onSubmit: (payload: AdminSubjectUpsertRequest, id?: number) => Promise<void>;
    isSubmitting: boolean;
    initialId?: number;
    initialValues?: AdminSubjectUpsertRequest;
}

export const AdminSubjectModal = ({ isOpen, mode, onClose, onSubmit, isSubmitting, initialId, initialValues }: AdminSubjectModalProps) => {
    const [subjectId, setSubjectId] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3B82F6');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) return;
        setSubjectId(initialId ? String(initialId) : '');
        setName(initialValues?.name || '');
        setCode(initialValues?.code || '');
        setDescription(initialValues?.description || '');
        setColor(initialValues?.color || '#3B82F6');
        setErrors({});
    }, [isOpen, initialId, initialValues]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = i18n.t('dashboard:admin.subjectModal.nameRequired');
        if (!code.trim()) newErrors.code = i18n.t('dashboard:admin.subjectModal.codeRequired');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        await onSubmit({ name, code, description, color }, subjectId ? Number(subjectId) : undefined);
        onClose();
    };

    return (
        <ModalShell isOpen={isOpen} title={mode === 'create' ? i18n.t('dashboard:admin.subjectModal.createTitle') : i18n.t('dashboard:admin.subjectModal.updateTitle')} onClose={onClose}>
            {mode === 'update' && (
                <FormField label="Subject ID">
                    <input type="number" className={`${inputBaseClass} ${inputDisabledClass}`} placeholder="Subject ID" value={subjectId} disabled readOnly />
                </FormField>
            )}
            <FormField label={i18n.t('dashboard:admin.subjectModal.nameLabel')} required error={errors.name}>
                <input type="text" className={`${inputBaseClass} ${errors.name ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.subjectModal.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label={i18n.t('dashboard:admin.subjectModal.codeLabel')} required error={errors.code}>
                <input type="text" className={`${inputBaseClass} ${errors.code ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.subjectModal.codePlaceholder')} value={code} onChange={(e) => setCode(e.target.value)} />
            </FormField>
            <FormField label={i18n.t('dashboard:admin.subjectModal.descLabel')}>
                <textarea className={`${inputBaseClass} ${inputNormalClass}`} placeholder={i18n.t('dashboard:admin.subjectModal.descPlaceholder')} value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormField>
            <FormField label={i18n.t('dashboard:admin.subjectModal.colorLabel')}>
                <div className="flex gap-2">
                    <input type="text" className={`flex-1 ${inputBaseClass} ${inputNormalClass}`} placeholder="#3B82F6" value={color} onChange={(e) => setColor(e.target.value)} />
                    <input type="color" className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
            </FormField>
            <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? i18n.t('dashboard:admin.subjectModal.saving') : i18n.t('dashboard:admin.subjectModal.saveBtn')}
            </button>
        </ModalShell>
    );
};
