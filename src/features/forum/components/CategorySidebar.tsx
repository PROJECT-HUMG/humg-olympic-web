import { Category } from '@/features/forum/types/forum.types';
import i18n from '@/i18n';

interface CategorySidebarProps {
    categories: Category[];
    activeCategory: string;
    onSelect: (id: string) => void;
}

export const CategorySidebar = ({
    categories,
    activeCategory,
    onSelect
}: CategorySidebarProps) => {
    return (
        <nav className="bg-white dark:bg-humg-dark-surface rounded-[24px] p-6 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 sticky top-28" aria-label={i18n.t('forum:sidebar.ariaLabel')}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 px-2">
                {i18n.t('forum:sidebar.title')}
            </h3>

            <div className="space-y-1">
                {/* nút Tất cả */}
                <button
                    onClick={() => onSelect('all')}
                    className={`w-full px-4 py-2.5 rounded-[12px] transition-colors duration-200 text-left text-sm ${activeCategory === 'all'
                        ? 'bg-humg-blue text-white font-bold shadow-lg shadow-humg-blue/20'
                        : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    aria-label={i18n.t('forum:sidebar.allAriaLabel')}
                    aria-current={activeCategory === 'all' ? 'true' : undefined}
                >
                    {i18n.t('forum:sidebar.all')}
                </button>

                {categories.map((cat) => {
                    const isActive = activeCategory === String(cat.id);

                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(String(cat.id))}
                            className={`w-full px-4 py-2.5 rounded-[12px] transition-colors duration-200 text-left text-sm ${isActive
                                ? 'bg-humg-blue text-white font-bold shadow-lg shadow-humg-blue/20'
                                : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            aria-label={i18n.t('forum:sidebar.filterByAriaLabel', { name: cat.name })}
                            aria-current={isActive ? 'true' : undefined}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};