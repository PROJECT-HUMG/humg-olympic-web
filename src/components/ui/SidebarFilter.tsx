import { useState, useRef, useEffect } from 'react';
import { Search, Plus, ChevronDown } from 'lucide-react';
import i18n from '@/i18n';

export interface FilterItem {
    id: string | number;
    label: string;
}

interface SidebarFilterProps {
    items: FilterItem[];
    activeId: string | number;
    searchQuery: string;
    onItemChange: (id: string | number) => void;
    onSearchChange: (query: string) => void;
    loading?: boolean;
    searchPlaceholder?: string;
    sectionLabel?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const SidebarFilter = ({
    items,
    activeId,
    searchQuery,
    onItemChange,
    onSearchChange,
    loading = false,
    searchPlaceholder = i18n.t('common:searchPlaceholder'),
    sectionLabel = i18n.t('common:category'),
    actionLabel,
    onAction,
}: SidebarFilterProps) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeLabel = items.find(i => String(i.id) === String(activeId))?.label ?? sectionLabel;

    /* Close dropdown on outside click */
    useEffect(() => {
        if (!mobileOpen) return;
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [mobileOpen]);

    const handleSelect = (id: string | number) => {
        onItemChange(id);
        setMobileOpen(false);
    };

    const categoryButton = (item: FilterItem) => {
        const isActive = String(activeId) === String(item.id);
        return (
            <button
                key={String(item.id)}
                type="button"
                onClick={() => handleSelect(item.id)}
                disabled={loading}
                className={`w-full text-left min-h-[40px] px-3 py-2.5 rounded-xl text-sm font-bold transition-colors duration-200 border touch-manipulation
                    ${isActive
                        ? 'bg-humg-blue border-humg-blue text-white shadow-lg shadow-humg-blue/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 active:bg-slate-100 dark:bg-humg-dark-surface dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 dark:active:bg-slate-600'
                    } ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
                {item.label}
            </button>
        );
    };

    return (
        <div className="flex flex-col gap-4
            bg-white/85 dark:bg-slate-800/75 backdrop-blur-md
            p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/50 shadow-sm
            lg:sticky lg:top-28">

            {/* ── Search ── */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-humg-blue transition-colors shrink-0" />
                </div>
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-xl text-sm font-medium outline-none transition-colors shadow-sm
                        bg-white border border-slate-200 text-slate-800 focus:border-humg-blue focus:ring-4 focus:ring-humg-blue/10
                        dark:bg-humg-dark-surface dark:border-slate-700 dark:text-white touch-manipulation"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* ── Categories — Desktop: always visible, Mobile: dropdown ── */}
            <div ref={dropdownRef}>
                {/* Desktop list (hidden on mobile) */}
                <div className="hidden lg:block">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
                        {sectionLabel}
                    </p>
                    <div className="flex flex-col gap-1.5">
                        {items.map(categoryButton)}
                    </div>
                </div>

                {/* Mobile dropdown toggle (hidden on desktop) */}
                <div className="lg:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(prev => !prev)}
                        className="w-full flex items-center justify-between min-h-[44px] px-4 py-3 rounded-xl text-sm font-bold border transition-colors touch-manipulation
                            bg-white border-slate-200 text-slate-700
                            dark:bg-humg-dark-surface dark:border-slate-700 dark:text-slate-200
                            hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                {sectionLabel}:
                            </span>
                            {activeLabel}
                        </span>
                        <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown list */}
                    <div
                        className={`overflow-hidden transition-all duration-200 ease-out ${mobileOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="flex flex-col gap-1.5">
                            {items.map(categoryButton)}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Action Button ── */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-humg-blue hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-humg-blue/20 transition-colors active:scale-[0.98] whitespace-nowrap touch-manipulation w-full mt-2"
                >
                    <Plus size={18} />
                    <span>{actionLabel}</span>
                </button>
            )}
        </div>
    );
};
