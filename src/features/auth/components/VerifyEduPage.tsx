import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { authRepository } from '@/features/auth/api';
import { AuthBanner } from './views/AuthBanner';
import { Logo } from '../../../components/ui/Logo';
import i18n from '@/i18n';

export const VerifyEduPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'pending' | 'loading' | 'success' | 'error'>(!token ? 'error' : 'pending');
    const [errorMessage, setErrorMessage] = useState<string>(!token ? i18n.t('auth:verifyEduPage.missingToken') : '');

    const handleVerify = async () => {
        if (!token) {
            setStatus('error');
            setErrorMessage(i18n.t('auth:verifyEduPage.missingToken'));
            return;
        }

        setStatus('loading');
        try {
            await authRepository.verifyEdu(token);
            setStatus('success');
        } catch (e: unknown) {
            setStatus('error');
            setErrorMessage(e instanceof Error ? e.message : i18n.t('auth:verifyEduPage.verifyFailed'));
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-humg-dark font-sans transition-colors duration-300">
            <AuthBanner />
            <div className="flex-1 flex flex-col relative w-full bg-white dark:bg-humg-dark">
                <div className="absolute top-6 left-6 z-20">
                    <button
                        onClick={() => navigate('/login')}
                        className="p-2.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-2"
                    >
                        {i18n.t('auth:verifyEduPage.login')}
                    </button>
                </div>
                <div className="flex-grow flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
                    <div className="w-full max-w-md flex flex-col py-10 lg:py-0">
                        <div className="lg:hidden flex flex-col items-center mb-8">
                            <Logo className="h-12 mb-4" />
                        </div>
                        {status === 'pending' && (
                            <div className="flex flex-col items-center animate-fade-in-up">
                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                                    <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('auth:verifyEduPage.pendingTitle')}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-center mb-8 max-w-sm">
                                    {i18n.t('auth:verifyEduPage.pendingDesc')}
                                </p>
                                <button
                                    onClick={handleVerify}
                                    className="px-8 py-3 bg-humg-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                >
                                    {i18n.t('auth:verifyEduPage.confirmEdu')}
                                </button>
                            </div>
                        )}
                        {status === 'loading' && (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-16 h-16 text-humg-blue animate-spin mb-4" />
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{i18n.t('auth:verifyPage.verifying')}</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">{i18n.t('auth:verifyPage.pleaseWait')}</p>
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="flex flex-col items-center animate-fade-in-up">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('auth:verifyPage.successTitle')}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
                                    {i18n.t('auth:verifyEduPage.successDesc')}
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-8 py-3 bg-humg-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                >
                                    {i18n.t('auth:verifyEduPage.loginGoogle')}
                                </button>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="flex flex-col items-center animate-fade-in-up">
                                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{i18n.t('auth:verifyEduPage.errorTitle')}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-center mb-6">{errorMessage}</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-8 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    {i18n.t('auth:verifyEduPage.goToLogin')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
