import { KeyRound, Mail, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { InputField } from '../Fields';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';
import i18n from '@/i18n';

interface ForgotPasswordViewProps {

    onBackToLogin: () => void;
    onSuccess: (email: string) => void;
}

export const ForgotPasswordView = ({
    onBackToLogin,
    onSuccess
}: ForgotPasswordViewProps) => {

    const { email, setEmail, isLoading, error, handleSubmit } = useForgotPassword();

    return (
        <div className="w-full animate-fade-in-up">
            <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <KeyRound className="w-10 h-10 text-humg-blue dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                    {i18n.t('auth:forgotPasswordView.title')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    {i18n.t('auth:forgotPasswordView.subtitle')}
                </p>
            </div>

            <form className="space-y-5" onSubmit={(e) => handleSubmit(e, () => onSuccess(email))}>
                <InputField
                    type="email"
                    placeholder={i18n.t('auth:forgotPasswordView.emailPlaceholder')}
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!error}
                />

                {error && (
                    <div className="flex items-start gap-2 text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-lg animate-pulse">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl bg-humg-blue hover:bg-blue-700 text-white font-bold text-lg shadow-md shadow-humg-blue/20 transform active:scale-[0.98] transition-colors duration-300 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            {i18n.t('auth:forgotPasswordView.sending')}
                        </>
                    ) : (
                        i18n.t('auth:forgotPasswordView.submitButton')
                    )}
                </button>
            </form>

            <div className="mt-10 text-center">
                <button
                    onClick={onBackToLogin}
                    className="flex items-center justify-center gap-2 text-slate-500 hover:text-humg-blue dark:hover:text-blue-400 transition-colors mx-auto font-medium"
                >
                    <ArrowLeft size={18} />
                    {i18n.t('auth:forgotPasswordView.backToLogin')}
                </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-16">
                © 2026 Olympic HUMG. All rights reserved.
            </p>
        </div>
    );
};
