import type { ElementType } from 'react';
import { Link } from 'react-router-dom';
import { Award, Database, Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { BentoCard, EmptyState } from '@/features/dashboard/components/DashboardLayout';
import i18n from '@/i18n';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { BadgeFlat } from '@/features/badges/components/BadgeFlat';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import { VerifiedBadge, StudentBadges } from '@/features/badges/components/VerifiedBadge';
import { getUserNameColor } from '@/utils/rankingHelpers';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';
import type { Author } from '@/features/forum/types/forum.types';
import type { BadgeItem } from '@/features/auth/types/auth.types';
import type { AdminUserResponse } from '@/features/admin/types/admin.types';
import type { HeroSlideResponse } from '@/features/hero/types/hero.types';
import type { DataItem } from '../AdminDashboard';

interface DataCategory {
    id: string;
    label: string;
    icon: ElementType;
}

interface AdminDataTabProps {
    dataCategories: DataCategory[];
    selectedDataType: string;
    selectedCategory: DataCategory | undefined;
    selectedData: DataItem[];
    dataSearch: string;
    dataPage: number;
    totalPages: number;
    isLoadingData: boolean;
    categoryTotals: Record<string, number>;
    onCategoryChange: (id: string) => void;
    onSearchChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onOpenModal: (modal: string) => void;
    onEditItem: (item: DataItem) => void;
    onConfirmDelete: (type: string, ids: Array<number | string>) => void;
    getName: (type: string, item: DataItem) => string;
    getSubtitle: (type: string, item: DataItem) => string;
    // User preview
    handleUserHover: (userItem: AdminUserResponse, e: React.MouseEvent) => void;
    handleUserLeave: () => void;
    previewUser: Author | null;
    isPreviewVisible: boolean;
    previewPos: { x: number; y: number };
    handlePreviewMouseEnter: () => void;
    handlePreviewMouseLeave: () => void;
}

export const AdminDataTab = ({
    dataCategories, selectedDataType, selectedCategory, selectedData,
    dataSearch, dataPage, totalPages, isLoadingData, categoryTotals,
    onCategoryChange, onSearchChange, onPageChange,
    onOpenModal, onEditItem, onConfirmDelete,
    getName, getSubtitle,
    handleUserHover, handleUserLeave,
    previewUser, isPreviewVisible, previewPos,
    handlePreviewMouseEnter, handlePreviewMouseLeave,
}: AdminDataTabProps) => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <BentoCard className="p-4 h-fit lg:sticky lg:top-24">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 px-2">{i18n.t('dashboard:views.tabData')}</h3>
            <nav className="space-y-1">
                {dataCategories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onCategoryChange(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedDataType === cat.id
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-neutral-800'
                            }`}
                    >
                        <span className="flex items-center gap-2.5">
                            <cat.icon size={16} />
                            {cat.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${selectedDataType === cat.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-neutral-700 text-slate-500 dark:text-slate-400'
                            }`}>
                            {categoryTotals[cat.id]}
                        </span>
                    </button>
                ))}
            </nav>
        </BentoCard>

        {/* Data Table */}
        <BentoCard className="lg:col-span-3 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {selectedCategory && <selectedCategory.icon size={20} className="text-blue-600 dark:text-blue-400" />}
                    <h3 className="font-semibold text-slate-900 dark:text-white">{selectedCategory?.label}</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 sm:w-48">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={i18n.t('dashboard:tabs.searchPlaceholder')}
                            value={dataSearch}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-neutral-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={() => onOpenModal(`${selectedDataType}-create`)}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={16} />
                        {i18n.t('dashboard:tabs.addNew')}
                    </button>
                </div>
            </div>

            {isLoadingData ? (
                <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="flex items-center justify-between px-5 py-4 animate-pulse">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-10 h-10 bg-slate-200 dark:bg-neutral-700 rounded-lg" />
                                <div className="flex-1">
                                    <div className="h-4 bg-slate-200 dark:bg-neutral-700 rounded w-1/3 mb-2" />
                                    <div className="h-3 bg-slate-100 dark:bg-neutral-800 rounded w-1/4" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 bg-slate-200 dark:bg-neutral-700 rounded-lg" />
                                <div className="w-8 h-8 bg-slate-200 dark:bg-neutral-700 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : selectedData.length === 0 ? (
                <div className="p-12">
                    <EmptyState
                        icon={selectedCategory?.icon || Database}
                        title={dataSearch ? i18n.t('dashboard:tabs.noDataFound') : i18n.t('dashboard:tabs.noDataYet')}
                        description={dataSearch ? i18n.t('dashboard:tabs.tryOtherKeyword') : i18n.t('dashboard:tabs.noDataDesc')}
                        action={!dataSearch ? { label: '+', onClick: () => onOpenModal(`${selectedDataType}-create`) } : undefined}
                    />
                </div>
            ) : (
                <>
                    <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                        {selectedData.map((item) => (
                            <div key={item.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors group">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {selectedDataType === 'heroSlide' && (item as HeroSlideResponse).imageUrl && (
                                        <img src={(item as HeroSlideResponse).imageUrl} alt="" className="w-16 h-10 object-cover rounded-lg border border-slate-200 dark:border-neutral-700" />
                                    )}

                                    {selectedDataType === 'user' && (
                                        <Link
                                            to={`/profile/${item.id}`}
                                            onMouseEnter={(e) => handleUserHover(item as AdminUserResponse, e)}
                                            onMouseLeave={handleUserLeave}
                                            className="relative shrink-0"
                                        >
                                            <img src={getAvatarUrl((item as AdminUserResponse).avatarUrl, (item as AdminUserResponse).fullName || '')} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-500 transition-colors" onError={(e) => handleAvatarError(e, (item as AdminUserResponse).fullName || '')} />
                                        </Link>
                                    )}

                                    {selectedDataType === 'badge' && (
                                        <div className="flex-shrink-0">
                                            <BadgeFlat badge={{ ...item as BadgeItem, isEarned: true, isSelected: false }} onClick={() => { }} size="sm" />
                                        </div>
                                    )}

                                    {(selectedDataType === 'resourceCategory' || selectedDataType === 'subject') && (item as any).color && (
                                        <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: (item as any).color }} />
                                    )}

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            {selectedDataType === 'user' ? (
                                                <>
                                                    <Link
                                                        to={`/profile/${item.id}`}
                                                        onMouseEnter={(e) => handleUserHover(item as AdminUserResponse, e)}
                                                        onMouseLeave={handleUserLeave}
                                                        className={`text-sm font-semibold truncate hover:underline transition-colors ${getUserNameColor((item as AdminUserResponse).xpPoints)}`}
                                                    >
                                                        {getName(selectedDataType, item)}
                                                    </Link>
                                                    <VerifiedBadge role={(item as AdminUserResponse).role} size={13} />
                                                    <StudentBadges badges={(item as AdminUserResponse).badges} maxDisplay={3} />
                                                </>
                                            ) : (
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{getName(selectedDataType, item)}</p>
                                            )}
                                        </div>
                                        {getSubtitle(selectedDataType, item) && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{getSubtitle(selectedDataType, item)}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    {selectedDataType === 'user' && (
                                        <button
                                            onClick={() => { onEditItem(item); onOpenModal('user-badges'); }}
                                            className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                            title={i18n.t('dashboard:tabs.manageBadges')}
                                        >
                                            <Award size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            onEditItem(item);
                                            onOpenModal(`${selectedDataType}-update`);
                                        }}
                                        className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onConfirmDelete(selectedDataType, [item.id])}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {previewUser && (
                        <UserPreviewCard
                            author={previewUser}
                            isVisible={isPreviewVisible}
                            position={previewPos}
                            onMouseEnter={handlePreviewMouseEnter}
                            onMouseLeave={handlePreviewMouseLeave}
                        />
                    )}
                    {totalPages > 1 && (
                        <div className="px-5 py-4 border-t border-slate-100 dark:border-neutral-800">
                            <PaginationControls current={dataPage} total={totalPages} onChange={onPageChange} />
                        </div>
                    )}
                </>
            )}
        </BentoCard>
    </div>
);
