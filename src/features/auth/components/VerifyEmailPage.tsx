import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowLeft, RefreshCw, Mail } from 'lucide-react';
import { useVerifyEmail } from '@/features/auth/hooks/useVerifyEmail';
import { AuthBanner } from './views/AuthBanner';
import { Logo } from '../../../components/ui/Logo';
import { InputField } from './views/Fields';
import i18n from '@/i18n';

export const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const {
        status,
        errorCode,
        emailForResend,
        setEmailForResend,
        handleResend,
        handleVerify,
        isResending
    } = useVerifyEmail(token, () => navigate('/login'));

    const renderContent = () => {
        if (status === 'pending') {
            return (
                <div className="flex flex-col items-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                        <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('auth:verifyPage.pendingTitle')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center mb-8 max-w-sm">
                        {i18n.t('auth:verifyPage.pendingDesc')}
                    </p>
                    <button
                        onClick={handleVerify}
                        className="px-8 py-3 bg-humg-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-humg-blue/20"
                    >
                        {i18n.t('auth:verifyPage.confirmEmail')}
                    </button>
                </div>
            );
        }

        if (status === 'loading') {
            return (
                <div className="flex flex-col items-center">
                    <Loader2 className="w-16 h-16 text-humg-blue animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{i18n.t('auth:verifyPage.verifying')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{i18n.t('auth:verifyPage.pleaseWait')}</p>
                </div>
            );
        }

        if (status === 'success') {
            return (
                <div className="flex flex-col items-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('auth:verifyPage.successTitle')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
                        {i18n.t('auth:verifyPage.successDesc')}
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-3 bg-humg-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-humg-blue/20"
                    >
                        {i18n.t('auth:verifyPage.loginNow')}
                    </button>
                </div>
            );
        }

        if (status === 'error') {
            const isExpired = errorCode === 'ACCESS_TOKEN_EXPIRED';

            return (
                <div className="flex flex-col items-center animate-fade-in-up w-full">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {isExpired ? i18n.t('auth:verifyPage.linkExpired') : i18n.t('auth:verifyPage.verifyFailed')}
                    </h3>

                    <p className="text-slate-500 dark:text-slate-400 text-center mb-8 max-w-xs">
                        {isExpired
                            ? i18n.t('auth:verifyPage.expiredDesc')
                            : i18n.t('auth:verifyPage.invalidLink')}
                    </p>

                    {isExpired ? (
                        <div className="w-full space-y-4">
                            <InputField
                                type="email"
                                placeholder={i18n.t('auth:forgotPasswordView.emailPlaceholder')}
                                icon={Mail}
                                value={emailForResend}
                                onChange={(e) => setEmailForResend(e.target.value)}
                            />
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="w-full py-3 bg-humg-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-humg-blue/20 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isResending ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                                {i18n.t('auth:verifyPage.resendCode')}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            {i18n.t('auth:verifyPage.backToLogin')}
                        </button>
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-humg-dark font-sans transition-colors duration-300">
            <AuthBanner />

            <div className="flex-1 flex flex-col relative w-full bg-white dark:bg-humg-dark">
                <div className="absolute top-6 left-6 z-20">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-2 group backdrop-blur-sm"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium hidden sm:inline">{i18n.t('auth:verifyPage.home')}</span>
                    </button>
                </div>

                <div className="flex-grow flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
                    <div className="w-full max-w-md flex flex-col py-10 lg:py-0">
                        <div className="lg:hidden flex flex-col items-center mb-8">
                            <Logo className="h-12 mb-4" />
                        </div>

                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};