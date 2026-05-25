import React, { useState, useEffect, useRef, useCallback, useMemo, useTransition } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import {
    X, Newspaper, Image as ImageIcon, Layout, Eye, UploadCloud,
    Send, Info, Trash2, Loader2, HelpCircle, Check, ChevronDown,
    Heading1, List, CheckSquare, Quote, Code, MoreHorizontal
} from 'lucide-react';
import { api } from '@/lib/api/apiClient';
import { newsRepository } from '@/features/news/api';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { Category } from '@/features/news/types/news.types';


function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) return;
            handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}


const CustomCategorySelect = ({
    categories,
    selectedId,
    onChange
}: {
    categories: Category[];
    selectedId: number | "";
    onChange: (id: number) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useOnClickOutside(ref, () => setIsOpen(false));

    const selectedCategory = categories.find(c => c.id === selectedId);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors duration-200 min-w-[200px] justify-between ${isOpen
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 dark:bg-indigo-900/20 dark:border-indigo-500'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800'
                    }`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <Layout size={16} className={isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-indigo-500"} />
                    <span className={`text-sm font-bold truncate ${isOpen ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
                        {selectedCategory ? selectedCategory.name : i18n.t('dashboard:contentModals.selectCategory2')}
                    </span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="max-h-[240px] overflow-y-auto p-1.5 custom-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                    onChange(cat.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${selectedId === cat.id
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="truncate text-left">{cat.name}</span>
                                {selectedId === cat.id && <Check size={14} className="text-indigo-500 flex-shrink-0 ml-2" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const ImageUploader = ({
    preview,
    onUpload,
    onRemove
}: {
    preview: string | null,
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove: () => void
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className={`group relative aspect-video rounded-3xl overflow-hidden transition-colors flex flex-col items-center justify-center cursor-pointer border-2 border-dashed ${preview
                ? 'border-transparent bg-slate-100 dark:bg-slate-800'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-500 hover:bg-indigo-50/10'
                }`}
            onClick={() => !preview && inputRef.current?.click()}
        >
            {preview ? (
                <>
                    <img src={preview} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-300" alt="Cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                        <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }} className="p-3 bg-white/90 rounded-full text-slate-900 shadow-xl hover:scale-110 transition-transform">
                            <UploadCloud size={20} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-3 bg-red-500/90 rounded-full text-white shadow-xl hover:scale-110 transition-transform">
                            <Trash2 size={20} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center p-6 space-y-3">
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <UploadCloud className="text-indigo-500" size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{i18n.t('dashboard:contentModals.uploadCover')}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{i18n.t('dashboard:contentModals.coverFormats')}</p>
                    </div>
                </div>
            )}
            <input type="file" className="hidden" ref={inputRef} accept="image/*" onChange={onUpload} />
        </div>
    );
};


const SyntaxHelpModal = ({ onClose }: { onClose: () => void }) => {
    const shortcuts = [
        { icon: <Heading1 size={16} />, label: i18n.t('dashboard:contentModals.headingShort'), syntax: "# + Space" },
        { icon: <List size={16} />, label: i18n.t('dashboard:contentModals.listShort'), syntax: "- + Space" },
        { icon: <CheckSquare size={16} />, label: "Checklist", syntax: "[] + Space" },
        { icon: <Quote size={16} />, label: i18n.t('dashboard:contentModals.quoteShort'), syntax: "> + Space" },
        { icon: <Code size={16} />, label: "Code Block", syntax: "``` + Enter" },
        { icon: <MoreHorizontal size={16} />, label: i18n.t('dashboard:contentModals.menuShort'), syntax: i18n.t('dashboard:contentModals.menuSyntax') },
    ];

    return (
        <div className="absolute top-16 right-6 z-50 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <HelpCircle size={16} className="text-indigo-500" />
                    {i18n.t('dashboard:contentModals.shortcutHelpTitle')}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-2 grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto">
                {shortcuts.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                            <span className="text-indigo-500">{item.icon}</span>
                            {item.label}
                        </div>
                        <code className="px-2 py-1 bg-slate-100 dark:bg-slate-950 rounded-lg text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                            {item.syntax}
                        </code>
                    </div>
                ))}
            </div>
        </div>
    );
};



interface PostNewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const PostNewsModal = ({ isOpen, onClose, onSuccess }: PostNewsModalProps) => {

