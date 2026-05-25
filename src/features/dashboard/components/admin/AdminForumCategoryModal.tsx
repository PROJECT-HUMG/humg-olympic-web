import { useEffect, useState } from 'react';
import { AdminForumCategoryUpsertRequest } from '@/features/admin/types/admin.types';
import { ModalShell, FormField, inputBaseClass, inputErrorClass, inputNormalClass, inputDisabledClass } from './ModalShell';
import i18n from '@/i18n';

const getIconOptions = () => [
    { value: 'Book', emoji: '📚', label: i18n.t('dashboard:admin.forumCategoryModal.iconBook') },
    { value: 'Calculator', emoji: '🧮', label: i18n.t('dashboard:admin.forumCategoryModal.iconCalculator') },
    { value: 'Code', emoji: '💻', label: i18n.t('dashboard:admin.forumCategoryModal.iconCode') },
    { value: 'Globe', emoji: '🌍', label: i18n.t('dashboard:admin.forumCategoryModal.iconGlobe') },
    { value: 'MessageSquare', emoji: '💬', label: i18n.t('dashboard:admin.forumCategoryModal.iconMessageSquare') },
    { value: 'Award', emoji: '🏆', label: i18n.t('dashboard:admin.forumCategoryModal.iconAward') },
    { value: 'Users', emoji: '👥', label: i18n.t('dashboard:admin.forumCategoryModal.iconUsers') },
    { value: 'Lightbulb', emoji: '💡', label: i18n.t('dashboard:admin.forumCategoryModal.iconLightbulb') },
    { value: 'HelpCircle', emoji: '❓', label: i18n.t('dashboard:admin.forumCategoryModal.iconHelpCircle') },
    { value: 'Star', emoji: '⭐', label: i18n.t('dashboard:admin.forumCategoryModal.iconStar') },
    { value: 'Briefcase', emoji: '💼', label: i18n.t('dashboard:admin.forumCategoryModal.iconBriefcase') },
    { value: 'GraduationCap', emoji: '🎓', label: i18n.t('dashboard:admin.forumCategoryModal.iconGraduationCap') },
    { value: 'Beaker', emoji: '🧪', label: i18n.t('dashboard:admin.forumCategoryModal.iconBeaker') },
    { value: 'Music', emoji: '🎵', label: i18n.t('dashboard:admin.forumCategoryModal.iconMusic') },
    { value: 'Flame', emoji: '🔥', label: i18n.t('dashboard:admin.forumCategoryModal.iconFlame') },
];

interface AdminForumCategoryModalProps {
    isOpen: boolean;
    mode: 'create' | 'update';
    onClose: () => void;
    onSubmit: (payload: AdminForumCategoryUpsertRequest, id?: number) => Promise<void>;
    isSubmitting: boolean;
    initialId?: number;
    initialValues?: AdminForumCategoryUpsertRequest;
}

export const AdminForumCategoryModal = ({ isOpen, mode, onClose, onSubmit, isSubmitting, initialId, initialValues }: AdminForumCategoryModalProps) => {
    const [categoryId, setCategoryId] = useState('');
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('Book');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) return;
        setCategoryId(initialId ? String(initialId) : '');
        setName(initialValues?.name || '');
        setIcon(initialValues?.icon || 'Book');
        setErrors({});
    }, [isOpen, initialId, initialValues]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = i18n.t('dashboard:admin.forumCategoryModal.nameRequired');
        if (!icon.trim()) newErrors.icon = i18n.t('dashboard:admin.forumCategoryModal.iconRequired');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        await onSubmit({ name, icon }, categoryId ? Number(categoryId) : undefined);
        onClose();
    };

    const ICON_OPTIONS = getIconOptions();
    const selectedEmoji = ICON_OPTIONS.find(o => o.value === icon)?.emoji || '📚';

    return (
        <ModalShell isOpen={isOpen} title={mode === 'create' ? i18n.t('dashboard:admin.forumCategoryModal.createTitle') : i18n.t('dashboard:admin.forumCategoryModal.updateTitle')} onClose={onClose}>
            {mode === 'update' && (
                <FormField label="Category ID">
                    <input type="number" className={`${inputBaseClass} ${inputDisabledClass}`} placeholder="Category ID" value={categoryId} disabled readOnly />
                </FormField>
            )}
            <FormField label={i18n.t('dashboard:admin.forumCategoryModal.nameLabel')} required error={errors.name}>
                <input type="text" className={`${inputBaseClass} ${errors.name ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.forumCategoryModal.placeholder')} value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label={i18n.t('dashboard:admin.forumCategoryModal.iconLabel')} required error={errors.icon}>
                <div className="flex items-center gap-3">
                    <select className={`flex-1 ${inputBaseClass} ${errors.icon ? inputErrorClass : inputNormalClass}`} value={icon} onChange={(e) => setIcon(e.target.value)}>
                        {ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
                        ))}
                    </select>
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                        <span className="text-2xl">{selectedEmoji}</span>
                    </div>
                </div>
            </FormField>
            <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? i18n.t('dashboard:admin.forumCategoryModal.saving') : i18n.t('dashboard:admin.forumCategoryModal.saveBtn')}
            </button>
        </ModalShell>
    );
};
