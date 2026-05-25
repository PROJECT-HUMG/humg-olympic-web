import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RoadmapSummary, RoadmapStage, RoadmapDetail, StageStatus } from '@/features/roadmap/types/roadmap.types';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { roadmapRepository } from '@/features/roadmap/api';
import { ChapterDetailPage, ChapterDetailSkeleton } from '@/features/roadmap/components/ChapterDetailPage';
import { RoadmapMarkdown } from '@/features/roadmap/components/RoadmapMarkdown';
import {
    BookOpen,
    ChevronRight, Plus, Edit, Unlock, LockKeyhole, Loader2, AlertTriangle, Trash2,
    Users, Layers, Lock, ChevronDown, Map
} from 'lucide-react';

// --- CONFIG ---
const LOGO_FALLBACK = '/assets/logo.png';

// Helper: render roadmap icon — <img> nếu có URL, ngược lại dùng logo HUMG
const RoadmapIcon = ({ iconUrl, size = 18, className = '' }: { iconUrl: string; size?: number; className?: string }) => (
    <img
        src={iconUrl || LOGO_FALLBACK}
        alt=""
        width={size}
        height={size}
        className={`object-contain ${className}`}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK; }}
    />
);

const PAGE_SIZE = 50;

// ─── SKELETONS ───────────────────────────────────────────────────────

const SubjectListSkeleton = () => (
    <div className="flex flex-col gap-2 bg-blue-50/60 dark:bg-slate-800/70 p-4 rounded-2xl border border-blue-100/80 dark:border-slate-700/60">
        {/* Header */}
        <div className="flex items-center gap-3 px-1 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-slate-700 animate-pulse" />
            <div className="h-4 w-28 bg-blue-100 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
        {/* Items */}
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse h-[56px] rounded-xl bg-white/70 dark:bg-slate-700/50 border border-blue-100/60 dark:border-slate-700/40" />
        ))}
    </div>
);

const TimelineSkeleton = () => (
    <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 lg:p-6 rounded-2xl border border-slate-200/70 dark:border-slate-700/50">
        {/* Roadmap title area */}
        <div className="mb-6">
            <div className="h-6 w-48 max-w-[60%] bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-72 max-w-[80%] bg-slate-100 dark:bg-slate-700/60 rounded-md animate-pulse" />
        </div>
        {/* Timeline nodes */}
        <div className="space-y-6">
            {[1, 2, 3, 4].map((i, idx, arr) => (
                <div key={i} className="relative pl-10 sm:pl-12 group animate-pulse">
                    {/* Vertical line equivalent */}
                    {idx < arr.length - 1 && (
                        <div className="absolute left-[13px] sm:left-[15px] top-10 bottom-[-24px] w-0.5 bg-slate-200 dark:bg-slate-700" />
                    )}

                    {/* Circle Node */}
                    <div className="absolute left-0 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-700 z-10" />

                    {/* Card container */}
                    <div className="relative p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-700/40 bg-white/60 dark:bg-slate-800/60 space-y-3">
                        <div className="h-4 w-16 bg-blue-100 dark:bg-slate-700 rounded-md" />
                        <div className="h-5 w-48 max-w-[70%] bg-slate-200 dark:bg-slate-600 rounded-md" />
                        <div className="h-3 w-72 max-w-[90%] bg-slate-100 dark:bg-slate-700/50 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// ─── DELETE MODAL ────────────────────────────────────────────────────

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, roadmapName, isDeleting }: {
    isOpen: boolean, onClose: () => void, onConfirm: () => void, roadmapName: string, isDeleting: boolean
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 overflow-hidden p-6 md:p-8 text-center animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5 text-red-500">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{i18n.t('roadmap:delete.confirmTitle')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{ __html: i18n.t('roadmap:delete.confirmMessage', { name: roadmapName }) }}
                />
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={isDeleting} className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">{i18n.t('roadmap:delete.cancel')}</button>
                    <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95">
                        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : i18n.t('roadmap:delete.deleteNow')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── SUBJECT SIDEBAR ITEM ────────────────────────────────────────────

const SubjectItem = ({ item, isActive, onClick }: {
    item: RoadmapSummary, isActive: boolean, onClick: () => void
}) => {
    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors duration-300
                ${isActive
                    ? 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 shadow-sm border-l-4 border-l-blue-600 dark:border-l-blue-500'
                    : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }
            `}
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden p-1 transition-colors ${isActive ? 'bg-white block shadow-sm dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                <RoadmapIcon iconUrl={item.iconUrl} size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{item.name}</p>
                {item.teamName && (
                    <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-blue-600/70 dark:text-blue-400/70' : 'text-slate-400'}`}>
                        {item.teamName}
                    </p>
                )}
            </div>
            <ChevronRight size={14} className={`shrink-0 transition-colors ${isActive ? 'text-blue-500 translate-x-1' : 'text-slate-300 dark:text-slate-600'}`} />
        </button>
    );
};

