import { type ReactNode, useState } from 'react';
import {
    ArrowLeft, FileText, CheckCircle, ChevronRight,
    Lock, Unlock, MonitorPlay, BookOpen, HelpCircle,
    Home, Folder, ExternalLink, Trophy, GraduationCap, Play,
    Layers, MessageCircle, Eye, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoadmapStage, StageResource, ResourceType } from '@/features/roadmap/types/roadmap.types';
import { ShareButton } from '@/components/ui/ShareButton';
import i18n from '@/i18n';

import { useResourcePreview } from '@/hooks/useResourcePreview';
import { PreviewModal } from '@/features/resources/components/PreviewModal';

// ─── SKELETON ────────────────────────────────────────────
export const ChapterDetailSkeleton = () => (
    <div className="min-h-screen pt-24 pb-20 font-sans">
        <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6 lg:p-10 backdrop-blur-xl animate-pulse">
                {/* Breadcrumb skeleton */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-3 w-3 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-3 w-3 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>

                {/* Chapter header skeleton */}
                <div className="mb-8 space-y-4">
                    <div className="flex gap-2">
                        <div className="h-6 w-24 bg-blue-100 dark:bg-blue-900/30 rounded-lg" />
                        <div className="h-6 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg" />
                    </div>
                    <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {[1, 2, 3].map(i => <div key={i} className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />)}
                    </div>
                </div>

                {/* Content grid skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Resources skeleton */}
                    <div className="lg:col-span-8 space-y-3">
                        <div className="h-5 w-28 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4" />
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Sidebar skeleton */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 space-y-3">
                            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between">
                                    <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                                    <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
                                </div>
                            ))}
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/30 space-y-2">
                            <div className="h-4 w-24 bg-blue-100 dark:bg-blue-900/30 rounded" />
                            <div className="h-3 w-full bg-blue-100/60 dark:bg-blue-900/20 rounded" />
                            <div className="h-3 w-4/5 bg-blue-100/60 dark:bg-blue-900/20 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


// ─── RESOURCE CONFIG ─────────────────────────────────────────────────

const RESOURCE_CONFIG: Record<ResourceType, {
    icon: ReactNode;
    labelKey: string;
    accentClass: string;
    bgClass: string;
    textClass: string;
}> = {
    VIDEO: {
        icon: <Play size={16} className="fill-current" />,
        labelKey: 'roadmap:chapterDetail.videoLabel',
        accentClass: 'bg-red-500',
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        textClass: 'text-red-600 dark:text-red-400',
    },
    EXAM: {
        icon: <GraduationCap size={16} />,
        labelKey: 'roadmap:chapterDetail.examLabel',
        accentClass: 'bg-purple-500',
        bgClass: 'bg-purple-50 dark:bg-purple-900/20',
        textClass: 'text-purple-600 dark:text-purple-400',
    },
    CONTEST: {
        icon: <Trophy size={16} />,
        labelKey: 'roadmap:chapterDetail.contestLabel',
        accentClass: 'bg-amber-500',
        bgClass: 'bg-amber-50 dark:bg-amber-900/20',
        textClass: 'text-amber-600 dark:text-amber-400',
    },
    DOC: {
        icon: <BookOpen size={16} />,
        labelKey: 'roadmap:chapterDetail.docLabel',
        accentClass: 'bg-blue-500',
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        textClass: 'text-blue-600 dark:text-blue-400',
    },
};

// ─── RESOURCE ROW ─────────────────────────────────────────────────────

