import { useState, useEffect, type FormEvent } from 'react';
import { Lock, Eye, EyeOff, Loader2, KeyRound, History, Monitor, Smartphone, Tablet, Globe } from 'lucide-react';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { LoginHistoryModal } from '@/features/settings/components/LoginHistoryModal';

interface Props {
    settings: ReturnType<typeof useSettings>;
}

export const SecuritySection = ({ settings }: Props) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const [showHistoryModal, setShowHistoryModal] = useState(false);

    useEffect(() => {
        settings.loadDeviceSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChangePassword = async (e: FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            showToast(i18n.t('settings:passwordMinLength'), 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast(i18n.t('settings:passwordMismatch'), 'error');
            return;
        }
        if (currentPassword === newPassword) {
            showToast(i18n.t('settings:passwordSameAsCurrent'), 'error');
            return;
        }

        const success = await settings.changePassword({ currentPassword, newPassword, confirmPassword });
        if (success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const getPasswordStrength = (pw: string): { level: number; label: string; color: string } => {
        if (pw.length === 0) return { level: 0, label: '', color: '' };
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[a-z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;

        if (score <= 2) return { level: 1, label: i18n.t('settings:security.strengthWeak'), color: 'bg-red-500' };
        if (score <= 3) return { level: 2, label: i18n.t('settings:security.strengthFair'), color: 'bg-yellow-500' };
        if (score <= 4) return { level: 3, label: i18n.t('settings:security.strengthStrong'), color: 'bg-blue-500' };
        return { level: 4, label: i18n.t('settings:security.strengthVeryStrong'), color: 'bg-green-500' };
    };

    const strength = getPasswordStrength(newPassword);

    const formatDate = (dateStr: string) => {
        try {
            return new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit',
            }).format(new Date(dateStr));
        } catch { return dateStr; }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left Column: Change Password */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <KeyRound size={16} />
                            </span>
                            {i18n.t('settings:security.changePassword')}
                        </h3>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {/* Current Password */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{i18n.t('settings:security.currentPassword')}</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPw ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                                        placeholder={i18n.t('settings:security.currentPasswordPlaceholder')}
                                        required
                                        disabled={settings.changingPassword}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{i18n.t('settings:security.newPassword')}</label>
                                <div className="relative">
                                    <input
                                        type={showNewPw ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                                        placeholder={i18n.t('settings:security.newPasswordPlaceholder')}
                                        required
                                        disabled={settings.changingPassword}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPw(!showNewPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {/* Strength bar */}
                                {newPassword.length > 0 && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : 'bg-transparent'}`} />
                                            ))}
                                        </div>
                                        <span className={`text-xs font-medium ${strength.level <= 1 ? 'text-red-500' : strength.level <= 2 ? 'text-yellow-500' : strength.level <= 3 ? 'text-blue-500' : 'text-green-500'}`}>
                                            {strength.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{i18n.t('settings:security.confirmPassword')}</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPw ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className={`w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm outline-none focus:ring-2 transition-colors ${confirmPassword && confirmPassword !== newPassword
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500/30 focus:border-red-500'
                                            : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
                                            }`}
                                        placeholder={i18n.t('settings:security.confirmPasswordPlaceholder')}
                                        required
                                        disabled={settings.changingPassword}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword !== newPassword && (
                                    <p className="text-xs text-red-500 mt-0.5">{i18n.t('settings:security.passwordMismatchInline')}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={settings.changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {settings.changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                {i18n.t('settings:security.changePassword')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Login History + Device Sessions */}
                <div className="space-y-6">
                    {/* Login History — button opens modal */}
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                                <History size={16} />
                            </span>
                            {i18n.t('settings:security.loginHistory')}
                        </h3>
                        <button
                            onClick={() => setShowHistoryModal(true)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:border-amber-300 dark:hover:border-amber-700 transition-colors group"
                        >
                            <span className="flex items-center gap-2">
                                <History size={15} className="text-amber-500" />
                                {i18n.t('settings:security.viewLoginHistory')}
                            </span>
                            <span className="text-xs text-slate-400 group-hover:text-amber-500 transition-colors">{i18n.t('settings:security.open')}</span>
                        </button>
                    </div>

                    {/* Device Sessions */}
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <Monitor size={16} />
                            </span>
                            {i18n.t('settings:security.loggedInDevices')}
                        </h3>

                        {settings.devicesLoading ? (
                            <div className="space-y-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse">
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                                            <div className="h-2.5 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : settings.deviceSessions.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400 py-4">{i18n.t('settings:security.noDeviceData')}</p>
                        ) : (
                            <div className="space-y-2">
                                {settings.deviceSessions.map(session => {
                                    const DeviceIcon = session.device.startsWith('Mobile') ? Smartphone
                                        : session.device.startsWith('Tablet') ? Tablet
                                            : Monitor;
                                    return (
                                        <div key={session.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0">
                                                <DeviceIcon size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{session.device}</p>
                                                <div className="flex flex-col gap-0.5 text-xs text-slate-500 mt-0.5">
                                                    <span className="flex items-center gap-1">
                                                        <Globe size={11} className="shrink-0" />
                                                        <span className="truncate">{session.ipAddress}</span>
                                                    </span>
                                                    <span className="text-slate-400">{formatDate(session.lastLoginAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Login History Modal */}
            {showHistoryModal && (
                <LoginHistoryModal
                    settings={settings}
                    onClose={() => setShowHistoryModal(false)}
                />
            )}
        </>
    );
};
