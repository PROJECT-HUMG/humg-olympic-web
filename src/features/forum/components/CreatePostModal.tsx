import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { X, Globe, Send, Hash, Image as ImageIcon, AlignLeft, Type, CheckCircle } from 'lucide-react';
import { Category, CreatePostDTO, Author, Post } from '@/features/forum/types/forum.types';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';

interface CreatePostModalProps {
    isOpen: boolean;
    categories: Category[];
    onClose: () => void;
    onSubmit: (data: CreatePostDTO) => Promise<boolean>;
    postToEdit?: Post | null;
}

export const CreatePostModal = ({ isOpen, categories, onClose, onSubmit, postToEdit }: CreatePostModalProps) => {
    // 1. Get Current User Info (Để hiển thị avatar)
    const { user } = useAuth();
    const myAvatar = getAvatarUrl(user?.avatarUrl, user?.fullName || 'User');
    const myName = user?.fullName || i18n.t('forum:create.you');

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState<number | string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // Initialize logic
    useEffect(() => {
        if (isOpen) {
            if (postToEdit) {
                // Edit Mode
                setTitle(postToEdit.title);
                setContent(postToEdit.content);
                setCategoryId(postToEdit.category.id);
            } else {
                // Create Mode (Reset)
                setTitle('');
                setContent('');
                if (categories.length > 0) setCategoryId(categories[0].id);
            }
        }
    }, [isOpen, postToEdit, categories]);

    // Auto-resize textarea
    const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (contentRef.current) {
            contentRef.current.style.height = 'auto';
            contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
        }
    };

    if (!isOpen) return null;

    const extractTags = (text: string): string[] => {
        const regex = /#(\w+)/g;
        const matches = text.match(regex);
        return matches ? matches.map(tag => tag.substring(1)) : [];
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            showToast(i18n.t('forum:post.titleRequired'), 'error');
            return;
        }
        if (!content.trim()) {
            showToast(i18n.t('forum:post.contentRequired'), 'error');
            return;
        }
        if (!categoryId) {
            showToast(i18n.t('forum:post.topicRequired'), 'error');
            return;
        }

        setIsSubmitting(true);

        const tags = extractTags(content);
        const payload: CreatePostDTO = {
            title,
            content,
            categoryId: Number(categoryId),
            tags: tags
        };

        const success = await onSubmit(payload);
        setIsSubmitting(false);

        if (success) {
            onClose();
        }
    };

    const insertHashtag = () => {
        setContent(prev => prev + " #");
        contentRef.current?.focus();
    };

    return (
        // FIX Z-INDEX & POSITION: Giống PostDetailModal để tránh lỗi layout
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pb-4 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="create-post-title">

            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true"></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl shadow-2xl animate-fade-in-up border border-slate-200 dark:border-slate-700 rounded-[24px] flex flex-col max-h-[85vh] overflow-hidden">

                {/* 1. Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                    <h2 id="create-post-title" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="bg-humg-blue/10 text-humg-blue p-1.5 rounded-lg">
                            <Type size={20} />
                        </span>
                        {postToEdit ? i18n.t('forum:create.editTitle') : i18n.t('forum:create.createTitle')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        aria-label={i18n.t('forum:create.close')}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 2. Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50 dark:bg-slate-900/50">

                    {/* User Profile Info */}
                    <div className="flex items-center gap-3">
                        <img
                            src={myAvatar}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-sm object-cover"
                            onError={(e) => handleAvatarError(e, user?.fullName || 'User')}
                        />
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white text-base">{myName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                    {user?.role === 'LECTURER' ? i18n.t('forum:create.roleLecturer') : user?.role === 'ADMIN' ? i18n.t('forum:create.roleAdmin') : i18n.t('forum:create.roleStudent')}
                                </span>
                                <div className="text-xs text-humg-blue font-medium flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">
                                    <Globe size={10} /> {i18n.t('forum:create.public')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inputs Wrapper */}
                    <div className="space-y-4">
                        {/* Title Input */}
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder={i18n.t('forum:create.titlePlaceholder')}
                                className="w-full text-xl font-bold placeholder:text-slate-400 border-none focus:ring-0 bg-transparent p-0 text-slate-900 dark:text-white transition-colors"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoFocus
                            />
                            {/* Decorative line on focus (Optional CSS trick) */}
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-humg-blue group-focus-within:w-full transition-[width] duration-300"></div>
                        </div>

                        {/* Content Textarea */}
                        <div className="min-h-[150px]">
                            <textarea
                                ref={contentRef}
                                placeholder={i18n.t('forum:create.contentPlaceholder')}
                                className="w-full h-full min-h-[150px] resize-none border-none focus:ring-0 bg-transparent p-0 text-slate-600 dark:text-slate-300 placeholder:text-slate-400 text-base leading-relaxed"
                                value={content}
                                onChange={handleContentChange}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* 3. Footer Tools (Sticky Bottom) */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={insertHashtag}
                            className="p-2 rounded-xl text-humg-blue hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title={i18n.t('forum:create.addHashtag')}
                            aria-label={i18n.t('forum:create.addHashtagAria')}
                        >
                            <Hash size={22} />
                        </button>

                        {/* Category Select - Right Aligned */}
                        <div className="ml-auto relative">
                            <select
                                className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-humg-blue/20 focus:border-humg-blue text-slate-700 dark:text-slate-200 font-medium cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                aria-label={i18n.t('forum:create.selectTopic')}
                            >
                                {categories.filter(c => String(c.id) !== 'all').map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/30 hover:bg-blue-600 hover:shadow-blue-600/40 hover:scale-[1.01] active:scale-[0.99] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {isSubmitting ? (
                            <>{i18n.t('forum:create.posting')}</>
                        ) : (
                            <>
                                <Send size={20} />
                                {postToEdit ? i18n.t('forum:create.updateButton') : i18n.t('forum:create.submitButton')}
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div >
    );
};