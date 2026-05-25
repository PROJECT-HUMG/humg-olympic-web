import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
    current: number;
    total: number;
    onChange: (page: number) => void;
    maxVisible?: number;
}

export const PaginationControls = ({
    current,
    total,
    onChange,
    maxVisible = 5
}: PaginationProps) => {
    const pageNumbers = useMemo(() => {
        if (total <= maxVisible) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
        const halfVisible = Math.floor(maxVisible / 2);

        pages.push(1);

        let start = Math.max(2, current - halfVisible + 1);
        let end = Math.min(total - 1, current + halfVisible - 1);

        if (current <= halfVisible) {
            end = Math.min(total - 1, maxVisible - 1);
        } else if (current >= total - halfVisible) {
            start = Math.max(2, total - maxVisible + 2);
        }

        if (start > 2) {
            pages.push('ellipsis-start');
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < total - 1) {
            pages.push('ellipsis-end');
        }

        if (total > 1) {
            pages.push(total);
        }

        return pages;
    }, [current, total, maxVisible]);

    if (total <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-6 relative z-10">
            <button
                onClick={() => onChange(Math.max(current - 1, 1))}
                disabled={current === 1}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1">
                {pageNumbers.map((page, idx) => {
                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                        return (
                            <span
                                key={page}
                                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 dark:text-slate-500"
                            >
                                <MoreHorizontal size={16} />
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => onChange(page)}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full font-bold text-sm transition-colors duration-300 flex items-center justify-center ${current === page
                                ? 'bg-humg-blue text-white shadow-lg shadow-humg-blue/30'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => onChange(Math.min(current + 1, total))}
                disabled={current === total}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};