const ResourceRow = ({ resource, index, onPreview }: { resource: StageResource; index: number; onPreview?: (resourceId: number, title: string) => void }) => {
    const cfg = RESOURCE_CONFIG[resource.type] || RESOURCE_CONFIG.DOC;
    const navigate = useNavigate();
    const [showEmbed, setShowEmbed] = useState(false);

    const hasEmbed = resource.type === 'VIDEO' && !!resource.embedUrl;
    const hasResourcePreview = !!resource.resourceId;

    const handleClick = () => {
        if (hasEmbed) {
            setShowEmbed(prev => !prev);
        } else if (hasResourcePreview && onPreview) {
            onPreview(resource.resourceId!, resource.resourceTitle || resource.title);
        } else if (resource.examId) {
            navigate(`/exams/${resource.examId}/preview`);
        } else if (resource.url) {
            window.open(resource.url, '_blank');
        }
    };

    return (
        <div>
            <div
                onClick={handleClick}
                className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-700/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleClick()}
                style={{ animationDelay: `${index * 60}ms`, animationDuration: '300ms' }}
            >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bgClass} ${cfg.textClass} group-hover:scale-110 transition-transform`}>
                    {cfg.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${cfg.textClass}`}>
                        {i18n.t(cfg.labelKey)}
                    </p>
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {resource.examTitle || resource.title}
                    </h4>
                </div>

                {/* Action indicator */}
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        {hasEmbed ? (
                            showEmbed ? <ChevronRight size={14} className="rotate-90" /> : <MonitorPlay size={14} />
                        ) : hasResourcePreview ? (
                            <Eye size={14} />
                        ) : resource.examId ? (
                            <GraduationCap size={14} />
                        ) : (
                            <ExternalLink size={14} />
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Inline YouTube Player ─── */}
            {showEmbed && resource.embedUrl && (
                <div
                    className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/60 bg-black animate-in fade-in slide-in-from-top-2 duration-300"
                >
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                            src={resource.embedUrl}
                            title={resource.title}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </div>
    );
};


// ─── RESOURCE SECTION ─────────────────────────────────────────────────

const ResourceSection = ({ type, resources, startIndex, onPreview }: {
    type: ResourceType; resources: StageResource[]; startIndex: number;
    onPreview?: (resourceId: number, title: string) => void;
}) => {
    const cfg = RESOURCE_CONFIG[type] || RESOURCE_CONFIG.DOC;
    if (resources.length === 0) return null;

    return (
        <div className="mb-6">
            <div className={`flex items-center gap-2 mb-3 px-1`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${cfg.bgClass} ${cfg.textClass}`}>
                    {cfg.icon}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${cfg.textClass}`}>{i18n.t(cfg.labelKey)}</span>
                <span className="text-xs text-slate-400 font-medium ml-auto">{i18n.t('roadmap:chapterDetail.itemCount', { count: resources.length })}</span>
            </div>
            <div className="space-y-2">
                {resources.map((res, i) => (
                    <ResourceRow key={i} resource={res} index={startIndex + i} onPreview={onPreview} />
                ))}
            </div>
        </div>
    );
};

// ─── PROPS ────────────────────────────────────────────────────────────

interface ChapterDetailPageProps {
    chapter: RoadmapStage;
    subjectName: string;
    parentType?: 'subject' | 'team';
    parentId?: number;
    onBack: () => void;
}

// ─── MAIN ─────────────────────────────────────────────────────────────

export const ChapterDetailPage = ({
    chapter,
    subjectName,
    parentType = 'subject',
    onBack
}: ChapterDetailPageProps) => {
    const navigate = useNavigate();
    const { previewData, previewLoadingId, openPreview, closePreview } = useResourcePreview();

    const handleResourcePreview = (resourceId: number, title: string) => {
        openPreview(resourceId, title, 'PDF').catch(() => { });
    };

    // Group resources by type
    const grouped = (chapter.resources || []).reduce((acc, res) => {
        if (!acc[res.type]) acc[res.type] = [];
        acc[res.type].push(res);
        return acc;
    }, {} as Record<ResourceType, StageResource[]>);

    const typeOrder: ResourceType[] = ['VIDEO', 'DOC', 'EXAM', 'CONTEST'];
    const totalResources = chapter.resources?.length || 0;
    const isLocked = chapter.status === 'LOCKED';

    // Count index offset for staggered animation
    let animIdx = 0;

    return (
        <div className="min-h-screen pt-24 pb-20 font-sans">
            {/* Preview Modal */}
            <PreviewModal
                isOpen={previewData.isOpen}
                onClose={closePreview}
                fileUrl={previewData.url}
                fileName={previewData.fileName}
                fileType={previewData.fileType}
            />

            {/* Loading overlay */}
            {previewLoadingId !== null && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white dark:bg-slate-800 px-8 py-6 shadow-2xl border border-slate-200 dark:border-slate-700">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{i18n.t('roadmap:chapterDetail.openingDocument')}</p>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6 lg:p-10 backdrop-blur-xl">

                    {/* ─── BREADCRUMB ─── */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                        >
                            <ArrowLeft size={15} />
                            <span className="hidden sm:inline">{i18n.t('roadmap:chapterDetail.goBack')}</span>
                        </button>
                        <ChevronRight size={13} className="opacity-40" />
                        <button
                            onClick={() => navigate('/roadmap/public')}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 hidden sm:flex"
                        >
                            <Home size={13} /> {i18n.t('roadmap:chapterDetail.roadmapBreadcrumb')}
                        </button>
                        <ChevronRight size={13} className="opacity-40 hidden sm:block" />
                        <button
                            onClick={onBack}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 hidden sm:flex truncate max-w-[160px]"
                        >
                            {parentType === 'team' ? <Folder size={13} /> : <BookOpen size={13} />}
                            <span className="truncate">{subjectName}</span>
                        </button>
                        <ChevronRight size={13} className="opacity-40 hidden sm:block" />
                        <span className="text-slate-800 dark:text-white font-semibold truncate max-w-[180px]">{chapter.title}</span>
                    </div>

                    {/* ─── CHAPTER HEADER ─── */}
                    <div className="mb-8 animate-in fade-in slide-in-from-bottom-3 duration-400">
                        {/* Status + Chapter number */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
                                {i18n.t('roadmap:chapterDetail.chapterNum', { num: chapter.orderIndex + 1 })}
                            </span>
                            {isLocked ? (
                                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                                    <Lock size={10} /> {i18n.t('roadmap:chapterDetail.locked')}
                                </span>
                            ) : (
                                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-100 dark:border-emerald-800/30">
                                    <Unlock size={10} /> {i18n.t('roadmap:chapterDetail.unlocked')}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3 leading-tight">
                            {chapter.title}
                        </h1>

                        {chapter.description && (
                            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-2xl">
                                {chapter.description}
                            </p>
                        )}

                        {/* Stats bar */}
                        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                            {typeOrder.map(type => {
                                const count = grouped[type]?.length || 0;
                                if (!count) return null;
                                const cfg = RESOURCE_CONFIG[type];
                                return (
                                    <div key={type} className="flex items-center gap-1.5 text-sm">
                                        <span className={`${cfg.textClass}`}>{cfg.icon}</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{count}</span>
                                        <span className="text-slate-400 text-xs hidden sm:inline">{i18n.t(cfg.labelKey)}</span>
                                    </div>
                                );
                            })}
                            {totalResources === 0 && (
                                <span className="text-sm text-slate-400 italic">{i18n.t('roadmap:chapterDetail.noResourcesInline')}</span>
                            )}
                        </div>
                    </div>

                    {/* ─── CONTENT GRID ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Main: Resources */}
                        <div className="lg:col-span-8">
                            {totalResources > 0 ? (
                                typeOrder.map(type => {
                                    const items = grouped[type] || [];
                                    const offset = animIdx;
                                    animIdx += items.length;
                                    return (
                                        <ResourceSection
                                            key={type}
                                            type={type}
                                            resources={items}
                                            startIndex={offset}
                                            onPreview={handleResourcePreview}
                                        />
                                    );
                                })
                            ) : (
                                <div className="py-16 text-center bg-white dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Layers size={28} />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{i18n.t('roadmap:chapterDetail.noResourcesEmpty')}</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 space-y-4">
                                {/* Chapter info card */}
                                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-5">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-4">{i18n.t('roadmap:chapterDetail.chapterInfo')}</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">{i18n.t('roadmap:chapterDetail.totalResources')}</span>
                                            <span className="font-bold text-slate-800 dark:text-white">{i18n.t('roadmap:chapterDetail.itemCount', { count: totalResources })}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">{i18n.t('roadmap:chapterDetail.status')}</span>
                                            <span className={`font-bold text-sm ${isLocked ? 'text-slate-500' : 'text-emerald-600'}`}>
                                                {isLocked ? i18n.t('roadmap:chapterDetail.locked') : i18n.t('roadmap:chapterDetail.unlocked')}
                                            </span>
                                        </div>
                                        {typeOrder.map(type => {
                                            const count = grouped[type]?.length || 0;
                                            if (!count) return null;
                                            const cfg = RESOURCE_CONFIG[type];
                                            return (
                                                <div key={type} className="flex items-center justify-between text-sm">
                                                    <span className={`flex items-center gap-1.5 ${cfg.textClass}`}>
                                                        {cfg.icon}
                                                        <span className="text-slate-500">{i18n.t(cfg.labelKey)}</span>
                                                    </span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Help card */}
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <MessageCircle size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">{i18n.t('roadmap:chapterDetail.needHelp')}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                {i18n.t('roadmap:chapterDetail.needHelpHint')}
                                            </p>
                                            <button
                                                onClick={() => navigate('/forum')}
                                                className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                            >
                                                {i18n.t('roadmap:chapterDetail.goToForum')} <ChevronRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Share */}
                                <ShareButton
                                    url={window.location.href}
                                    title={`${subjectName} — ${chapter.title}`}
                                    variant="full"
                                    className="w-full justify-center"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};