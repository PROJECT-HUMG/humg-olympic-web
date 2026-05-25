import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { useSettings } from '@/features/settings/hooks/useSettings';
import i18n from '@/i18n';

interface Props {
    settings: ReturnType<typeof useSettings>;
}

export const DangerZoneSection = ({ settings }: Props) => {
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [reason, setReason] = useState('');

    const isValid = confirmText === 'DELETE ACCOUNT' && password.length > 0;

    const handleDelete = async () => {
        if (!isValid) return;
        // Frontend converts Vietnamese confirm text to English for backend
        const payload: { password: string; confirmText: string; reason?: string } = {
            password,
            confirmText: 'DELETE ACCOUNT'
        };
        if (reason.trim()) {
            payload.reason = reason;
        }
        const success = await settings.requestDeletion(payload);
        if (success) {
            setShowModal(false);
            setPassword('');
            setConfirmText('');
            setReason('');
        }
    };

    return (
        <div>
            <div className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
                <h3 className="text-base font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
                    <AlertTriangle size={18} />
                    {i18n.t('settings:danger.title')}
                </h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                    {i18n.t('settings:danger.warning')}
                </p>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 bg-white dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 font-bold rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"
                >
                    <Trash2 size={16} />
                    {i18n.t('settings:danger.deleteAccount')}
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up"
                        style={{ animationDuration: '0.2s' }}
                        onClick={() => !settings.deletionLoading && setShowModal(false)}
                    />
                    <div
                        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 overflow-hidden animate-fade-in-up"
                        style={{ animationDuration: '0.3s' }}
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                {i18n.t('settings:danger.confirmTitle')}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={settings.deletionLoading}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    <span dangerouslySetInnerHTML={{ __html: i18n.t('settings:danger.confirmWarning') }} />
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                    {i18n.t('settings:danger.currentPassword')}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-colors"
                                    placeholder={i18n.t('settings:danger.passwordPlaceholder')}
                                    disabled={settings.deletionLoading}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                    <span dangerouslySetInnerHTML={{ __html: i18n.t('settings:danger.typeConfirm') }} />
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={e => setConfirmText(e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm outline-none focus:ring-2 transition-colors ${confirmText && confirmText === 'DELETE ACCOUNT'
                                            ? 'border-green-300 dark:border-green-600 focus:ring-green-500/30 focus:border-green-500'
                                            : 'border-slate-200 dark:border-slate-700 focus:ring-red-500/30 focus:border-red-500'
                                            }`}
                                        placeholder="DELETE ACCOUNT"
                                        disabled={settings.deletionLoading}
                                    />
                                    {confirmText === 'DELETE ACCOUNT' && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{i18n.t('settings:danger.reasonLabel')}</label>
                                <textarea
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/30 resize-none min-h-[60px] transition-colors"
                                    placeholder={i18n.t('settings:danger.reasonPlaceholder')}
                                    maxLength={500}
                                    disabled={settings.deletionLoading}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-slate-100 dark:border-slate-800">
                            {!isValid && (password || confirmText) && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {!password && <span>{i18n.t('settings:danger.enterPassword')}</span>}
                                    {password && confirmText !== 'DELETE ACCOUNT' && <span>{i18n.t('settings:danger.typePhrase')}</span>}
                                </p>
                            )}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    disabled={settings.deletionLoading}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                                >
                                    {i18n.t('common:cancel')}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!isValid || settings.deletionLoading}
                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-sm transition-colors active:scale-[0.98] flex items-center gap-2"
                                >
                                    {settings.deletionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    {i18n.t('settings:danger.deleteAccount')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
