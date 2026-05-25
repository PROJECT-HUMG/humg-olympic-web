import React, { useState, useEffect, useTransition } from 'react';
import { X, Edit, FileText } from 'lucide-react';
import { ResourceItem, UpdateResourceDTO, ResourceCategory } from '@/features/resources/types/resources.types';
import { resourceRepository } from '@/features/resources/api';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { extractErrorMessage } from '@/utils/errorUtils';

interface UpdateResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    resource: ResourceItem | null;
    onUpdate: (id: number, data: UpdateResourceDTO) => Promise<boolean>;
}

export const UpdateResourceModal = ({ isOpen, onClose, resource, onUpdate }: UpdateResourceModalProps) => {
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [isUpdating, startUpdateTransition] = useTransition();
    const [categories, setCategories] = useState<ResourceCategory[]>([]);

    useEffect(() => {
        const loadCats = async () => {
            try {
                const cats = await resourceRepository.getCategories();
                setCategories(cats);
            } catch (e) {
                showToast(i18n.t('dashboard:loadSubjectsFailed'), 'error');
            }
        };
        if (isOpen) loadCats();
    }, [isOpen]);

    useEffect(() => {
        if (resource) {
            setTitle(resource.title);
            setCategoryId(resource.categoryId || '');
            setDescription(resource.description || '');
        }
    }, [resource, isOpen]);

    if (!isOpen || !resource) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            showToast(i18n.t('dashboard:resource.titleRequired'), 'error');
            return;
        }

        startUpdateTransition(async () => {
            try {
                const dto: UpdateResourceDTO = {
                    title,
                    categoryId: categoryId ? Number(categoryId) : undefined,
                    description,
                };

                await onUpdate(resource.id, dto);

                showToast(i18n.t('dashboard:resource.updateSuccess'), 'success');
                onClose();
            } catch (error: unknown) {
                showToast(extractErrorMessage(error, i18n.t('dashboard:resource.updateFailed')), 'error');
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[60px] md:pt-[72px] px-0 md:px-4 pb-0 md:pb-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-900 w-full h-full md:h-auto md:max-h-[85vh] md:max-w-xl shadow-2xl flex flex-col
                rounded-t-[24px] md:rounded-[24px] mt-auto md:mt-0 
                animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-5 duration-300
                border-t border-x md:border border-white/20 dark:border-slate-800 ring-1 ring-black/5 overflow-hidden"
            >

                {/* Header - Sticky & Glass */}
                <div className="flex-none px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 flex justify-between items-center">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <span className="p-2 bg-humg-blue/10 rounded-xl text-humg-blue shadow-sm shadow-humg-blue/10">
                            <Edit size={20} />
                        </span>
                        {i18n.t('dashboard:contentModals.editResourceTitle')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{i18n.t('dashboard:contentModals.resourceTitleLabel')} <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border rounded-xl transition-colors duration-200 focus:ring-2 focus:ring-humg-blue/20 focus:border-humg-blue outline-none shadow-sm hover:border-humg-blue/50 text-slate-900 dark:text-white placeholder:text-slate-400"
                            placeholder={i18n.t('dashboard:modals.uploadTitle')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{i18n.t('dashboard:contentModals.categoryLabel')} <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border rounded-xl transition-colors duration-200 focus:ring-2 focus:ring-humg-blue/20 focus:border-humg-blue outline-none shadow-sm hover:border-humg-blue/50 text-slate-900 dark:text-white placeholder:text-slate-400 appearance-none cursor-pointer"
                                value={categoryId}
                                onChange={(e) => setCategoryId(Number(e.target.value))}
                            >
                                <option value="" disabled>{i18n.t('dashboard:contentModals.selectCategory')}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{i18n.t('dashboard:contentModals.descriptionLabel')}</label>
                        <textarea
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border rounded-xl transition-colors duration-200 focus:ring-2 focus:ring-humg-blue/20 focus:border-humg-blue outline-none shadow-sm hover:border-humg-blue/50 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none h-28"
                            placeholder={i18n.t('dashboard:modals.uploadNote')}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                </form>

                {/* Footer Actions - Sticky */}
                <div className="flex-none p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <button
                        onClick={handleSubmit}
                        disabled={isUpdating}
                        className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform-gpu"
                    >
                        {isUpdating ? i18n.t('dashboard:contentModals.updating') : i18n.t('dashboard:contentModals.saveChanges')}
                    </button>
                    {isUpdating && (
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-4">
                            <div className="bg-humg-blue h-1.5 rounded-full transition-colors duration-300 animate-pulse w-full"></div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};
