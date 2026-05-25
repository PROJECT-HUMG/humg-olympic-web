import { X, AlertCircle } from 'lucide-react';

interface ModalShellProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export const ModalShell = ({ isOpen, title, onClose, children }: ModalShellProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pt-[72px] md:pt-[72px] px-0 md:px-4 pb-0 md:pb-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-humg-dark-surface w-full h-auto max-h-[85vh] md:max-h-[90vh] md:max-w-lg shadow-2xl flex flex-col
                rounded-t-[24px] md:rounded-[24px] mt-auto md:mt-0 
                animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-5 duration-300
                border-t border-x md:border border-white/20 dark:border-slate-800 ring-1 ring-black/5"
            >
                <div className="flex-none px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 bg-white/80 dark:bg-humg-dark-surface/80 backdrop-blur-md z-10 rounded-t-[24px]">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/50 dark:bg-transparent">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Shared form styles
export const inputBaseClass = "w-full px-4 py-3 bg-white dark:bg-slate-900/50 border rounded-xl transition-colors duration-200 focus:ring-2 focus:ring-humg-blue/20 focus:border-humg-blue outline-none shadow-sm hover:border-humg-blue/50";
export const inputErrorClass = "border-red-500 dark:border-red-500/50 bg-red-50/50 dark:bg-red-900/10 text-red-600 dark:text-red-400 placeholder:text-red-300";
export const inputNormalClass = "border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400";
export const inputDisabledClass = "bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60 border-slate-200 dark:border-slate-800 text-slate-500";

interface FormFieldProps {
    label?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

export const FormField = ({ label, error, required, children }: FormFieldProps) => (
    <div className="space-y-1.5">
        {label && (
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        {children}
        {error && (
            <div className="flex items-center gap-1.5 text-red-500 text-xs">
                <AlertCircle size={12} />
                <span>{error}</span>
            </div>
        )}
    </div>
);
