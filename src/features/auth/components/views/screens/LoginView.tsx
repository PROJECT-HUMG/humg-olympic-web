
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { SocialButton, InputField } from '../Fields';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';

// Update props to use Action pattern
interface LoginViewProps {
    formAction: (formData: FormData) => void;
    isPending: boolean;
    error?: string | null;

    // Removed controlled props: email, password, onChange...
    // Retained navigation/google props
    onForgotPassword: () => void;
    onRegister: () => void;
    googleButtonRef?: (el: HTMLDivElement | null) => void;
    onGoogleClick?: () => void;
    isGoogleConfigLoading?: boolean;
    googleConfigError?: string | null;
}

const LastUsedBadge = () => (
    <div className="absolute -top-3 right-4 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm animate-in fade-in zoom-in duration-300">
        {i18n.t('auth:login.lastUsed')}
    </div>
);

export const LoginView = ({
    formAction,
    isPending,
    error,
    onForgotPassword,
    onRegister,
    googleButtonRef,
    onGoogleClick,
    isGoogleConfigLoading,
    googleConfigError,
}: LoginViewProps) => {
    const lastProvider = typeof window !== 'undefined' ? localStorage.getItem('last_auth_provider') : null;

    return (
        <div className="w-full animate-fade-in-up">
            <div className="mb-8 md:mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                    {i18n.t('auth:login.welcome')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
                    {i18n.t('auth:login.subtitle')}
                </p>
            </div>

            <div className="space-y-4 mb-8">
                {googleButtonRef && (
                    <div className="relative">
                        {lastProvider === 'google' && !isGoogleConfigLoading && <LastUsedBadge />}
                        {isGoogleConfigLoading && (
                            <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm shadow-sm">
                                <Loader2 size={18} className="animate-spin" />
                                {i18n.t('auth:login.loadingGoogle')}
                            </div>
                        )}
                        {!isGoogleConfigLoading && (
                            <>
                                <SocialButton
                                    icon={<img src="/assets/google.svg" alt="Google" className="w-full h-full" />}
                                    label={i18n.t('auth:login.googleButton')}
                                    onClick={googleConfigError ? undefined : onGoogleClick}
                                />
                                <div
                                    ref={googleButtonRef}
                                    className="absolute -left-[9999px] top-0 w-[320px] h-[44px] opacity-0 pointer-events-none"
                                    aria-hidden
                                />
                            </>
                        )}
                        {googleConfigError && (
                            <p className="text-amber-600 dark:text-amber-400 text-xs text-center mt-1">{googleConfigError}</p>
                        )}
                    </div>
                )}

                <div className="relative">
                    {lastProvider === 'microsoft' && <LastUsedBadge />}
                    <SocialButton
                        icon={<img src="/assets/microsoft.svg" alt="Microsoft" className="w-full h-full" />}
                        label={i18n.t('auth:login.microsoftButton')}
                        onClick={() => showToast(i18n.t('auth:featureInDevelopment'), 'info')}
                    />
                </div>
            </div>

            <div className="relative flex items-center gap-4 mb-8">
                <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{i18n.t('auth:login.or')}</span>
                <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700"></div>
            </div>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); formAction(new FormData(e.currentTarget)); }}>
                <InputField
                    name="email"
                    type="text"
                    placeholder={i18n.t('auth:login.emailPlaceholder')}
                    icon={Mail}
                    error={!!error}
                    required
                />
                <InputField
                    name="password"
                    type="password"
                    placeholder={i18n.t('auth:login.passwordPlaceholder')}
                    icon={Lock}
                    error={!!error}
                    required
                />

                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-lg animate-pulse">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <button
                    disabled={isPending}
                    type="submit"
                    className="w-full py-4 rounded-xl bg-humg-blue hover:bg-blue-700 text-white font-bold text-lg shadow-md shadow-humg-blue/20 transform active:scale-[0.98] transition-colors duration-300 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            {i18n.t('auth:login.processing')}
                        </>
                    ) : (
                        i18n.t('auth:login.submitButton')
                    )}
                </button>
            </form>

            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 text-sm font-medium gap-4 sm:gap-0">
                <button
                    onClick={onForgotPassword}
                    className="text-slate-500 hover:text-humg-blue dark:hover:text-blue-400 transition-colors"
                >
                    {i18n.t('auth:login.forgotPassword')}
                </button>
                <button
                    onClick={onRegister}
                    className="text-humg-blue dark:text-blue-400 hover:underline font-bold"
                >
                    {i18n.t('auth:login.register')}
                </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-12 md:mt-16">
                © 2026 Olympic HUMG. All rights reserved.
            </p>
        </div>
    );
};
