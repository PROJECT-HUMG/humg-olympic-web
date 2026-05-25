import { memo, useState } from 'react';

import { Link } from 'react-router-dom';
import { Download, Eye, Calendar, HardDrive, Edit, Trash2, User, ArrowDownToLine } from 'lucide-react';
import { ResourceItem } from '@/features/resources/types/resources.types';
import i18n from '@/i18n';
import { FileIcon, FileTypeBadge, getFileConfig } from './FileIcon';
import { VerifiedBadge } from '@/features/badges/components/VerifiedBadge';
import { useUserPreview } from '@/hooks/useUserPreview';
import { resourceAuthorToPreviewAuthor } from '@/utils/resourceHelpers';
import type { Author } from '@/features/forum/types/forum.types';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';

interface ResourceCardProps {
    item: ResourceItem;
    onClick: () => void;
    onPreview: () => void;
    canManage?: boolean;
    onEdit: () => void;
    onDelete: () => void;
    index?: number;
}

// Hex glow colours aligned with each file type's gradient accent
const TYPE_GLOW: Record<string, string> = {
    PDF: '#ef4444',
    DOCX: '#3b82f6',
    PPTX: '#f97316',
    XLSX: '#10b981',
    ZIP: '#f59e0b',
    RAR: '#f59e0b',
    PNG: '#8b5cf6',
    JPG: '#8b5cf6',
    JPEG: '#8b5cf6',
};



const ResourceCardComponent = ({
    item, onClick, onPreview, canManage, onEdit, onDelete, index = 0,
}: ResourceCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const fileConfig = getFileConfig(item.fileType);
    const glowColor = TYPE_GLOW[item.fileType?.toUpperCase()] ?? '#64748b';

    const {
        isVisible: showPreview,
        position: previewPosition,
        previewItem,
        handleHoverStart,
        handleHoverEnd,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave,
    } = useUserPreview<Author>();

    return (
        <article
            className="group relative bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col h-full overflow-hidden transition-transform duration-200 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onPreview()}
            aria-label={i18n.t('resources:card.ariaLabel', { title: item.title })}
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)', animationDelay: `${index * 60}ms`, animationDuration: '380ms' }}
        >
            {/* Hover glow border */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
                style={{ boxShadow: `0 0 0 1px ${glowColor}35, 0 12px 40px ${glowColor}12` }}
            />

            {/* Gradient accent bar */}
            <div className={`h-[3px] w-full bg-linear-to-r ${fileConfig.accent} shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`} />

            <div className="p-5 flex-1 flex flex-col">
                {/* Header: icon + badges + download count */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="transition-transform duration-300 group-hover:scale-105">
                            <FileIcon type={item.fileType} className="w-11 h-11" size={22} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <FileTypeBadge type={item.fileType} />
                            <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 truncate max-w-35">
                                {item.category}
                            </span>
                        </div>
                    </div>

                    {item.downloads > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/40 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50">
                            <ArrowDownToLine size={10} />
                            <span className="font-medium">{item.downloads}</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3
                    onClick={onPreview}
                    className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-humg-blue dark:group-hover:text-blue-400 cursor-pointer transition-colors duration-200 leading-snug"
                    title={item.title}
                >
                    {item.title}
                </h3>

                {/* Description */}
                {item.description ? (
                    <div className="mb-4 flex-1">
                        <p
                            className={`text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${isExpanded ? '' : 'line-clamp-2'}`}
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        >
                            {item.description}
                        </p>
                        {item.description.length > 100 && !isExpanded && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                                className="text-[11px] font-bold text-humg-blue hover:underline mt-1"
                            >
                                {i18n.t('resources:card.readMore')}
                            </button>
                        )}
                    </div>
                ) : (
                    <p className="text-[13px] text-slate-400 dark:text-slate-500 mb-4 line-clamp-2 flex-1 italic">
                        {i18n.t('resources:card.noDescription')}
                    </p>
                )}

                {/* Metadata footer */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50 space-y-2.5">
                    {/* Author + file size */}
                    <div className="flex items-center justify-between">
                        {item.author ? (
                            <Link
                                to={`/profile/${item.author.id}`}
                                onClick={(e) => e.stopPropagation()}
                                onMouseEnter={(e) => handleHoverStart(resourceAuthorToPreviewAuthor(item.author!), e)}
                                onMouseLeave={handleHoverEnd}
                                className="flex items-center gap-1.5 group/author hover:bg-slate-50 dark:hover:bg-slate-700/40 -ml-1 px-1.5 py-0.5 rounded-lg transition-colors min-w-0"
                            >
                                <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 ring-1 ring-white dark:ring-slate-800">
                                    {item.author.avatar ? (
                                        <img src={item.author.avatar} alt={item.author.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-600 text-slate-400">
                                            <User size={10} />
                                        </div>
                                    )}
                                </div>
                                <span className="flex items-center gap-1 min-w-0">
                                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 group-hover/author:text-humg-blue transition-colors line-clamp-1">
                                        {item.author.name}
                                    </span>
                                    {item.author.role && <VerifiedBadge role={item.author.role} size={11} />}
                                </span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-1.5 opacity-40">
                                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                    <User size={10} />
                                </div>
                                <span className="text-[11px] text-slate-400">{i18n.t('dashboard:contentModals.anonymous')}</span>
                            </div>
                        )}

                        <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                            <HardDrive size={10} /> {item.size}
                        </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                        <Calendar size={10} />
                        <span>{item.date}</span>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="px-4 py-3 flex items-center gap-2 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50">
                <button
                    onClick={(e) => { e.stopPropagation(); onPreview(); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold
                        text-slate-600 dark:text-slate-300
                        bg-white dark:bg-slate-700/60
                        hover:bg-slate-100 dark:hover:bg-slate-600
                        border border-slate-200 dark:border-slate-600
                        hover:border-slate-300 dark:hover:border-slate-500
                        transition-colors duration-200"
                    aria-label={i18n.t('resources:card.previewAriaLabel')}
                >
                    <Eye size={13} /> {i18n.t('resources:card.preview')}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-[12px] font-semibold bg-linear-to-r ${fileConfig.accent} hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md`}
                    aria-label={i18n.t('resources:card.downloadAriaLabel')}
                >
                    <Download size={13} /> {i18n.t('resources:card.download')}
                </button>
            </div>

            {/* Manage buttons */}
            {canManage && (
                <div className="px-4 py-2 flex items-center justify-end gap-1 bg-white dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-700/50">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                    >
                        <Edit size={12} /> {i18n.t('resources:card.edit')}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <Trash2 size={12} /> {i18n.t('resources:card.delete')}
                    </button>
                </div>
            )}

            {previewItem && (
                <UserPreviewCard
                    author={previewItem}
                    isVisible={showPreview}
                    position={previewPosition}
                    onMouseEnter={handlePreviewMouseEnter}
                    onMouseLeave={handlePreviewMouseLeave}
                />
            )}
        </article>
    );
};

export const ResourceCard = memo(ResourceCardComponent);
