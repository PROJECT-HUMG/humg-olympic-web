import { useState, useRef, useEffect, useCallback, type ElementType } from 'react';
import { Search, ChevronDown, X, Check, Loader2 } from 'lucide-react';
import i18n from '@/i18n';

interface Option {
    id: number | string;
    name: string;
}

interface AsyncSearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
    // Async data loading
    loadOptions: (search: string, page: number, limit: number) => Promise<{ data: Option[]; total: number }>;
    pageSize?: number;
    debounceMs?: number;
    // Optional: provide initial selected option (for showing name when modal opens)
    initialSelectedOption?: Option | null;
    icon?: ElementType;
}

export const AsyncSearchableSelect = ({
    value,
    onChange,
    placeholder = i18n.t('common:searchPlaceholder'),
    error,
    disabled = false,
    className = '',
    loadOptions,
    pageSize = 20,
    debounceMs = 500,
    initialSelectedOption,
    icon: Icon,
}: AsyncSearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [options, setOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedOption, setSelectedOption] = useState<Option | null>(initialSelectedOption || null);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchOptions = useCallback(async (searchTerm: string, pageNum: number, reset: boolean = false) => {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        try {
            const result = await loadOptions(searchTerm, pageNum, pageSize);

            // Check if request was aborted
            if (abortControllerRef.current?.signal.aborted) {
                return;
            }

            setOptions(prev => reset ? result.data : [...prev, ...result.data]);
            setHasMore(result.data.length === pageSize && result.total > pageNum * pageSize);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
        } finally {
            setIsLoading(false);
        }
    }, [loadOptions, pageSize]);

    useEffect(() => {
        if (!isOpen) return;

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            setPage(1);
            fetchOptions(search, 1, true);
        }, debounceMs);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [search, isOpen, fetchOptions, debounceMs]);

    useEffect(() => {
        if (isOpen && options.length === 0 && !isLoading) {
            fetchOptions('', 1, true);
        }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleScroll = useCallback(() => {
        if (!dropdownRef.current || isLoading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchOptions(search, nextPage, false);
        }
    }, [isLoading, hasMore, page, search, fetchOptions]);

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (value && initialSelectedOption && String(initialSelectedOption.id) === value) {
            setSelectedOption(initialSelectedOption);
        } else if (value) {
            const found = options.find(opt => String(opt.id) === value);
            if (found) {
                setSelectedOption(found);
            }
        } else {
            setSelectedOption(null);
        }
    }, [value, options, initialSelectedOption]);

    const handleSelect = (option: Option) => {
        onChange(String(option.id));
        setSelectedOption(option);
        setIsOpen(false);
        setSearch('');
        setOptions([]);
        setPage(1);
    };

    const handleClear = (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        onChange('');
        setSelectedOption(null);
        setSearch('');
        setOptions([]);
        setPage(1);
    };

    const handleToggle = () => {
        if (disabled) return;
        const willOpen = !isOpen;
        setIsOpen(willOpen);

        if (willOpen) {
            setSearch('');
            setOptions([]);
            setPage(1);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const baseInputClass = `w-full ${Icon ? 'pl-12 pr-12' : 'px-4'} py-4 bg-slate-50 dark:bg-slate-800/50 border rounded-xl transition-colors focus:ring-4 focus:ring-humg-blue/10 focus:border-humg-blue outline-none`;
    const errorClass = error ? "border-red-300 focus:border-red-500" : "border-slate-200 dark:border-slate-700";
    const disabledClass = disabled ? "bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed opacity-60" : "";

    return (
        <div ref={containerRef} className={`relative group ${className}`}>
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Icon className={`h-5 w-5 transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-humg-blue'}`} />
                </div>
            )}
            <div
                onClick={handleToggle}
                className={`${baseInputClass} ${errorClass} ${disabledClass} flex items-center justify-between cursor-pointer`}
            >
                <span className={selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                    {selectedOption?.name || placeholder}
                </span>
                <div className="flex items-center gap-1">
                    {value && !disabled && (
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X size={14} className="text-slate-400" />
                        </button>
                    )}
                    <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                                placeholder={i18n.t('common:searchPlaceholder')}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-humg-blue/20 focus:border-humg-blue outline-none"
                            />
                        </div>
                    </div>

                    <div
                        ref={dropdownRef}
                        onScroll={handleScroll}
                        className="max-h-64 overflow-y-auto custom-scrollbar"
                    >
                        {isLoading && options.length === 0 ? (
                            <div className="px-4 py-8 flex items-center justify-center gap-2 text-sm text-slate-500">
                                <Loader2 size={16} className="animate-spin" />
                                <span>{i18n.t('common:loading')}</span>
                            </div>
                        ) : options.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                {i18n.t('common:noResults')}
                            </div>
                        ) : (
                            <>
                                {options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSelect(option)}
                                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${String(option.id) === value
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'text-slate-700 dark:text-slate-200'
                                            }`}
                                    >
                                        {option.name}
                                        {String(option.id) === value && (
                                            <Check size={16} className="text-blue-600 dark:text-blue-400" />
                                        )}
                                    </button>
                                ))}
                                {isLoading && options.length > 0 && (
                                    <div className="px-4 py-3 flex items-center justify-center gap-2 text-sm text-slate-500">
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>{i18n.t('common:loadingMore')}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
