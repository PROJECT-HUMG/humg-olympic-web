import { useEffect, type MouseEvent } from 'react';
import { X, History, Monitor, Globe, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useSettings } from '@/features/settings/hooks/useSettings';
import i18n from '@/i18n';

interface Props {
    onClose: () => void;
    settings: ReturnType<typeof useSettings>;
}

const formatDate = (dateStr: string) => {
    try {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        }).format(new Date(dateStr));
    } catch { return dateStr; }
};

export const LoginHistoryModal = ({ onClose, settings }: Props) => {
    useEffect(() => {
        settings.loadLoginHistory(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBackdrop = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={handleBackdrop}
        >
            <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-neutral-800 shrink-0">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                            <History size={16} />
                        </span>
                        {i18n.t('settings:loginHistory.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {settings.historyLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={28} className="animate-spin text-blue-500" />
                        </div>
                    ) : settings.loginHistory.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
                            {i18n.t('settings:loginHistory.empty')}
                        </p>
                    ) : (
                        <div className="space-y-2.5">
                            {settings.loginHistory.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-neutral-800/50 rounded-xl border border-slate-100 dark:border-neutral-800"
                                >
                                    <div className={`p-2 rounded-lg shrink-0 ${item.status === 'SUCCESS'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}
                                    >
                                        {item.status === 'SUCCESS' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <Monitor size={13} className="text-slate-400 shrink-0" />
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.device}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Globe size={11} className="shrink-0" />
                                                <span className="truncate">{item.ipAddress}</span>
                                            </span>
                                            <span className="text-slate-400">{formatDate(item.loginAt)}</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <p className={`text-xs font-semibold ${item.status === 'SUCCESS' ? 'text-green-600' : 'text-red-500'}`}>
                                            {item.status === 'SUCCESS' ? i18n.t('settings:loginHistory.statusSuccess') : i18n.t('settings:loginHistory.statusFailed')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer — Pagination */}
                {settings.historyTotalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-neutral-800 shrink-0">
                        <button
                            onClick={() => settings.loadLoginHistory(settings.historyPage - 1)}
                            disabled={settings.historyPage <= 1 || settings.historyLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={16} />
                            {i18n.t('settings:loginHistory.previous')}
                        </button>
                        <span className="text-sm text-slate-500">
                            Trang {settings.historyPage} / {settings.historyTotalPages}
                        </span>
                        <button
                            onClick={() => settings.loadLoginHistory(settings.historyPage + 1)}
                            disabled={settings.historyPage >= settings.historyTotalPages || settings.historyLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
                        >
                            Sau
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
