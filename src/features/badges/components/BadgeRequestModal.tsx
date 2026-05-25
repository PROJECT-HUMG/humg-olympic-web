import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { X, Upload, ImageIcon, Loader2, Award, CheckCircle2 } from 'lucide-react';

import { BadgeItem } from '@/features/auth/types/auth.types';
import { BadgeFlat } from './BadgeFlat';
import i18n from '@/i18n';

interface BadgeRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBadges: BadgeItem[];
    onSubmit: (badgeId: number, proofImage: File) => Promise<boolean>;
    isSubmitting: boolean;
}

export const BadgeRequestModal = ({
    isOpen,
    onClose,
    availableBadges,
    onSubmit,
    isSubmitting,
}: BadgeRequestModalProps) => {
    const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedBadgeId(null);
            setProofImage(null);
            setPreviewUrl(null);
            setError(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (proofImage) {
            const url = URL.createObjectURL(proofImage);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreviewUrl(null);
    }, [proofImage]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError(i18n.t('features:badges.requestModal.imageOnly'));
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError(i18n.t('features:badges.requestModal.imageTooLarge'));
                return;
            }
            setProofImage(file);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!selectedBadgeId) {
            setError(i18n.t('features:badges.requestModal.selectBadge'));
            return;
        }
        if (!proofImage) {
            setError(i18n.t('features:badges.requestModal.uploadProof'));
            return;
        }

        setError(null);
        const success = await onSubmit(selectedBadgeId, proofImage);
        if (success) {
            onClose();
        }
    };

    const selectedBadge = availableBadges.find(b => b.id === selectedBadgeId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4 pb-4 overflow-hidden">
            <div
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={!isSubmitting ? onClose : undefined}
            />

            <div
                className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
            >
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Award className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {i18n.t('features:badges.requestModal.title')}
                        </h3>
                    </div>
                    {!isSubmitting && (
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    )}
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            {i18n.t('features:badges.requestModal.selectLabel')} <span className="text-red-500">*</span>
                        </label>

                        {availableBadges.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
                                <p className="font-medium text-slate-700 dark:text-slate-300">{i18n.t('features:badges.requestModal.allEarned')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl max-h-52 overflow-y-auto">
                                {availableBadges.map(badge => (
                                    <button
                                        key={badge.id}
                                        onClick={() => setSelectedBadgeId(badge.id)}
                                        className={`p-2 rounded-xl transition-colors ${selectedBadgeId === badge.id
                                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <BadgeFlat
                                            badge={{ ...badge, isEarned: true, isSelected: selectedBadgeId === badge.id }}
                                            onClick={() => { }}
                                            size="sm"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedBadge && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                    {selectedBadge.name}
                                    <span className="text-xs font-normal px-2 py-0.5 bg-white dark:bg-blue-900/50 rounded-md border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400">
                                        {({
                                            'ALGEBRA': i18n.t('features:team.subjects.algebra'),
                                            'CALCULUS': i18n.t('features:team.subjects.calculus'),
                                            'MATH': i18n.t('features:badges.requestModal.subjectMath'),
                                            'PHYSICS': i18n.t('features:team.subjects.physics'),
                                            'CHEMISTRY': i18n.t('features:team.subjects.chemistry'),
                                            'ENGLISH': i18n.t('features:team.subjects.english'),
                                            'ART': i18n.t('features:badges.requestModal.subjectArt'),
                                            'GENERAL': i18n.t('features:badges.requestModal.subjectGeneral')
                                        } as Record<string, string>)[selectedBadge.subject] || selectedBadge.subject}
                                    </span>
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    {selectedBadge.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            {i18n.t('features:badges.requestModal.proofLabel')} <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />

                        {previewUrl ? (
                            <div className="relative group">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                                />
                                <button
                                    onClick={() => {
                                        setProofImage(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                    <ImageIcon size={24} className="text-slate-400" />
                                </div>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {i18n.t('features:badges.requestModal.clickToUpload')}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {i18n.t('features:badges.requestModal.imageHint')}
                                </span>
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {i18n.t('common:cancelAction')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedBadgeId || !proofImage}
                        className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                {i18n.t('features:badges.requestModal.submitting')}
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                {i18n.t('features:badges.requestModal.submit')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