// ─── MOBILE SUBJECT CHIPS ────────────────────────────────────────────

const SubjectChips = ({ items, activeId, onSelect }: {
    items: RoadmapSummary[], activeId: number | null, onSelect: (id: number) => void
}) => (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:hidden">
        {items.map(item => {
            const isActive = activeId === item.id;
            return (
                <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap shrink-0 transition-colors duration-300
                        ${isActive
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600 dark:ring-blue-500 shadow-md shadow-blue-500/10'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }
                    `}
                >
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 overflow-hidden ${isActive ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-700'
                        }`}>
                        <RoadmapIcon iconUrl={item.iconUrl} size={18} />
                    </span>
                    {item.name}
                </button>
            );
        })}
    </div>
);

// ─── TIMELINE MILESTONE ──────────────────────────────────────────────

const TimelineMilestone = ({ stage, index, isManager, isLast, onToggleLock, lockLoading, onClick }: {
    stage: RoadmapStage, index: number, isManager: boolean, isLast: boolean,
    onToggleLock: () => void, lockLoading: boolean, onClick: () => void
}) => {
    const isLocked = stage.status === 'LOCKED';

    return (
        <div
            className="relative pl-10 sm:pl-12 group animate-in fade-in slide-in-from-left-4 duration-350 fill-mode-both"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Vertical line */}
            {!isLast && (
                <div className={`absolute left-[13px] sm:left-[15px] top-10 bottom-0 w-0.5 transition-colors duration-300 ${isLocked ? 'bg-slate-200 dark:bg-slate-800 border-dashed' : 'bg-blue-200 dark:bg-blue-900/50'}`} />
            )}

            {/* Node */}
            <div className={`
                absolute left-0 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center z-10
                transition-colors duration-500
                ${isLocked
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 ring-2 ring-slate-200 dark:ring-slate-800'
                    : 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100 dark:ring-blue-900/40'
                }
            `}>
                {isLocked
                    ? <Lock size={12} />
                    : <span className="text-[11px] font-black">{index + 1}</span>
                }
            </div>

            {/* Card */}
            <div
                onClick={() => {
                    if (isManager || !isLocked) onClick();
                    else showToast(i18n.t('features:roadmap.chapterLocked'), 'info');
                }}
                className={`
                    relative p-4 sm:p-5 rounded-2xl border transition-colors duration-300 cursor-pointer mb-6 group-hover:-translate-y-1
                    ${isLocked
                        ? 'bg-slate-50/80 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-70 grayscale-[30%]'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700/60 hover:shadow-xl hover:shadow-blue-500/10'
                    }
                `}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors ${isLocked
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                : 'bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30'
                                }`}>
                                {i18n.t('roadmap:timeline.chapter', { num: index + 1 })}
                            </span>
                            {isLocked && (
                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                    <Lock size={11} /> {i18n.t('roadmap:timeline.locked')}
                                </span>
                            )}
                        </div>
                        <h4 className={`text-base md:text-lg font-bold mb-1.5 transition-colors ${isLocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400'}`}>
                            {stage.title}
                        </h4>
                        {stage.description && (
                            <RoadmapMarkdown content={stage.description} compact />
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1">
                        {stage.resources?.length > 0 && (
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                {i18n.t('roadmap:timeline.resourceCount', { count: stage.resources.length })}
                            </span>
                        )}
                        {isManager ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
                                disabled={lockLoading}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${lockLoading ? 'bg-slate-100 dark:bg-slate-800' : isLocked ? 'text-slate-400 hover:text-blue-600 bg-slate-100 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'}`}
                                title={isLocked ? i18n.t('roadmap:timeline.unlock') : i18n.t('roadmap:timeline.lock')}
                            >
                                {lockLoading ? <Loader2 size={14} className="animate-spin text-blue-500" /> : (isLocked ? <LockKeyhole size={14} /> : <Unlock size={14} />)}
                            </button>
                        ) : !isLocked && (
                            <ChevronRight size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-colors duration-300" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── TIMELINE VIEW ───────────────────────────────────────────────────

const TimelineView = ({ roadmapSlug, roadmap, isManager, onChapterClick }: {
    roadmapSlug: string, roadmap: RoadmapSummary, isManager: boolean, onChapterClick: (stage: RoadmapStage) => void
}) => {
    const [detail, setDetail] = useState<RoadmapDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

    useEffect(() => {
        setLoading(true);
        setDetail(null);
        roadmapRepository.getRoadmapBySlug(roadmapSlug)
            .then(setDetail)
            .catch(() => showToast(i18n.t('features:roadmap.loadContentFailed'), 'error'))
            .finally(() => setLoading(false));
    }, [roadmapSlug]);

    const handleToggleLock = async (stage: RoadmapStage) => {
        if (!detail) return;
        const stageId = stage.id!;
        const newStatus: StageStatus = stage.status === 'LOCKED' ? 'UNLOCKED' : 'LOCKED';
        setActionLoading(prev => ({ ...prev, [stageId]: true }));
        try {
            const updatedStages = (detail.stages || []).map(s => s.id === stageId ? { ...s, status: newStatus } : s);
            await roadmapRepository.updateRoadmap(detail.id, { ...detail, stages: updatedStages });
            setDetail(prev => prev ? ({ ...prev, stages: updatedStages }) : null);
        } catch {
            showToast(i18n.t('features:roadmap.statusUpdateFailed'), 'error');
        } finally {
            setActionLoading(prev => ({ ...prev, [stageId]: false }));
        }
    };

    if (loading) return <TimelineSkeleton />;

    if (!detail?.stages?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Layers size={28} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{i18n.t('roadmap:timeline.noChapters')}</p>
            </div>
        );
    }

    const unlockedCount = detail.stages.filter(s => s.status === 'UNLOCKED').length;

    return (
        <div>
            {/* Progress summary */}
            <div className="mb-6 flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {i18n.t('roadmap:timeline.completed')}
                </span>
                <div className="flex-1 h-2 bg-slate-200/70 dark:bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-humg-blue rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${detail.stages.length > 0 ? (unlockedCount / detail.stages.length) * 100 : 0}%` }}
                    />
                </div>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {unlockedCount}/{detail.stages.length}
                </span>
            </div>

            {/* Timeline */}
            <div className="relative">
                {detail.stages.map((stage, idx) => (
                    <TimelineMilestone
                        key={stage.id}
                        stage={stage}
                        index={idx}
                        isManager={isManager}
                        isLast={idx === detail.stages.length - 1}
                        onToggleLock={() => handleToggleLock(stage)}
                        lockLoading={!!actionLoading[stage.id!]}
                        onClick={() => onChapterClick(stage)}
                    />
                ))}
            </div>
        </div>
    );
};

// ─── TAB SWITCHER (CSS-based) ────────────────────────────────────────

const TAB_MODES = ['PUBLIC', 'TEAM_SPECIFIC'] as const;
const TAB_LABELS: Record<string, { icon: typeof BookOpen; label: string }> = {
    PUBLIC: { icon: BookOpen, label: i18n.t('roadmap:tabs.public') },
    TEAM_SPECIFIC: { icon: Users, label: i18n.t('roadmap:tabs.team') },
};

const RoadmapTabSwitcher = ({ viewMode, userRole, onSwitch }: {
    viewMode: 'PUBLIC' | 'TEAM_SPECIFIC';
    userRole?: string;
    onSwitch: (mode: 'PUBLIC' | 'TEAM_SPECIFIC') => void;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const btn = btnRefs.current[viewMode];
        const container = containerRef.current;
        if (btn && container) {
            const cRect = container.getBoundingClientRect();
            const bRect = btn.getBoundingClientRect();
            setIndicator({ left: bRect.left - cRect.left, width: bRect.width });
        }
    }, [viewMode]);

    return (
        <div ref={containerRef} className="relative flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <span
                className="absolute top-1 bottom-1 bg-blue-600 rounded-lg shadow-md shadow-blue-500/20 transition-all duration-300 ease-out"
                style={{ left: indicator.left, width: indicator.width }}
            />
            {TAB_MODES.map(mode => {
                if (userRole === 'STUDENT_EXTERNAL' && mode === 'TEAM_SPECIFIC') return null;
                const isActive = viewMode === mode;
                const cfg = TAB_LABELS[mode];
                const Icon = cfg.icon;
                return (
                    <button
                        key={mode}
                        ref={el => { btnRefs.current[mode] = el; }}
                        onClick={() => onSwitch(mode)}
                        className={`relative z-10 px-3 py-1.5 text-sm font-bold rounded-lg transition-colors ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        <span className="relative z-10 flex items-center gap-1.5 justify-center">
                            <Icon size={13} />
                            {cfg.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

// ─── MAIN PAGE ───────────────────────────────────────────────────────

export const RoadmapPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { slug: roadmapSlugParam, chapterId: chapterIdParam } = useParams<{ slug: string; chapterId: string }>();
    const isManager = user?.role === 'ADMIN' || user?.role === 'LECTURER';

    // Derive viewMode from URL path
    const initialMode = window.location.pathname.includes('/roadmap/teams') ? 'TEAM_SPECIFIC' : 'PUBLIC';
    const [viewMode, setViewMode] = useState<'PUBLIC' | 'TEAM_SPECIFIC'>(initialMode);
    const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean, target: RoadmapSummary | null, deleting: boolean }>({ open: false, target: null, deleting: false });
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);

    // Detail view state (for URL-based navigation)
    const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapDetail | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<RoadmapStage | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const isDetailView = Boolean(roadmapSlugParam && chapterIdParam);

    // Fetch roadmaps list
    const fetchRoadmaps = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any = { page: 0, limit: PAGE_SIZE, type: viewMode };
            const res = await roadmapRepository.getRoadmaps(filters);
            setRoadmaps(res.data);
        } catch {
            showToast(i18n.t('features:roadmap.loadListFailed'), 'error');
        } finally {
            setLoading(false);
        }
    }, [viewMode]);

    useEffect(() => {
        setRoadmaps([]);
        setActiveId(null);
        fetchRoadmaps();
    }, [fetchRoadmaps]);

    // Auto-select roadmap by slug param (or do nothing if no slug)
    useEffect(() => {
        if (loading || roadmaps.length === 0) return;
        if (roadmapSlugParam && !chapterIdParam) {
            const match = roadmaps.find(r => r.slug === roadmapSlugParam);
            if (match) setActiveId(match.id);
        }
    }, [loading, roadmaps, roadmapSlugParam, chapterIdParam]);

    // Close mobile dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)) {
                setMobileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Detail view hydration
    useEffect(() => {
        if (isDetailView) {
            setLoadingDetail(true);
            roadmapRepository.getRoadmapBySlug(roadmapSlugParam!).then(data => {
                setSelectedRoadmap(data);
                const ch = data.stages.find(s => s.id?.toString() === chapterIdParam);
                if (ch) setSelectedChapter(ch);
            }).finally(() => setLoadingDetail(false));
        } else {
            setSelectedRoadmap(null);
            setSelectedChapter(null);
        }
    }, [isDetailView, roadmapSlugParam, chapterIdParam]);

    const handleDelete = async () => {
        if (!deleteModal.target) return;
        setDeleteModal(prev => ({ ...prev, deleting: true }));
        try {
            await roadmapRepository.deleteRoadmap(deleteModal.target.id);
            setRoadmaps(prev => prev.filter(r => r.id !== deleteModal.target?.id));
            if (activeId === deleteModal.target.id) setActiveId(null);
            setDeleteModal({ open: false, target: null, deleting: false });
            showToast(i18n.t('features:roadmap.deleteSuccess'), 'success');
        } catch {
            showToast(i18n.t('features:roadmap.deleteFailed'), 'error');
            setDeleteModal(prev => ({ ...prev, deleting: false }));
        }
    };

    // Chapter detail view
    // Build route prefix based on current viewMode
    const routePrefix = viewMode === 'TEAM_SPECIFIC' ? '/roadmap/teams' : '/roadmap/public';

    if (isDetailView) {
        if (loadingDetail) return <ChapterDetailSkeleton />;
        if (selectedChapter && selectedRoadmap) return (
            <ChapterDetailPage
                chapter={selectedChapter}
                subjectName={selectedRoadmap.name}
                parentType={selectedRoadmap.type === 'TEAM_SPECIFIC' ? 'team' : 'subject'}
                parentId={selectedRoadmap.id}
                onBack={() => navigate(routePrefix)}
            />
        );
        return null;
    }

    const activeRoadmap = roadmaps.find(r => r.id === activeId) || null;

    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">
            {/* ─── MAIN CONTENT ─── */}
            <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-6xl">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                    {/* Page header */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl text-blue-600 dark:text-blue-500 shadow-sm border border-slate-200/60 dark:border-slate-700 shrink-0">
                                <Map size={22} />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                    {i18n.t('roadmap:page.title')}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                                    {viewMode === 'TEAM_SPECIFIC' ? i18n.t('roadmap:page.subtitleTeam') : i18n.t('roadmap:page.subtitlePublic')}
                                </p>
                            </div>
                        </div>

                        {/* Tab Switcher + Create */}
                        <div className="flex items-center gap-2">
                            <RoadmapTabSwitcher viewMode={viewMode} userRole={user?.role} onSwitch={(mode) => { setViewMode(mode); navigate(mode === 'PUBLIC' ? '/roadmap/public' : '/roadmap/teams'); }} />

                            {isManager && (
                                <button
                                    onClick={() => navigate(`/roadmap/create?type=${viewMode}`)}
                                    className="p-2 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors text-sm shadow-md shadow-blue-500/20"
                                >
                                    <Plus size={15} />
                                    <span className="hidden md:inline">{i18n.t('roadmap:page.createNew')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="relative mt-6">
                        {loading ? (
                            <>
                                {/* Mobile skeleton — dropdown placeholder */}
                                <div className="lg:hidden mb-3">
                                    <div className="h-[52px] rounded-xl bg-blue-50 dark:bg-slate-800/70 border border-blue-100/80 dark:border-slate-700/60 animate-pulse" />
                                </div>
                                {/* Desktop skeleton — two-panel layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                    <div className="hidden lg:block lg:col-span-4 xl:col-span-3"><SubjectListSkeleton /></div>
                                    <div className="lg:col-span-8 xl:col-span-9"><TimelineSkeleton /></div>
                                </div>
                            </>
                        ) : roadmaps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 text-slate-300">
                                    <Layers size={36} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 dark:text-white">{i18n.t('roadmap:page.noRoadmaps')}</h3>
                                <p className="text-slate-500 mt-1.5 max-w-md text-sm">{i18n.t('roadmap:page.noRoadmapsHint')}</p>
                                {isManager && (
                                    <button onClick={() => navigate(`/roadmap/create?type=${viewMode}`)} className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm">
                                        {i18n.t('roadmap:page.createNow')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Mobile: Custom dropdown with roadmap icon + name */}
                                <div className="lg:hidden mb-3" ref={mobileDropdownRef}>
                                    <div className="relative">
                                        {/* Trigger button */}
                                        <button
                                            onClick={() => setMobileDropdownOpen(prev => !prev)}
                                            className="w-full flex items-center gap-3 min-h-[48px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/80"
                                        >
                                            {/* Active roadmap icon */}
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                <RoadmapIcon iconUrl={activeRoadmap?.iconUrl || ''} size={20} />
                                            </div>
                                            <span className="flex-1 text-left text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                                {activeRoadmap?.name ?? i18n.t('roadmap:page.selectRoadmap')}
                                            </span>
                                            <ChevronDown
                                                size={16}
                                                className={`text-slate-400 shrink-0 transition-transform duration-200 ${mobileDropdownOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {/* Dropdown list */}
                                        <div
                                            className={`absolute left-0 right-0 top-full mt-1.5 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden transition-all duration-200 ease-out ${mobileDropdownOpen ? 'max-h-[320px] opacity-100' : 'max-h-0 opacity-0 border-transparent'
                                                }`}
                                        >
                                            <div className="max-h-[320px] overflow-y-auto py-1.5 px-1.5">
                                                {roadmaps.map(r => {
                                                    const isSelected = activeId === r.id;
                                                    return (
                                                        <button
                                                            key={r.id}
                                                            onClick={() => { setActiveId(r.id); setMobileDropdownOpen(false); }}
                                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left mb-0.5 ${isSelected
                                                                ? 'bg-humg-blue text-white shadow-md shadow-humg-blue/20'
                                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                                                                }`}
                                                        >
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${isSelected
                                                                ? 'bg-white/20'
                                                                : 'bg-slate-100 dark:bg-slate-700'
                                                                }`}>
                                                                <RoadmapIcon iconUrl={r.iconUrl || ''} size={16} />
                                                            </div>
                                                            <span className="text-sm font-bold truncate flex-1">{r.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile manager actions */}
                                    {isManager && activeRoadmap && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => navigate(`/roadmap/edit/${activeRoadmap.slug}`)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit size={13} /> {i18n.t('roadmap:page.editMobile')}
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ open: true, target: activeRoadmap, deleting: false })}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={13} /> {i18n.t('roadmap:page.deleteMobile')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Desktop: Two-panel layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                    {/* Sidebar Panel - cool slate-blue tint */}
                                    <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
                                        <div className="flex flex-col gap-2 sticky top-[100px] max-h-[calc(100vh-140px)] overflow-y-auto bg-blue-50/60 dark:bg-slate-800/70 p-4 rounded-2xl border border-blue-100/80 dark:border-slate-700/60 shadow-sm custom-scrollbar">
                                            <div className="flex items-center gap-3 px-1 mb-2">
                                                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <BookOpen size={16} />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">{i18n.t('roadmap:page.sidebarTitle')}</h3>
                                            </div>
                                            {roadmaps.map(item => (
                                                <SubjectItem
                                                    key={item.id}
                                                    item={item}
                                                    isActive={activeId === item.id}
                                                    onClick={() => setActiveId(item.id)}
                                                />
                                            ))}

                                            {/* Manager actions for active roadmap */}
                                            {isManager && activeRoadmap && (
                                                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                                                    <button
                                                        onClick={() => navigate(`/roadmap/edit/${activeRoadmap.slug}`)}
                                                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        <Edit size={16} /> {i18n.t('roadmap:page.editRoadmap')}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, target: activeRoadmap, deleting: false })}
                                                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} /> {i18n.t('roadmap:page.deleteRoadmap')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline Panel - warm white */}
                                    <div className="lg:col-span-8 xl:col-span-9">
                                        <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 lg:p-6 rounded-2xl border border-slate-200/70 dark:border-slate-700/50 shadow-sm">
                                            {activeRoadmap ? (
                                                <div
                                                    key={activeId}
                                                    className="animate-in fade-in slide-in-from-bottom-2 duration-200"
                                                >
                                                    {/* Roadmap header */}
                                                    <div className="mb-6 flex items-start justify-between">
                                                        <div>
                                                            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1.5">{activeRoadmap.name}</h2>
                                                            {activeRoadmap.description ? (
                                                                <RoadmapMarkdown content={activeRoadmap.description} compact className="text-sm" />
                                                            ) : (
                                                                <p className="text-sm text-slate-500 dark:text-slate-400">{i18n.t('roadmap:page.noDescription')}</p>
                                                            )}
                                                        </div>

                                                        {/* Mobile manager actions */}
                                                        {isManager && (
                                                            <div className="flex lg:hidden gap-1 shrink-0">
                                                                <button onClick={() => navigate(`/roadmap/edit/${activeRoadmap.slug}`)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Edit size={16} /></button>
                                                                <button onClick={() => setDeleteModal({ open: true, target: activeRoadmap, deleting: false })} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <TimelineView
                                                        roadmapSlug={activeRoadmap.slug}
                                                        roadmap={activeRoadmap}
                                                        isManager={isManager}
                                                        onChapterClick={(stage) => navigate(`${routePrefix}/${activeRoadmap.slug}/${stage.id}`)}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                                                    <Map size={40} className="mb-3 opacity-30" />
                                                    <p className="font-medium">{i18n.t('roadmap:page.selectToView')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={deleteModal.open}
                roadmapName={deleteModal.target?.name || ''}
                onClose={() => setDeleteModal(prev => ({ ...prev, open: false }))}
                onConfirm={handleDelete}
                isDeleting={deleteModal.deleting}
            />
        </div>
    );
};

export default RoadmapPage;
