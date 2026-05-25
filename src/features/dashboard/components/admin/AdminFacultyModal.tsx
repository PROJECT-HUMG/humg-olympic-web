import { useEffect, useState } from 'react';
import { AdminFacultyUpsertRequest } from '@/features/admin/types/admin.types';
import { ModalShell, FormField, inputBaseClass, inputErrorClass, inputNormalClass, inputDisabledClass } from './ModalShell';
import i18n from '@/i18n';

interface AdminFacultyModalProps {
    isOpen: boolean;
    mode: 'create' | 'update';
    onClose: () => void;
    onSubmit: (payload: AdminFacultyUpsertRequest, id?: number) => Promise<void>;
    isSubmitting: boolean;
    initialId?: number;
    initialName?: string;
    initialUniversityId?: number;
}

export const AdminFacultyModal = ({ isOpen, mode, onClose, onSubmit, isSubmitting, initialId, initialName, initialUniversityId }: AdminFacultyModalProps) => {
    const [facultyId, setFacultyId] = useState('');
    const [name, setName] = useState('');
    const [universityId, setUniversityId] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) return;
        setFacultyId(initialId ? String(initialId) : '');
        setName(initialName || '');
        setUniversityId(initialUniversityId ? String(initialUniversityId) : '');
        setErrors({});
    }, [isOpen, initialId, initialName, initialUniversityId]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = i18n.t('dashboard:admin.facultyModal.required');
        if (mode === 'create' && !universityId) newErrors.universityId = i18n.t('dashboard:admin.facultyModal.required');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (mode === 'create') {
            await onSubmit({ name, universityId: Number(universityId) });
        } else {
            await onSubmit({ name, universityId: initialUniversityId! }, Number(facultyId));
        }
        onClose();
    };

    return (
        <ModalShell isOpen={isOpen} title={mode === 'create' ? i18n.t('dashboard:admin.facultyModal.createTitle') : i18n.t('dashboard:admin.facultyModal.updateTitle')} onClose={onClose}>
            {mode === 'update' && (
                <FormField label="Faculty ID">
                    <input type="number" className={`${inputBaseClass} ${inputDisabledClass}`} placeholder="Faculty ID" value={facultyId} disabled readOnly />
                </FormField>
            )}
            <FormField label={i18n.t('dashboard:admin.facultyModal.label')} required error={errors.name}>
                <input type="text" className={`${inputBaseClass} ${errors.name ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.facultyModal.placeholder')} value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            {mode === 'create' && (
                <FormField label="University ID" required error={errors.universityId}>
                    <input type="number" className={`${inputBaseClass} ${errors.universityId ? inputErrorClass : inputNormalClass}`} placeholder="University ID" value={universityId} onChange={(e) => setUniversityId(e.target.value)} />
                </FormField>
            )}
            <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? i18n.t('dashboard:admin.facultyModal.saving') : i18n.t('dashboard:admin.facultyModal.saveBtn')}
            </button>
        </ModalShell>
    );
};
