import { AlertTriangle, Info, X, Loader2 } from 'lucide-react';
import i18n from '@/i18n';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'info' | 'warning';
}

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    title,
    message,
    confirmText = i18n.t('common:confirm'),
    cancelText = i18n.t('common:cancelAction'),
    variant = 'danger'
}: ConfirmModalProps) => {
    if (!isOpen) return null;


    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconBg: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500',
                    btn: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20',
                    icon: <AlertTriangle size={24} />
                };
            case 'warning':
                return {
                    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500',
                    btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
                    icon: <AlertTriangle size={24} />
                };
            default:
                return {
                    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500',
                    btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
                    icon: <Info size={24} />
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={!isLoading ? onClose : undefined}
            />

            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-colors animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700">

                {!isLoading && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X size={20} />
                    </button>
                )}

                <div className="p-6">
                    <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-4">
                        <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                            {styles.icon}
                        </div>

                        <div className="flex-1 mt-2 sm:mt-0">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-6">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="inline-flex justify-center items-center rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`inline-flex justify-center items-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-colors ${styles.btn}`}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? i18n.t('common:processing') : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};