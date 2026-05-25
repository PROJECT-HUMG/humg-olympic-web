import { useState, useEffect, useRef, useMemo, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { X, Loader2, Pencil, UploadCloud, Trash2 } from 'lucide-react';
import { api } from '@/lib/api/apiClient';
import { newsRepository } from '@/features/news/api';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import type { NewsItem, UpdateNewsDTO, Category } from '@/features/news/types/news.types';

const inputClasses = 'w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl transition-[border-color,box-shadow] duration-200 focus:ring-2 focus:ring-humg-blue/20 focus:border-humg-blue outline-none shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400';
const labelClasses = 'block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide text-[11px]';

function parseInitialContent(news: NewsItem | null): unknown[] | undefined {
  if (!news?.content) return undefined;
  try {
    const raw = typeof news.content === 'string' ? JSON.parse(news.content) : news.content;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && Array.isArray((raw as { content?: unknown[] }).content)) return (raw as { content: unknown[] }).content;
    return undefined;
  } catch {
    return undefined;
  }
}

interface EditNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: NewsItem | null;
  onSuccess: () => void;
}

export const EditNewsModal = ({ isOpen, onClose, news, onSuccess }: EditNewsModalProps) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const initialContent = useMemo(() => parseInitialContent(news), [news?.id, news?.content]);

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post<{ url: string }>('/news/upload-image', formData);
    return res.url;
  }, []);

  const editor = useCreateBlockNote(
    initialContent ? { initialContent: initialContent as any, uploadFile } : { uploadFile },
    [news?.id, isOpen]
  );

  /* ── Defer BlockNoteView render until DOM container is ready ── */
  const editorReady = useRef(false);
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
  }, [isOpen, news?.id]);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await newsRepository.getCategories();
        setCategories(data);
      } catch {
        showToast(i18n.t('news:loadCategoriesFailed'), 'error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !news) return;
    setTitle(news.title);
    setSummary(news.summary);
    setIsFeatured(news.isFeatured ?? false);
    setThumbnail(null);
    setThumbnailPreviewUrl(news.thumbnailUrl || null);
    if (categories.length) {
      const match = categories.find(c => c.name === news.categoryName);
      setCategoryId(match ? match.id : categories[0].id);
    }
  }, [isOpen, news, categories]);

  useEffect(() => {
    if (!thumbnail) return;
    const url = URL.createObjectURL(thumbnail);
    setThumbnailPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnail]);

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnail(file);
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreviewUrl(news?.thumbnailUrl || null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!news || !title.trim() || !summary.trim()) {
      showToast(i18n.t('news:titleSummaryRequired'), 'error');
      return;
    }
    const catId = categoryId || (categories[0]?.id ?? 0);
    if (!catId) {
      showToast(i18n.t('news:categoryRequired'), 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const contentStr = editor.document ? JSON.stringify(editor.document) : '[]';
      const payload: UpdateNewsDTO = {
        id: news.id,
        title: title.trim(),
        summary: summary.trim(),
        content: contentStr,
        categoryId: catId,
        contentImageUrls: [],
        isFeatured,
        thumbnail: thumbnail ?? undefined,
      };
      await newsRepository.updateNews(news.id, payload);
      showToast(i18n.t('news:updateSuccess'), 'success');
      onSuccess();
      onClose();
    } catch {
      showToast(i18n.t('news:updateFailed'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const displayPreviewUrl = thumbnailPreviewUrl ?? news?.thumbnailUrl ?? null;

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center pt-20 md:pt-28 px-2 sm:px-4 pb-4 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white dark:bg-slate-900 w-full max-h-[90vh] max-w-3xl shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden my-4">
        <div className="flex-none px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pencil size={20} className="text-humg-blue" />
            {i18n.t('news:edit.title')}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X size={20} />
          </button>
        </div>
        <form id="edit-news-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className={labelClasses}>{i18n.t('news:edit.titleLabel')}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} placeholder={i18n.t('news:edit.titlePlaceholder')} required />
          </div>
          <div>
            <label className={labelClasses}>{i18n.t('news:edit.summaryLabel')}</label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} className={`${inputClasses} h-24 resize-none`} placeholder={i18n.t('news:edit.summaryPlaceholder')} required />
          </div>
          <div>
            <label className={labelClasses}>{i18n.t('news:edit.contentLabel')}</label>
            <div className="min-h-[280px] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950">
              {editorReady.current && <BlockNoteView editor={editor} theme={theme} className="!max-w-none min-h-[260px]" />}
            </div>
          </div>
          <div>
            <label className={labelClasses}>{i18n.t('news:edit.categoryLabel')}</label>
            <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))} className={inputClasses} disabled={isLoading}>
              {categories.length === 0 && <option value={0}>{i18n.t('news:edit.loadingCategories')}</option>}
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="edit-news-featured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded border-slate-300 text-humg-blue focus:ring-humg-blue" />
            <label htmlFor="edit-news-featured" className="text-sm font-medium text-slate-700 dark:text-slate-300">{i18n.t('news:edit.featuredLabel')}</label>
          </div>
          <div>
            <label className={labelClasses}>{i18n.t('news:edit.coverLabel')}</label>
            <div className="space-y-3">
              {displayPreviewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-video max-h-48">
                  <img src={displayPreviewUrl} alt={i18n.t('news:edit.coverPreview')} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer p-3 bg-white/90 rounded-full text-slate-800 hover:bg-white shadow-lg">
                      <UploadCloud size={20} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                    </label>
                    <button type="button" onClick={handleRemoveThumbnail} className="p-3 bg-red-500/90 rounded-full text-white hover:bg-red-600 shadow-lg">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 aspect-video max-h-48 cursor-pointer hover:border-humg-blue hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <UploadCloud size={28} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{i18n.t('news:edit.chooseCover')}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                </label>
              )}
              {displayPreviewUrl && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{i18n.t('news:edit.coverHint')}</p>
              )}
            </div>
          </div>
        </form>
        <div className="flex-none px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            {i18n.t('news:edit.cancel')}
          </button>
          <button type="submit" form="edit-news-form" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold bg-humg-blue text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {isSubmitting ? i18n.t('news:edit.saving') : i18n.t('news:edit.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
