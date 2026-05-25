import { memo } from 'react';

import { Link } from 'react-router-dom';
import { Calendar, Download, Eye, HardDrive, Edit, Trash2, User, ArrowDownToLine } from 'lucide-react';
import { ResourceItem } from '@/features/resources/types/resources.types';
import i18n from '@/i18n';
import { FileIcon, getFileConfig } from './FileIcon';
import { VerifiedBadge } from '@/features/badges/components/VerifiedBadge';
import { useUserPreview } from '@/hooks/useUserPreview';
import { resourceAuthorToPreviewAuthor } from '@/utils/resourceHelpers';
import type { Author } from '@/features/forum/types/forum.types';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';

interface ResourceListItemProps {
    item: ResourceItem;
    onDownload: () => void;
    onPreview: () => void;
    canManage?: boolean;
    onEdit: () => void;
    onDelete: () => void;
    index?: number;
}



const ResourceListItemComponent = ({
    item, onDownload, onPreview, canManage, onEdit, onDelete, index = 0,
}: ResourceListItemProps) => {
    const fileConfig = getFileConfig(item.fileType);
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
            onClick={onPreview}
            className="group flex items-center gap-4 bg-white dark:bg-slate-800/90 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer relative overflow-hidden hover:translate-x-0.5 animate-in fade-in slide-in-from-left-2 fill-mode-both"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onPreview()}
            aria-label={i18n.t('resources:listItem.ariaLabel', { title: item.title })}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animationDelay: `${index * 60}ms`, animationDuration: '300ms' }}
        >
            {/* Left accent bar — low opacity by default, full on hover */}
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-linear-to-b ${fileConfig.accent} opacity-20 group-hover:opacity-100 transition-opacity duration-200`} />

            {/* Icon */}
            <div className="shrink-0 transition-transform duration-300 group-hover:scale-105 pl-1">
                <FileIcon type={item.fileType} className="w-10 h-10" size={20} />
            </div>

            {/* Main info */}
            <div className="flex-grow min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm truncate group-hover:text-humg-blue dark:group-hover:text-blue-400 transition-colors duration-200">
                        {item.title}
                    </h3>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 uppercase tracking-wide shrink-0">
                        {item.category}
                    </span>
                    <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${fileConfig.bg} ${fileConfig.color}`}>
                        {item.fileType}
                    </span>
                </div>

                {item.description ? (
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate pr-4 leading-relaxed">
                        {item.description}
                    </p>
                ) : (
                    <p className="text-[12px] text-slate-400 dark:text-slate-500 truncate pr-4 italic">
                        {i18n.t('resources:listItem.noDescription')}
                    </p>
                )}

                {/* Author + download count */}
                <div className="flex flex-wrap items-center gap-2.5 mt-1">
                    {item.author && (
                        <Link
                            to={`/profile/${item.author.id}`}
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={(e) => handleHoverStart(resourceAuthorToPreviewAuthor(item.author!), e)}
                            onMouseLeave={handleHoverEnd}
                            className="flex items-center gap-1.5 group/author bg-slate-50 dark:bg-slate-700/40 px-1.5 py-0.5 rounded-full pr-2.5 border border-slate-100 dark:border-slate-700/60 hover:border-humg-blue/30 transition-colors"
                        >
                            <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600 ring-1 ring-white dark:ring-slate-800 shrink-0">
                                {item.author.avatar ? (
                                    <img src={item.author.avatar} alt={item.author.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-400">
                                        <User size={8} />
                                    </div>
                                )}
                            </div>
                            <span className="flex items-center gap-1 min-w-0">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 group-hover/author:text-humg-blue dark:group-hover/author:text-blue-400 transition-colors line-clamp-1">
                                    {item.author.name}
                                </span>
                                {item.author.role && <VerifiedBadge role={item.author.role} size={11} />}
                            </span>
                        </Link>
                    )}

                    {item.downloads > 0 && (
                        <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                            <ArrowDownToLine size={10} />
                            {i18n.t('resources:listItem.downloadCount', { count: item.downloads })}
                        </span>
                    )}

                    {/* Mobile metadata */}
                    <span className="flex sm:hidden items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{item.size}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span>{item.date}</span>
                    </span>
                </div>
            </div>

            {/* User preview portal */}
            {previewItem && (
                <UserPreviewCard
                    author={previewItem}
                    isVisible={showPreview}
                    position={previewPosition}
                    onMouseEnter={handlePreviewMouseEnter}
                    onMouseLeave={handlePreviewMouseLeave}
                />
            )}

            {/* Desktop metadata + actions */}
            <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:flex flex-col items-end gap-0.5 min-w-[76px]">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <Calendar size={11} /> {item.date}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                        <HardDrive size={11} /> {item.size}
                    </span>
                </div>

                <div className="flex items-center gap-0.5 pl-3 border-l border-slate-100 dark:border-slate-700/50">
                    <button
                        className="p-2 rounded-lg text-slate-400 hover:text-humg-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title={i18n.t('resources:listItem.preview')}
                        aria-label={i18n.t('resources:listItem.previewAriaLabel')}
                        onClick={(e) => { e.stopPropagation(); onPreview(); }}
                    >
                        <Eye size={15} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDownload(); }}
                        className={`p-2 rounded-lg ${fileConfig.color} hover:${fileConfig.bg} transition-colors`}
                        title={i18n.t('resources:listItem.download')}
                        aria-label={i18n.t('resources:listItem.downloadAriaLabel')}
                    >
                        <Download size={15} />
                    </button>

                    {canManage && (
                        <>
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                title={i18n.t('resources:listItem.edit')}
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title={i18n.t('resources:listItem.delete')}
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </article>
    );
};

export const ResourceListItem = memo(ResourceListItemComponent);
