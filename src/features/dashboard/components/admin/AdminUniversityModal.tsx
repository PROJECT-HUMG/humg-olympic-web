import { useState } from 'react';
import { AdminUniversityUpsertRequest } from '@/features/admin/types/admin.types';
import { ModalShell, FormField, inputBaseClass, inputErrorClass, inputNormalClass, inputDisabledClass } from './ModalShell';
import i18n from '@/i18n';

interface AdminUniversityModalProps {
    isOpen: boolean;
    mode: 'create' | 'update';
    onClose: () => void;
    onSubmit: (payload: AdminUniversityUpsertRequest, id?: number) => Promise<void>;
    isSubmitting: boolean;
}

export const AdminUniversityModal = ({ isOpen, mode, onClose, onSubmit, isSubmitting }: AdminUniversityModalProps) => {
    const [universityId, setUniversityId] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = i18n.t('dashboard:admin.universityModal.required');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        await onSubmit({ name }, universityId ? Number(universityId) : undefined);
        onClose();
    };

    return (
        <ModalShell isOpen={isOpen} title={mode === 'create' ? i18n.t('dashboard:admin.universityModal.createTitle') : i18n.t('dashboard:admin.universityModal.updateTitle')} onClose={onClose}>
            {mode === 'update' && (
                <FormField label="University ID">
                    <input type="number" className={`${inputBaseClass} ${inputDisabledClass}`} placeholder="University ID" value={universityId} disabled readOnly />
                </FormField>
            )}
            <FormField label={i18n.t('dashboard:admin.universityModal.label')} required error={errors.name}>
                <input type="text" className={`${inputBaseClass} ${errors.name ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.universityModal.placeholder')} value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? i18n.t('dashboard:admin.universityModal.saving') : i18n.t('dashboard:admin.universityModal.saveBtn')}
            </button>
        </ModalShell>
    );
};
