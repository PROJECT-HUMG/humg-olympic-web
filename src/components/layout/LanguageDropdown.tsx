import type { RefObject } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, LANGUAGES, AppLanguage } from '@/hooks/useLanguage';

interface LanguageDropdownProps {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    dropdownRef: RefObject<HTMLDivElement | null>;
}

export const LanguageDropdown = ({
    isOpen,
    onToggle,
    onClose,
    dropdownRef
}: LanguageDropdownProps) => {
    const { language, setLanguage } = useLanguage();

    const handleSelectLanguage = (code: AppLanguage) => {
        setLanguage(code);
        onClose();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={onToggle}
                className={`relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full shrink-0 transition-all duration-300 overflow-hidden border hover:scale-105 ${isOpen
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-humg-blue dark:text-blue-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                aria-label="Switch language"
            >
                <Globe size={18} />
            </button>

            <div
                className={`absolute right-0 top-full mt-3 w-40 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden origin-top-right z-50 transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                    }`}
            >
                <div className="p-2 space-y-1">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelectLanguage(lang.code)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${language === lang.code
                                    ? 'bg-humg-blue/10 dark:bg-blue-900/30 text-humg-blue dark:text-blue-400'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span>
                                {lang.label} ({lang.code.toUpperCase()})
                            </span>
                            {language === lang.code && <Check size={16} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
