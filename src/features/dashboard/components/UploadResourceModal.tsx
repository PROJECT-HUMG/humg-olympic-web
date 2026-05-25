import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, FileText, CheckCircle, ChevronDown, Check } from 'lucide-react';
import { UploadResourceDTO, ResourceCategory } from '@/features/resources/types/resources.types';
import { resourceRepository } from '@/features/resources/api';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';

interface UploadResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UploadResourceModal = ({ isOpen, onClose }: UploadResourceModalProps) => {
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [categories, setCategories] = useState<ResourceCategory[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            showToast(i18n.t('dashboard:resource.titleRequired'), 'error');
            return;
        }
        if (categoryId === '') {
            showToast(i18n.t('dashboard:resource.subjectRequired'), 'error');
            return;
        }
        if (!file) {
            showToast(i18n.t('dashboard:resource.fileRequired'), 'error');
            return;
        }

        setIsUploading(true);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        try {
            const dto: UploadResourceDTO = {
                title,
                categoryId: Number(categoryId),
                description,
                file
            };

            await resourceRepository.uploadResource(dto);

            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
                showToast(i18n.t('dashboard:resource.uploadSuccess'), 'success');
                setTitle('');
                setDescription('');
                setFile(null);
                setCategoryId('');
                setProgress(0);
                onClose();
            }, 500);

        } catch (error) {
            clearInterval(interval);
            showToast(i18n.t('dashboard:resource.uploadFailed'), 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pt-[60px] md:pt-[72px] px-0 md:px-4 pb-0 md:pb-4 animate-in fade-in duration-200">
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
                            <UploadCloud size={20} />
                        </span>
                        {i18n.t('dashboard:contentModals.uploadResourceTitle')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
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
                    <div className="relative">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{i18n.t('dashboard:contentModals.categoryLabel')} <span className="text-red-500">*</span></label>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full px-4 py-3 text-left bg-white dark:bg-slate-900/50 border rounded-xl transition-colors duration-200 focus:ring-2 focus:ring-humg-blue/20 focus:border-humg-blue outline-none shadow-sm hover:border-humg-blue/50 flex justify-between items-center ${isDropdownOpen ? 'border-humg-blue ring-2 ring-humg-blue/20' : 'border-slate-200 dark:border-slate-700'}`}
                            >
                                <span className={categoryId ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400'}>
                                    {categoryId ? categories.find(c => c.id === categoryId)?.label : i18n.t('dashboard:contentModals.selectCategory')}
                                </span>
                                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                        {categories.length > 0 ? (
                                            categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setCategoryId(cat.id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group ${categoryId === cat.id ? 'bg-blue-50 dark:bg-blue-900/20 text-humg-blue font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                                                >
                                                    {cat.label}
                                                    {categoryId === cat.id && <Check size={16} className="text-humg-blue" />}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-slate-400 text-center">{i18n.t('dashboard:contentModals.loadingCategories')}</div>
                                        )}
                                    </div>
                                </>
                            )}
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

                    {/* File Upload Area */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{i18n.t('dashboard:contentModals.fileLabel')} <span className="text-red-500">*</span></label>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-300 group ${file
                                ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                                : 'border-slate-300 dark:border-slate-700 hover:border-humg-blue hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                            />

                            {file ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                        <CheckCircle size={24} />
                                    </div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white break-all">{file.name}</p>
                                    <p className="text-xs font-medium text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <span className="text-xs mt-3 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 hover:text-humg-blue transition-colors">{i18n.t('dashboard:contentModals.clickToChange')}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-humg-blue group-hover:scale-110 transition-colors rounded-full flex items-center justify-center mb-3">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">{i18n.t('dashboard:contentModals.dragOrClick')}</p>
                                    <p className="text-xs mt-1 text-slate-400">PDF, Word, Excel, PowerPoint (Max 50MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-humg-blue h-2.5 rounded-full transition-colors duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}



                </form>

                {/* Footer Actions - Sticky */}
                <div className="flex-none p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <button
                        onClick={handleSubmit}
                        disabled={isUploading}
                        className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform-gpu"
                    >
                        {isUploading ? i18n.t('dashboard:contentModals.uploading') : i18n.t('dashboard:contentModals.uploadBtn')}
                    </button>
                    {isUploading && (
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-4">
                            <div className="bg-humg-blue h-1.5 rounded-full transition-colors duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};