    const [categories, setCategories] = useState<Category[]>([]);
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isPosting, startPostTransition] = useTransition();
    const [showHelp, setShowHelp] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [mobileTab, setMobileTab] = useState<'content' | 'settings'>('content');

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? "dark" : "light");
    }, [isOpen]);

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post<{ url: string }>('/news/upload-image', formData);
        return res.url;
    };
    const editor = useCreateBlockNote({ uploadFile });

    /* ── Defer BlockNoteView render until DOM container is ready ── */
    const editorReady = React.useRef(false);
    const [, forceRender] = useState(0);
    useEffect(() => {
        if (isOpen) {
            editorReady.current = false;
            const id = requestAnimationFrame(() => {
                editorReady.current = true;
                forceRender(n => n + 1);
            });
            return () => cancelAnimationFrame(id);
        } else {
            editorReady.current = false;
        }
    }, [isOpen]);


    useEffect(() => {
        if (isOpen) {
            const fetchCats = async () => {
                try {
                    const data = await newsRepository.getCategories();
                    setCategories(data);
                    if (data.length > 0 && !categoryId) setCategoryId(data[0].id);
                } catch (e) { showToast(i18n.t('dashboard:loadCategoriesFailed'), 'error'); }
            };
            fetchCats();
        }
    }, [isOpen]);

    const selectedCategory = useMemo(() => categories.find(c => c.id === categoryId), [categories, categoryId]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        const jsonContent = editor.document;
        if (!title.trim() || !summary.trim() || !thumbnail || !categoryId) {
            showToast(i18n.t('dashboard:news.fieldsRequired'), 'error');
            return;
        }

        startPostTransition(async () => {
            try {
                await newsRepository.createNews({
                    title: title.trim(),
                    summary: summary.trim(),
                    content: JSON.stringify(jsonContent),
                    categoryId: Number(categoryId),
                    thumbnail,
                    contentImageUrls: [],
                    isFeatured: false
                });
                showToast(i18n.t('dashboard:news.postSuccess'), 'success');
                if (onSuccess) onSuccess();
                onClose();
            } catch {
                showToast(i18n.t('dashboard:news.postFailed'), 'error');
            }
        });
    };

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTitle(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center isolate pt-[60px] md:pt-[72px] pb-0 md:pb-6 px-0 md:px-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* Modal Container - CMS Studio Layout */}
            <div className="relative w-full max-w-7xl h-full md:h-full bg-white dark:bg-slate-950 shadow-2xl rounded-none md:rounded-[24px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border-x md:border border-white/20 dark:border-slate-800 ring-1 ring-slate-900/5">

                {/* Header */}
                <div className="flex-none px-6 md:px-8 py-5 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Newspaper className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-none tracking-tight text-slate-900 dark:text-white">{i18n.t('dashboard:contentModals.editorTitle')}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Studio Mode</p>
                        </div>
                    </div>

                    {/* Mobile Tab Switcher */}
                    <div className="flex lg:hidden bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mx-4">
                        <button
                            onClick={() => setMobileTab('content')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${mobileTab === 'content' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {i18n.t('dashboard:contentModals.tabContent')}
                        </button>
                        <button
                            onClick={() => setMobileTab('settings')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${mobileTab === 'settings' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {i18n.t('dashboard:contentModals.tabSettings')}
                        </button>
                    </div>

                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-red-500">
                        <X size={22} />
                    </button>
                </div>

                {/* Body - Split View */}
                <div className="flex-1 flex overflow-hidden relative bg-slate-50/50 dark:bg-slate-950">

                    {/* Main Content Area (Editor) */}
                    <div className={`${mobileTab === 'content' ? 'block' : 'hidden'} lg:block flex-1 overflow-y-auto scrollbar-hide relative bg-white dark:bg-slate-950`}>
                        <div className="max-w-4xl mx-auto px-8 py-12 md:py-16 space-y-8">

                            {/* Title Input - Medium Style */}
                            <textarea
                                value={title}
                                onChange={handleTitleChange}
                                rows={1}
                                placeholder={i18n.t('dashboard:modals.newsTitle')}
                                className="w-full text-4xl md:text-5xl lg:text-6xl font-black bg-transparent border-none outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-800 text-slate-900 dark:text-white leading-[1.2] overflow-hidden tracking-tight"
                            />

                            {/* Editor */}
                            <div className="relative min-h-[500px] group/editor">
                                {editorReady.current && <BlockNoteView editor={editor} theme={theme} className="!max-w-none" />}
                                <div className="absolute top-0 right-0 opacity-0 group-hover/editor:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => setShowHelp(!showHelp)}
                                        className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                                        title={i18n.t('dashboard:modals.shortcutTitle')}
                                    >
                                        <HelpCircle size={20} />
                                    </button>
                                    {showHelp && <SyntaxHelpModal onClose={() => setShowHelp(false)} />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Settings (Desktop & Mobile Tab) */}
                    <div className={`${mobileTab === 'settings' ? 'block' : 'hidden'} lg:block w-full lg:w-[400px] bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 overflow-y-auto p-6 md:p-8 space-y-8 h-full custom-scrollbar`}>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                {i18n.t('dashboard:contentModals.categoryLabel2')}
                            </label>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <CustomCategorySelect categories={categories} selectedId={categoryId} onChange={setCategoryId} />
                                {selectedCategory?.description && (
                                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic px-1">
                                        {selectedCategory.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <ImageIcon size={14} /> {i18n.t('dashboard:contentModals.coverLabel')}
                            </label>
                            <ImageUploader preview={thumbnailPreview} onUpload={handleImageUpload} onRemove={() => { setThumbnail(null); setThumbnailPreview(null); }} />
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <Eye size={14} /> {i18n.t('dashboard:contentModals.summaryLabel')}
                            </label>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-colors shadow-sm">
                                <textarea
                                    value={summary}
                                    onChange={e => setSummary(e.target.value)}
                                    rows={6}
                                    className="w-full p-4 bg-transparent border-none outline-none text-sm text-slate-600 dark:text-slate-300 resize-none leading-relaxed font-medium"
                                    placeholder={i18n.t('dashboard:modals.newsSummary')}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 text-right">{summary.length}/200 {i18n.t('dashboard:contentModals.charCount')}</p>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="flex-none px-6 md:px-8 py-5 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center z-10">
                    <div className="flex gap-4 w-full md:w-auto">
                        <button onClick={onClose} className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            {i18n.t('dashboard:contentModals.cancel')}
                        </button>
                        <button onClick={handleSubmit} disabled={isPosting} className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-colors active:scale-95">
                            {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            {isPosting ? i18n.t('dashboard:contentModals.posting') : i18n.t('dashboard:contentModals.publishBtn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};