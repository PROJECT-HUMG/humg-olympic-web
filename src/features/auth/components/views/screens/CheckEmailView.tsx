
import { Mail, ArrowRight, RotateCcw, X, Loader2 } from 'lucide-react';
import { getMailProviderInfo } from '@/utils/emailHelpers';
import { useResendVerification } from '@/features/auth/hooks/useResendVerification';
import i18n from '@/i18n';

interface CheckEmailViewProps {
    email: string;
    type: 'register' | 'forgot_password';
    onCancel: () => void;
}

export const CheckEmailView = ({ email, type, onCancel }: CheckEmailViewProps) => {
    const { label: providerName, url: providerUrl, colorClass } = getMailProviderInfo(email);
    const { handleResend, isLoading, countdown, isCooldown } = useResendVerification(email, type);

    const isRegister = type === 'register';

    return (
        <div className="w-full animate-fade-in-up flex flex-col items-center">
            {/* Icon Wrapper */}
            <div className="w-24 h-24 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 shadow-inner relative">
                <div className="absolute inset-0 rounded-full border border-blue-100 dark:border-slate-700 animate-pulse-slow"></div>
                <Mail className="w-12 h-12 text-humg-blue dark:text-blue-400" />
                {/* Notification dot */}
                <div className="absolute top-1 right-2 w-5 h-5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
            </div>

            {/* Content */}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 text-center">
                {isRegister ? i18n.t('auth:checkEmail.titleRegister') : i18n.t('auth:checkEmail.titleForgot')}
            </h2>

            <div className="text-slate-500 dark:text-slate-400 text-center text-base mb-10 max-w-sm leading-relaxed">
                <p>
                    {isRegister
                        ? i18n.t('auth:checkEmail.sentRegister')
                        : i18n.t('auth:checkEmail.sentForgot')}
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200 my-1">{email}</p>
                <p>
                    {isRegister
                        ? i18n.t('auth:checkEmail.hintRegister')
                        : i18n.t('auth:checkEmail.hintForgot')}
                </p>
            </div>

            {/* Actions */}
            <div className="w-full space-y-3">
                {/* Main CTA: Go to Mail */}
                <a
                    href={providerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3.5 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-colors duration-300 ${colorClass}`}
                >
                    {i18n.t('auth:checkEmail.goToProvider', { provider: providerName })}
                    <ArrowRight size={20} />
                </a>

                {/* Secondary Actions Row */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        className="py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={18} /> {isRegister ? i18n.t('common:cancel') : i18n.t('common:back')}
                    </button>

                    <button
                        onClick={handleResend}
                        disabled={isCooldown || isLoading}
                        className={`py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold transition-colors flex items-center justify-center gap-2
                            ${isCooldown
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                : 'text-humg-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <RotateCcw size={18} className={isCooldown ? '' : 'group-hover:rotate-180 transition-transform'} />
                        )}
                        {isCooldown ? i18n.t('auth:checkEmail.resendCountdown', { seconds: countdown }) : i18n.t('auth:checkEmail.resendEmail')}
                    </button>
                </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-8">
                {i18n.t('auth:checkEmail.spamHint')}
            </p>
        </div>
    );
};
