import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { InputField } from './views/Fields';
import { useResetPassword } from '@/features/auth/hooks/useResetPassword';
import { AuthBanner } from './views/AuthBanner';
import { Logo } from '../../../components/ui/Logo';
import i18n from '@/i18n';



export const ResetPasswordPage = () => {
    const navigate = useNavigate();


    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');


    const {
        formData,
        isLoading,
        error,
        handleChange,
        handleSubmit
    } = useResetPassword(
        token,
        () => navigate('/login'),
        () => navigate('/forgot-password')
    );

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-humg-dark font-sans transition-colors duration-300">
            {/* Reuse Auth Banner */}
            <AuthBanner />

            <div className="flex-1 flex flex-col relative w-full bg-white dark:bg-humg-dark">
                {/* Back Button */}
                <div className="absolute top-6 left-6 z-20">
                    <button
                        onClick={() => navigate('/login')}
                        className="p-2.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-2 group backdrop-blur-sm"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium hidden sm:inline">{i18n.t('auth:resetPasswordPage.backToLogin')}</span>
                    </button>
                </div>

                <div className="flex-grow flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
                    <div className="w-full max-w-md flex flex-col py-10 lg:py-0 animate-fade-in-up">

                        {/* Mobile Logo */}
                        <div className="lg:hidden flex flex-col items-center mb-8">
                            <Logo className="h-12 mb-4" />
                        </div>

                        <div className="mb-10 text-center">
                            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Lock className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                                {i18n.t('auth:resetPasswordPage.title')}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-base">
                                {i18n.t('auth:resetPasswordPage.subtitle')}
                            </p>
                        </div>

                        {!token ? (
                            <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                                <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                                <p className="text-red-600 font-bold text-lg mb-1">{i18n.t('auth:resetPasswordPage.invalidLink')}</p>
                                <p className="text-slate-600 dark:text-slate-400 text-center text-sm mb-4">
                                    {i18n.t('auth:resetPasswordPage.invalidLinkDesc')}
                                </p>
                                <button
                                    onClick={() => navigate('/forgot-password')}
                                    className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {i18n.t('auth:resetPasswordPage.requestNewLink')}
                                </button>
                            </div>
                        ) : (
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <InputField
                                    type="password"
                                    placeholder={i18n.t('auth:resetPasswordPage.newPasswordPlaceholder')}
                                    icon={Lock}
                                    value={formData.newPassword}
                                    onChange={(e) => handleChange('newPassword', e.target.value)}
                                    error={!!error}
                                />
                                <InputField
                                    type="password"
                                    placeholder={i18n.t('auth:resetPasswordPage.confirmPasswordPlaceholder')}
                                    icon={CheckCircle}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
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
                                            {i18n.t('auth:resetPasswordPage.processing')}
                                        </>
                                    ) : (
                                        i18n.t('auth:resetPasswordPage.submitButton')
                                    )}
                                </button>
                            </form>
                        )}

                        <p className="text-center text-xs text-slate-400 mt-16">
                            © 2026 Olympic HUMG. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};