import { useEffect, useState, useRef, useCallback, type ElementType, type ChangeEvent, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, Save, Plus, Trash2, BookOpen, Compass, BookMarked,
    Lock, Unlock, ChevronDown, Search, CheckCircle, Loader2,
    FileText, Video, GraduationCap, Layers, X, ImageIcon,
    ChevronUp, UploadCloud, Globe, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { roadmapRepository } from '@/features/roadmap/api';
import { teamRepository } from '@/features/team/api';
import { examRepository } from '@/features/exams/api';
import { resourceRepository } from '@/features/resources/api';
import { api } from '@/lib/api/apiClient';
import { UpdateRoadmapRequest, RoadmapDetail, RoadmapStage, StageResource } from '@/features/roadmap/types/roadmap.types';
import { Team } from '@/features/team/types/team.types';
import type { ExamSummary } from '@/features/exams/types/exam.types';
import type { ResourceItem } from '@/features/resources/types/resources.types';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { extractErrorMessage } from '@/utils/errorUtils';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const LOGO_FALLBACK = '/assets/logo.png';

const RESOURCE_TYPE_META: Record<string, { icon: ElementType; color: string; bg: string; label: string }> = {
    DOC: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', label: i18n.t('roadmap:editor.docLabel') },
    VIDEO: { icon: Video, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Video' },
    EXAM: { icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', label: i18n.t('roadmap:editor.examLabel') },
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const Sk = ({ className }: { className: string }) =>
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700/60 rounded-xl ${className}`} />;

const RoadmapEditorSkeleton = () => (
    <div className="min-h-screen pt-[72px]">
        {/* Top bar */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 gap-4">
            <Sk className="w-8 h-8 rounded-lg" />
            <Sk className="w-40 h-5" />
            <div className="ml-auto"><Sk className="w-28 h-9 rounded-xl" /></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 md:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-3">
                <Sk className="w-full h-12" />
                <Sk className="w-full h-12" />
                <Sk className="w-full h-20" />
                <Sk className="w-full h-32" />
            </div>
            <div className="lg:col-span-8 space-y-4">
                {[1, 2].map(i => <Sk key={i} className="w-full h-40" />)}
            </div>
        </div>
    </div>
);

// ─── IMAGE UPLOAD INPUT ────────────────────────────────────────────────────────
const ImageUploadInput = ({ value, onChange }: { value: string; onChange: (url: string) => void }) => {
    const [uploading, setUploading] = useState(false);
    const [previewSrc, setPreviewSrc] = useState(value || LOGO_FALLBACK);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setPreviewSrc(value || LOGO_FALLBACK); }, [value]);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // local preview ngay lập tức
        const localUrl = URL.createObjectURL(file);
        setPreviewSrc(localUrl);
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await api.post<{ url: string }>('/news/upload-image', formData);
            onChange(res.url);
            setPreviewSrc(res.url);
        } catch {
            showToast(i18n.t('features:roadmap.uploadImageFailed'), 'error');
            setPreviewSrc(value || LOGO_FALLBACK);
        } finally {
            setUploading(false);
            URL.revokeObjectURL(localUrl);
        }
    };

    const handleRemove = () => { onChange(''); setPreviewSrc(LOGO_FALLBACK); };

    return (
        <div className="space-y-3">
            {/* Preview box */}
            <div className="relative group rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/50 aspect-video max-h-44 flex items-center justify-center">
                <img
                    src={previewSrc}
                    alt="preview"
                    className={`w-full h-full object-contain p-4 transition-opacity ${uploading ? 'opacity-40' : 'opacity-100'}`}
                    onError={() => setPreviewSrc(LOGO_FALLBACK)}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer p-3 bg-white/90 rounded-full text-slate-800 hover:bg-white shadow-lg transition-transform hover:scale-105" title={i18n.t('roadmap:editor.selectImage')}>
                        <UploadCloud size={20} />
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    {value && (
                        <button type="button" onClick={handleRemove} className="p-3 bg-red-500/90 rounded-full text-white hover:bg-red-600 shadow-lg transition-transform hover:scale-105" title={i18n.t('roadmap:editor.removeImage')}>
                            <X size={20} />
                        </button>
                    )}
                </div>
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-blue-500" />
                    </div>
                )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <ImageIcon size={11} />
                {value ? i18n.t('roadmap:editor.imageHintChange') : i18n.t('roadmap:editor.imageHintSelect')}
            </p>
        </div>
    );
};

// ─── EXAM PICKER ──────────────────────────────────────────────────────────────
const ExamInfiniteSelect = ({
    selectedExamId, selectedExamTitle, onSelect
}: {
    selectedExamId?: number; selectedExamTitle?: string;
    onSelect: (exam: ExamSummary | null) => void;
}) => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const [dropRect, setDropRect] = useState<{ top: number; left: number; width: number } | null>(null);
    const [exams, setExams] = useState<ExamSummary[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const openDropdown = () => {
        if (btnRef.current) {
            // position:fixed → toạ độ viewport, không cộng scrollY
            const r = btnRef.current.getBoundingClientRect();
            setDropRect({ top: r.bottom + 4, left: r.left, width: r.width });
        }
        setIsOpen(true);
    };

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        if (!isOpen) return;
        const fetchExams = async () => {
            setLoading(true);
            try {
                const res = await examRepository.getExams({ page, limit: 10, search: searchTerm || undefined, status: 'PUBLISHED' });
                const newExams = res.data;
                setExams(prev => page === 0 ? newExams : [...prev, ...newExams]);
                setHasMore(newExams.length === 10);
            } catch (e) { console.error('Roadmap load failed:', e); } finally { setLoading(false); }
        };
        const t = setTimeout(fetchExams, 300);
        return () => clearTimeout(t);
    }, [page, isOpen, searchTerm]);

    const displayLabel = selectedExamId
        ? (exams.find(e => e.id === selectedExamId)?.title || selectedExamTitle || i18n.t('roadmap:editor.examDefault', { id: selectedExamId }))
        : i18n.t('roadmap:editorDetail.searchExam');

    // Render thẳng ra document.body — hoàn toàn tách khỏi DOM tree card
    // → Framer Motion không đo lại card height khi dropdown mount/unmount
    const dropdownPortal = isOpen && dropRect ? ReactDOM.createPortal(
        <>
            <div className="fixed inset-0 z-[499]" onClick={() => setIsOpen(false)} />
            <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.13 }}
                style={{ position: 'fixed', top: dropRect.top, left: dropRect.left, width: Math.max(dropRect.width, 300), zIndex: 500 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            >
                <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder={i18n.t('roadmap:editorDetail.searchExam')} autoFocus
                            className="w-full pl-7 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm border border-slate-100 dark:border-slate-700 outline-none focus:ring-1 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400"
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); setExams([]); }}
                        />
                    </div>
                </div>
                <div className="max-h-56 overflow-y-auto p-1">
                    {exams.map((exam, i) => (
                        <div key={exam.id} ref={i === exams.length - 1 ? lastElementRef : null}
                            onClick={() => { onSelect(exam); setIsOpen(false); }}
                            className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors flex justify-between items-center mb-0.5 ${selectedExamId === exam.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{exam.title}</p>
                                <p className="text-xs text-slate-400">{exam.subjectName} · {i18n.t('roadmap:editor.examInfo', { count: exam.questionCount, duration: exam.duration })}</p>
                            </div>
                            {selectedExamId === exam.id && <CheckCircle size={14} className="text-blue-600 shrink-0 ml-2" />}
                        </div>
                    ))}
                    {loading && <div className="p-2 text-center text-sm text-slate-400 flex justify-center gap-1"><Loader2 size={12} className="animate-spin" />{i18n.t('roadmap:editorDetail.loading')}</div>}
                    {!loading && exams.length === 0 && <div className="p-3 text-center text-sm text-slate-400">{i18n.t('roadmap:editorDetail.noExamFound')}</div>}
                </div>
            </motion.div>
        </>,
        document.body
    ) : null;

    return (
        <div className="flex-1 flex items-center gap-1">
            <button
                ref={btnRef}
                type="button"
                onClick={() => isOpen ? setIsOpen(false) : openDropdown()}
                className={`flex-1 px-2.5 py-1.5 text-left rounded-lg border flex justify-between items-center outline-none transition-colors text-sm ${isOpen ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    } bg-white dark:bg-slate-800`}
            >
                <span className={`truncate ${selectedExamId ? 'text-slate-800 dark:text-white font-medium' : 'text-slate-400'}`}>{displayLabel}</span>
                <ChevronDown size={13} className={`shrink-0 ml-1 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
            </button>
            {selectedExamId && (
                <button type="button" onClick={() => onSelect(null)} className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors">
                    <X size={13} />
                </button>
            )}
            {/* Portal ra document.body — không gây layout shift cho card */}
            {dropdownPortal}
        </div>
    );
};


// ─── RESOURCE PICKER ──────────────────────────────────────────────────────────
const ResourceInfiniteSelect = ({
    selectedResourceId, selectedResourceTitle, onSelect
}: {
    selectedResourceId?: number; selectedResourceTitle?: string;
    onSelect: (resource: ResourceItem | null) => void;
}) => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const [dropRect, setDropRect] = useState<{ top: number; left: number; width: number } | null>(null);
    const [resources, setResources] = useState<ResourceItem[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const openDropdown = () => {
        if (btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setDropRect({ top: r.bottom + 4, left: r.left, width: r.width });
        }
        setIsOpen(true);
    };

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        if (!isOpen) return;
        const fetchResources = async () => {
            setLoading(true);
            try {
                const res = await resourceRepository.getResources({ page, limit: 10, search: searchTerm || undefined });
                const items = res.data;
                setResources(prev => page === 0 ? items : [...prev, ...items]);
                setHasMore(items.length === 10);
            } catch (e) { console.error('Resource load failed:', e); } finally { setLoading(false); }
        };
        const t = setTimeout(fetchResources, 300);
        return () => clearTimeout(t);
    }, [page, isOpen, searchTerm]);

    const displayLabel = selectedResourceId
        ? (resources.find(r => r.id === selectedResourceId)?.title || selectedResourceTitle || i18n.t('roadmap:editor.docLabel') + ` #${selectedResourceId}`)
        : i18n.t('roadmap:editorDetail.searchResource');

    const dropdownPortal = isOpen && dropRect ? ReactDOM.createPortal(
        <>
            <div className="fixed inset-0 z-[499]" onClick={() => setIsOpen(false)} />
            <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.13 }}
                style={{ position: 'fixed', top: dropRect.top, left: dropRect.left, width: Math.max(dropRect.width, 300), zIndex: 500 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            >
                <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder={i18n.t('roadmap:editorDetail.searchResource')} autoFocus
                            className="w-full pl-7 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm border border-slate-100 dark:border-slate-700 outline-none focus:ring-1 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400"
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); setResources([]); }}
                        />
                    </div>
                </div>
                <div className="max-h-56 overflow-y-auto p-1">
                    {resources.map((resource, i) => (
                        <div key={resource.id} ref={i === resources.length - 1 ? lastElementRef : null}
                            onClick={() => { onSelect(resource); setIsOpen(false); }}
                            className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors flex justify-between items-center mb-0.5 ${selectedResourceId === resource.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{resource.title}</p>
                                <p className="text-xs text-slate-400">{resource.category} · {resource.fileType}</p>
                            </div>
                            {selectedResourceId === resource.id && <CheckCircle size={14} className="text-blue-600 shrink-0 ml-2" />}
                        </div>
                    ))}
                    {loading && <div className="p-2 text-center text-sm text-slate-400 flex justify-center gap-1"><Loader2 size={12} className="animate-spin" />{i18n.t('roadmap:editorDetail.loading')}</div>}
                    {!loading && resources.length === 0 && <div className="p-3 text-center text-sm text-slate-400">{i18n.t('roadmap:editorDetail.noResourceFound')}</div>}
                </div>
            </motion.div>
        </>,
        document.body
    ) : null;

    return (
        <div className="flex-1 flex items-center gap-1">
            <button
                ref={btnRef}
                type="button"
                onClick={() => isOpen ? setIsOpen(false) : openDropdown()}
                className={`flex-1 px-2.5 py-1.5 text-left rounded-lg border flex justify-between items-center outline-none transition-colors text-sm ${isOpen ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    } bg-white dark:bg-slate-800`}
            >
                <span className={`truncate ${selectedResourceId ? 'text-slate-800 dark:text-white font-medium' : 'text-slate-400'}`}>{displayLabel}</span>
                <ChevronDown size={13} className={`shrink-0 ml-1 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
            </button>
            {selectedResourceId && (
                <button type="button" onClick={() => onSelect(null)} className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors">
                    <X size={13} />
                </button>
            )}
            {dropdownPortal}
        </div>
    );
};


// ─── TEAM PICKER ──────────────────────────────────────────────────────────────
const TeamInfiniteSelect = ({ onSelect, selectedTeamId }: { onSelect: (id: number) => void; selectedTeamId?: number }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [initialTeamName, setInitialTeamName] = useState('');

    useEffect(() => {
        if (selectedTeamId && !initialTeamName) {
            teamRepository.getTeamBySlug(String(selectedTeamId))
                .then((team: Team) => setInitialTeamName(team.name))
                .catch(() => setInitialTeamName(`Team #${selectedTeamId}`));
        }
    }, [selectedTeamId, initialTeamName]);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        if (!isOpen) return;
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await teamRepository.getTeams({ page, size: 10 });
                const filtered = searchTerm ? res.data.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())) : res.data;
                setTeams(prev => page === 0 ? filtered : [...prev, ...filtered]);
                setHasMore(res.data.length === 10);
            } catch (e) { console.error('Roadmap load failed:', e); } finally { setLoading(false); }
        };
        const t = setTimeout(fetch, 300);
        return () => clearTimeout(t);
    }, [page, isOpen, searchTerm]);

    const displayLabel = selectedTeamId
        ? (teams.find(t => t.id === selectedTeamId)?.name || initialTeamName || i18n.t('roadmap:editorDetail.loading'))
        : i18n.t('roadmap:editor.selectTeam');

    return (
        <div className="relative" style={{ overflow: 'visible' }}>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {i18n.t('roadmap:editorDetail.teamLabel')} <span className="text-red-500">*</span>
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3.5 py-2.5 text-left rounded-xl border flex justify-between items-center outline-none transition-colors text-sm ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'} bg-white dark:bg-slate-800/80`}
            >
                <span className={`truncate text-sm ${selectedTeamId ? 'text-slate-800 dark:text-white font-medium' : 'text-slate-400'}`}>{displayLabel}</span>
                <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.13 }}
                        className="absolute z-[200] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                            <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder={i18n.t('roadmap:editorDetail.searchTeam')} autoFocus
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm border border-slate-100 dark:border-slate-700 outline-none focus:ring-1 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400"
                                    onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                                />
                            </div>
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1">
                            {teams.map((team, i) => (
                                <div key={team.id} ref={i === teams.length - 1 ? lastElementRef : null}
                                    onClick={() => { onSelect(team.id); setIsOpen(false); setInitialTeamName(team.name); }}
                                    className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors flex justify-between items-center mb-0.5 ${selectedTeamId === team.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    <span className="font-medium text-sm truncate">{team.name}</span>
                                    {selectedTeamId === team.id && <CheckCircle size={14} className="text-blue-600 shrink-0" />}
                                </div>
                            ))}
                            {loading && <div className="p-2 text-center text-xs text-slate-400 flex justify-center gap-1"><Loader2 size={11} className="animate-spin" />{i18n.t('roadmap:editorDetail.loading')}</div>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── FORM FIELD ───────────────────────────────────────────────────────────────
const Field = ({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export const RoadmapEditorPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialType = (searchParams.get('type') as 'PUBLIC' | 'TEAM_SPECIFIC') || 'PUBLIC';
    const isEditMode = Boolean(slug);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [collapsedStages, setCollapsedStages] = useState<Set<number>>(new Set());
    const [roadmapId, setRoadmapId] = useState<number | null>(null);

    const [formData, setFormData] = useState<UpdateRoadmapRequest>({
        name: '', description: '', type: initialType, teamId: undefined, iconUrl: '', stages: []
    });

    useEffect(() => {
        if (isEditMode && slug) {
            setLoading(true);
            roadmapRepository.getRoadmapBySlug(slug)
                .then((data: RoadmapDetail) => {
                    if (data) {
                        setFormData({
                            name: data.name, description: data.description, type: data.type,
                            teamId: data.teamId, iconUrl: data.iconUrl || '',
                            stages: data.stages.map(s => ({
                                id: s.id, title: s.title, description: s.description,
                                orderIndex: s.orderIndex, status: s.status, resources: s.resources || []
                            }))
                        });
                        setRoadmapId(data.id);
                    }
                })
                .catch(() => { showToast(i18n.t('features:roadmap.loadDataFailed'), 'error'); navigate('/roadmap/public'); })
                .finally(() => setLoading(false));
        }
    }, [slug, isEditMode, navigate]);

    const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

    const addStage = () => {
        setFormData(prev => ({
            ...prev,
            stages: [...prev.stages, { title: '', description: '', status: 'LOCKED', orderIndex: prev.stages.length, resources: [] }]
        }));
    };

    const removeStage = (idx: number) =>
        setFormData(prev => ({ ...prev, stages: prev.stages.filter((_, i) => i !== idx) }));

    const updateStage = (idx: number, field: keyof RoadmapStage, value: any) =>
        setFormData(prev => ({ ...prev, stages: prev.stages.map((s, i) => i === idx ? { ...s, [field]: value } : s) }));

    const addResource = (sIdx: number) =>
        setFormData(prev => ({
            ...prev,
            stages: prev.stages.map((s, i) => i === sIdx
                ? { ...s, resources: [...(s.resources || []), { type: 'DOC', title: '', url: '', orderIndex: s.resources?.length || 0 }] }
                : s)
        }));

    const removeResource = (sIdx: number, rIdx: number) =>
        setFormData(prev => ({
            ...prev,
            stages: prev.stages.map((s, i) => i === sIdx
                ? { ...s, resources: s.resources?.filter((_, ri) => ri !== rIdx) }
                : s)
        }));

    const updateResource = (sIdx: number, rIdx: number, field: keyof StageResource, value: any) =>
        setFormData(prev => ({
            ...prev,
            stages: prev.stages.map((s, i) => i === sIdx
                ? { ...s, resources: s.resources?.map((r, ri) => ri === rIdx ? { ...r, [field]: value } : r) }
                : s)
        }));

    const toggleCollapse = (idx: number) =>
        setCollapsedStages(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });

    const handleSubmit = async () => {
        if (!formData.name.trim()) return showToast(i18n.t('features:roadmap.nameRequired'), 'error');
        if (formData.type === 'TEAM_SPECIFIC' && !formData.teamId) return showToast(i18n.t('features:roadmap.teamRequired'), 'error');
        const emptyIdx = formData.stages.findIndex(s => !s.title.trim());
        if (emptyIdx !== -1) return showToast(i18n.t('features:roadmap.chapterTitleRequired', { index: emptyIdx + 1 }), 'error');

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                stages: formData.stages.map((stage, idx) => ({
                    ...stage, orderIndex: idx,
                    resources: stage.resources?.map((res, rIdx) => ({ ...res, orderIndex: rIdx })) || []
                }))
            };
            if (isEditMode && roadmapId) await roadmapRepository.updateRoadmap(roadmapId, payload);
            else await roadmapRepository.createRoadmap(payload);
            showToast(isEditMode ? i18n.t('features:roadmap.updateSuccess') : i18n.t('features:roadmap.createSuccess'), 'success');
            navigate(formData.type === 'TEAM_SPECIFIC' ? '/roadmap/teams' : '/roadmap/public');
        } catch (error: unknown) {
            showToast(extractErrorMessage(error, i18n.t('features:roadmap.saveFailed')), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <RoadmapEditorSkeleton />;

    const previewSrc = formData.iconUrl.trim() || LOGO_FALLBACK;

    // ─── RENDER ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen pt-[72px] pb-24 font-sans">

            {/* ─────────────── TOOLBAR ─────────────── */}
            <div className="sticky top-[72px] z-30 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/40">
                <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
                    {/* Left: back + title */}
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => navigate('/roadmap/public')}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors shrink-0"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="w-px h-4 bg-slate-200/60 dark:bg-slate-700/40 shrink-0" />
                        {/* Icon preview mini */}
                        <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 shrink-0">
                            <img src={previewSrc} alt="" className="w-full h-full object-contain p-0.5"
                                onError={e => { (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK; }} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                                {formData.name || (isEditMode ? i18n.t('roadmap:editor.editTitle') : i18n.t('roadmap:editor.createTitle'))}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                                {isEditMode ? i18n.t('roadmap:editorDetail.updateContent') : i18n.t('roadmap:editorDetail.designCurriculum')}
                            </p>
                        </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-400 hidden sm:block">
                            {i18n.t('roadmap:editorDetail.chapterCount', { count: formData.stages.length })}
                        </span>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/25 transition-colors hover:-translate-y-px active:scale-95 disabled:opacity-60"
                        >
                            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                            {submitting ? i18n.t('roadmap:editor.saving') : i18n.t('roadmap:editor.save')}
                        </button>
                    </div>
                </div>
            </div>

            {/* ─────────────── BODY ─────────────── */}
            <div className="max-w-5xl mx-auto px-4 md:px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* ────── LEFT: SETTINGS PANEL ────── */}
                <div className="lg:col-span-4 lg:sticky lg:top-[130px] space-y-4">

                    {/* Panel */}
                    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/40 shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-200/50 dark:border-slate-700/40 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                                <Compass size={13} />
                            </div>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white">{i18n.t('roadmap:editorDetail.roadmapInfo')}</h2>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Icon preview */}
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-slate-900/50 rounded-xl border border-blue-100/80 dark:border-blue-900/30">
                                <div className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-md shrink-0">
                                    <img src={previewSrc} alt="" className="w-full h-full object-contain p-1"
                                        onError={e => { (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK; }} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                        {formData.name || i18n.t('roadmap:editor.nameLabel')}
                                    </p>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                        {formData.type === 'PUBLIC' ? i18n.t('roadmap:editorDetail.typePublic') : i18n.t('roadmap:editorDetail.typeTeam')}
                                        {formData.description ? ` · ${formData.description.slice(0, 30)}...` : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Name */}
                            <Field label={i18n.t('roadmap:editor.nameLabel')} required>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={e => set('name', e.target.value)}
                                    placeholder={i18n.t('roadmap:editor.namePlaceholder')}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white text-sm placeholder:text-slate-400 transition-colors"
                                />
                            </Field>

                            {/* Type */}
                            <Field label={i18n.t('roadmap:editor.typeLabel')}>
                                <div className="flex gap-2">
                                    {[
                                        { val: 'PUBLIC', icon: Globe, label: i18n.t('roadmap:editorDetail.typePublic'), sub: i18n.t('roadmap:editorDetail.typePublicSub') },
                                        { val: 'TEAM_SPECIFIC', icon: Users, label: i18n.t('roadmap:editorDetail.typeTeam'), sub: i18n.t('roadmap:editorDetail.typeTeamSub') }
                                    ].map(opt => {
                                        const Icon = opt.icon;
                                        const active = formData.type === opt.val;
                                        return (
                                            <button
                                                key={opt.val}
                                                type="button"
                                                onClick={() => set('type', opt.val)}
                                                className={`flex-1 py-2.5 px-3 rounded-xl border transition-colors flex flex-col items-center gap-1 ${active
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:text-slate-700'
                                                    }`}
                                            >
                                                <Icon size={17} />
                                                <span className="text-xs font-bold leading-tight">{opt.label}</span>
                                                <span className={`text-[10px] leading-tight ${active ? 'text-blue-100' : 'text-slate-400'}`}>{opt.sub}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            {/* Team picker -- overflow:visible so dropdown isn't clipped by AnimatePresence wrapper */}
                            <AnimatePresence>
                                {formData.type === 'TEAM_SPECIFIC' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ overflow: 'visible' }}
                                    >
                                        <TeamInfiniteSelect
                                            onSelect={teamId => set('teamId', teamId)}
                                            selectedTeamId={formData.teamId}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Description */}
                            <Field label={i18n.t('roadmap:editorDetail.shortDesc')}>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={e => set('description', e.target.value)}
                                    rows={3}
                                    placeholder={i18n.t('roadmap:editorDetail.descPlaceholderLong')}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none dark:text-white text-sm placeholder:text-slate-400 leading-relaxed transition-colors"
                                />
                            </Field>

                            {/* Icon */}
                            <Field label={i18n.t('roadmap:editorDetail.iconLabel')}>
                                <ImageUploadInput
                                    value={formData.iconUrl}
                                    onChange={url => set('iconUrl', url)}
                                />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* ────── RIGHT: STAGES PANEL ────── */}
                <div className="lg:col-span-8 space-y-3">

                    {/* Header row */}
                    <div className="flex items-center justify-between bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/40 px-5 py-3.5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                                <BookOpen size={13} />
                            </div>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                                {i18n.t('roadmap:editorDetail.chapterContent')}
                            </h2>
                            {formData.stages.length > 0 && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                                    {formData.stages.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={addStage}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-colors hover:-translate-y-px active:scale-95"
                        >
                            <Plus size={15} /> {i18n.t('roadmap:editorDetail.addChapter')}
                        </button>
                    </div>

                    {/* Empty state */}
                    {formData.stages.length === 0 && (
                        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200/60 dark:border-slate-700/40 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                                <Layers size={26} />
                            </div>
                            <p className="font-bold text-slate-600 dark:text-slate-400 mb-1">{i18n.t('roadmap:editorDetail.noChapters')}</p>
                            <p className="text-sm text-slate-400 mb-5">{i18n.t('roadmap:editorDetail.noChaptersHint')}</p>
                            <button
                                onClick={addStage}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-colors"
                            >
                                <Plus size={16} /> {i18n.t('roadmap:editorDetail.addFirstChapter')}
                            </button>
                        </div>
                    )}

                    {/* Stage list */}
                    <AnimatePresence mode="popLayout">
                        {formData.stages.map((stage, cIdx) => {
                            const isLocked = stage.status === 'LOCKED';
                            const isCollapsed = collapsedStages.has(cIdx);

                            return (
                                <motion.div
                                    key={cIdx}
                                    layout
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.97, y: -8 }}
                                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                    className={`bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border transition-colors duration-200 shadow-sm overflow-hidden ${isLocked
                                        ? 'border-slate-200/50 dark:border-slate-700/40'
                                        : 'border-blue-200/60 dark:border-blue-800/40 shadow-blue-500/5'
                                        }`}
                                >
                                    {/* ── Card header ── */}
                                    <div className={`flex items-center gap-3 px-4 py-3 border-b ${isLocked
                                        ? 'bg-slate-50/40 dark:bg-slate-800/20 border-slate-200/50 dark:border-slate-700/40'
                                        : 'bg-blue-50/30 dark:bg-blue-950/15 border-blue-200/50 dark:border-blue-800/30'
                                        }`}>
                                        {/* Number badge */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors ${isLocked
                                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                            : 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                                            }`}>
                                            {isLocked ? <Lock size={13} /> : cIdx + 1}
                                        </div>

                                        {/* Title preview (when collapsed) */}
                                        <div className="flex-1 min-w-0">
                                            {isCollapsed ? (
                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                    {stage.title || <span className="text-slate-400 font-normal italic">{i18n.t('roadmap:editorDetail.noTitle')}</span>}
                                                </p>
                                            ) : (
                                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                    {i18n.t('roadmap:editorDetail.chapterNum', { num: cIdx + 1 })}
                                                </p>
                                            )}
                                        </div>

                                        {/* Lock toggle */}
                                        <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 shrink-0">
                                            <button
                                                onClick={() => updateStage(cIdx, 'status', 'LOCKED')}
                                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-colors ${stage.status === 'LOCKED'
                                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-inner'
                                                    : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <Lock size={11} /> {i18n.t('roadmap:editorDetail.locked')}
                                            </button>
                                            <button
                                                onClick={() => updateStage(cIdx, 'status', 'UNLOCKED')}
                                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-colors ${stage.status === 'UNLOCKED'
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 shadow-inner'
                                                    : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <Unlock size={11} /> {i18n.t('roadmap:editorDetail.unlocked')}
                                            </button>
                                        </div>

                                        {/* Collapse toggle */}
                                        <button
                                            onClick={() => toggleCollapse(cIdx)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                            title={isCollapsed ? i18n.t('roadmap:editorDetail.expand') : i18n.t('roadmap:editorDetail.collapse')}
                                        >
                                            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => removeStage(cIdx)}
                                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title={i18n.t('roadmap:editorDetail.deleteChapter')}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {/* ── Card body ── */}
                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.18 }}
                                            >
                                                <div className="p-4 space-y-4">
                                                    {/* Title input */}
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={stage.title}
                                                            onChange={e => updateStage(cIdx, 'title', e.target.value)}
                                                            placeholder={i18n.t('roadmap:editorDetail.chapterTitlePlaceholder', { num: cIdx + 1 })}
                                                            className={`w-full text-base font-bold bg-transparent border-b-2 outline-none pb-1 transition-colors placeholder:font-normal dark:text-white ${!stage.title.trim()
                                                                ? 'border-red-300 dark:border-red-800 placeholder:text-red-300'
                                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-blue-400 placeholder:text-slate-300'
                                                                }`}
                                                        />
                                                        <textarea
                                                            value={stage.description || ''}
                                                            onChange={e => updateStage(cIdx, 'description', e.target.value)}
                                                            placeholder={i18n.t('roadmap:editorDetail.descPlaceholder')}
                                                            rows={2}
                                                            className="w-full resize-none text-sm text-slate-500 dark:text-slate-400 bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-400 outline-none pb-0.5 transition-colors placeholder:text-slate-300 leading-relaxed"
                                                        />
                                                    </div>

                                                    {/* ── Resources ── */}
                                                    <div className="rounded-xl border border-slate-100 dark:border-slate-800">
                                                        {/* Resources header */}
                                                        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                                            <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                <BookMarked size={11} />
                                                                {i18n.t('roadmap:editorDetail.learningResources')}
                                                                {(stage.resources?.length || 0) > 0 && (
                                                                    <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full text-[10px] font-bold">
                                                                        {stage.resources?.length}
                                                                    </span>
                                                                )}
                                                            </h5>
                                                            <button
                                                                onClick={() => addResource(cIdx)}
                                                                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded-lg transition-colors"
                                                            >
                                                                <Plus size={11} /> {i18n.t('roadmap:editorDetail.add')}
                                                            </button>
                                                        </div>

                                                        <div className="p-2 space-y-1.5">
                                                            {(!stage.resources || stage.resources.length === 0) && (
                                                                <p className="text-center py-5 text-xs text-slate-400 italic">
                                                                    {i18n.t('roadmap:editorDetail.noResources')}
                                                                </p>
                                                            )}

                                                            <AnimatePresence>
                                                                {stage.resources?.map((res, rIdx) => {
                                                                    return (
                                                                        <motion.div
                                                                            key={rIdx}
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            exit={{ opacity: 0, height: 0 }}
                                                                            transition={{ duration: 0.13 }}
                                                                            className="flex gap-2 items-start bg-white dark:bg-slate-800/80 px-3 py-3 rounded-xl border border-slate-100 dark:border-slate-700/60 group/res"
                                                                        >
                                                                            {/* Type selector — pill buttons */}
                                                                            <div className="shrink-0">
                                                                                <div className="grid grid-cols-2 gap-1">
                                                                                    {Object.entries(RESOURCE_TYPE_META).map(([val, m]) => {
                                                                                        const Ico = m.icon;
                                                                                        const active = res.type === val;
                                                                                        return (
                                                                                            <button
                                                                                                key={val}
                                                                                                type="button"
                                                                                                title={m.label}
                                                                                                onClick={() => updateResource(cIdx, rIdx, 'type', val)}
                                                                                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors ${active
                                                                                                    ? `${m.bg} ${m.color} shadow-sm`
                                                                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                                                                    }`}
                                                                                            >
                                                                                                <Ico size={12} />
                                                                                                <span>{m.label}</span>
                                                                                            </button>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>

                                                                            {/* Title + URL / Exam */}
                                                                            <div className="flex-1 grid grid-cols-1 gap-2 min-w-0 mt-1">
                                                                                <input
                                                                                    type="text"
                                                                                    value={res.title}
                                                                                    onChange={e => updateResource(cIdx, rIdx, 'title', e.target.value)}
                                                                                    placeholder={i18n.t('roadmap:editorDetail.resourceTitle')}
                                                                                    className="bg-transparent text-sm font-medium border-b border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-blue-400 outline-none transition-colors w-full dark:text-white placeholder:text-slate-300 placeholder:font-normal"
                                                                                />
                                                                                {res.type === 'EXAM' ? (
                                                                                    <ExamInfiniteSelect
                                                                                        selectedExamId={res.examId}
                                                                                        selectedExamTitle={res.examTitle}
                                                                                        onSelect={exam => {
                                                                                            const stages = formData.stages.map((s, si) =>
                                                                                                si !== cIdx ? s : {
                                                                                                    ...s,
                                                                                                    resources: s.resources?.map((r, ri) =>
                                                                                                        ri !== rIdx ? r : {
                                                                                                            ...r,
                                                                                                            examId: exam?.id,
                                                                                                            examTitle: exam?.title,
                                                                                                            title: r.title || exam?.title || '',
                                                                                                            url: '',
                                                                                                        }
                                                                                                    )
                                                                                                }
                                                                                            );
                                                                                            setFormData(prev => ({ ...prev, stages }));
                                                                                        }}
                                                                                    />
                                                                                ) : res.type === 'DOC' ? (
                                                                                    <ResourceInfiniteSelect
                                                                                        selectedResourceId={res.resourceId}
                                                                                        selectedResourceTitle={res.resourceTitle}
                                                                                        onSelect={resource => {
                                                                                            const stages = formData.stages.map((s, si) =>
                                                                                                si !== cIdx ? s : {
                                                                                                    ...s,
                                                                                                    resources: s.resources?.map((r, ri) =>
                                                                                                        ri !== rIdx ? r : {
                                                                                                            ...r,
                                                                                                            resourceId: resource?.id,
                                                                                                            resourceTitle: resource?.title,
                                                                                                            title: r.title || resource?.title || '',
                                                                                                            url: resource?.url || '',
                                                                                                        }
                                                                                                    )
                                                                                                }
                                                                                            );
                                                                                            setFormData(prev => ({ ...prev, stages }));
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <input
                                                                                        type="text"
                                                                                        value={res.url}
                                                                                        onChange={e => updateResource(cIdx, rIdx, 'url', e.target.value)}
                                                                                        placeholder="https://..."
                                                                                        className="bg-transparent text-sm text-slate-500 border-b border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-blue-400 outline-none transition-colors w-full font-mono placeholder:font-sans placeholder:text-slate-300"
                                                                                    />
                                                                                )}
                                                                            </div>

                                                                            {/* Delete resource */}
                                                                            <button
                                                                                onClick={() => removeResource(cIdx, rIdx)}
                                                                                className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover/res:opacity-100 transition-colors"
                                                                                title={i18n.t('roadmap:editorDetail.delete')}
                                                                            >
                                                                                <Trash2 size={13} />
                                                                            </button>
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Add chapter CTA */}
                    {formData.stages.length > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                            onClick={addStage}
                            className="w-full py-4 border-2 border-dashed border-slate-200/60 dark:border-slate-700/40 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group text-sm font-semibold"
                        >
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 flex items-center justify-center transition-colors">
                                <Plus size={15} />
                            </div>
                            {i18n.t('roadmap:editorDetail.addNewChapter')}
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoadmapEditorPage;
