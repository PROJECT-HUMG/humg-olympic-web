import { useId } from 'react';

import { Layers, ChevronRight, BookOpen, Files } from 'lucide-react';
import { ResourceCategory } from '@/features/resources/types/resources.types';
import i18n from '@/i18n';

interface ResourceFiltersProps {
    categories: ResourceCategory[];
    activeCategory: number | string | null;
    onSelectCategory: (id: number | string) => void;
    totalItems: number;
}

export const ResourceFilters = ({
    categories,
    activeCategory,
    onSelectCategory,
    totalItems
}: ResourceFiltersProps) => {
    const groupId = useId();

    return (
        <aside className="w-full lg:w-64 shrink-0 space-y-4" aria-label={i18n.t('resources:filters.ariaLabel')}>
            {/* Stats card */}
            <div className="bg-linear-to-br from-humg-blue to-blue-800 p-5 rounded-2xl text-white shadow-lg shadow-blue-900/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
                        <Files size={20} />
                    </div>
                    <div>
                        <p className="text-blue-100 text-xs font-medium">{i18n.t('resources:filters.totalDocs')}</p>
                        <p className="text-2xl font-bold">{totalItems}</p>
                    </div>
                </div>
                <p className="text-blue-200 text-xs">{i18n.t('resources:filters.alwaysUpdated')}</p>
            </div>

            {/* Categories */}
            <nav className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 text-sm px-1">
                    <Layers size={16} className="text-humg-blue" /> {i18n.t('resources:filters.categories')}
                </h3>
                <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                    {categories.map(cat => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onSelectCategory(cat.id)}
                                className={`relative group w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 whitespace-nowrap flex items-center justify-between gap-2 ${isActive
                                    ? 'text-white bg-humg-blue shadow-md shadow-blue-500/15'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-humg-blue dark:hover:text-blue-400'
                                    }`}
                            >
                                <span className="relative z-10 truncate">{cat.label}</span>
                                <ChevronRight
                                    size={14}
                                    className={`relative z-10 shrink-0 transition-colors duration-200 ${isActive
                                        ? 'text-white/80'
                                        : 'opacity-0 group-hover:opacity-60 text-slate-400'
                                        }`}
                                />
                            </button>
                        );
                    })}
                </div>
            </nav>
        </aside>
    );
};
