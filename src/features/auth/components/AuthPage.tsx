import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { AuthBanner } from './views/AuthBanner';
import {
    LoginView,
    RegisterView,
    ForgotPasswordView,
    CheckEmailView,
    GoogleCompleteView,
    GoogleEduVerifyView
} from './views/screens';
import { useAuth } from '../../../contexts/AuthContext';
import { useLoginForm } from '../hooks/useLoginForm';
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { showToast } from '../../../components/ui/Toast';
import i18n from '@/i18n';
import { authRepository } from '@/features/auth/api';
import { AuthView } from '../types/auth.types';

// Helper to decode Base64Url
// Helper to decode Base64Url with UTF-8 support
function decodeAuthResponse(authResponseParam: string) {
    const base64 = authResponseParam.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    // Properly decode UTF-8 string from Base64
    const json = decodeURIComponent(atob(padded).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
}

interface AuthPageProps {
    onLoginSuccess?: () => void;
    initialView: AuthView;
}

type GoogleFlow =
    | { step: 'complete'; tempToken: string; requiredFields: { universityId: boolean; facultyId: boolean; className: boolean }; primaryUniversityId?: number }
    | { step: 'edu'; tempAccessToken?: string };

export const AuthPage = ({ onLoginSuccess, initialView }: AuthPageProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { loginWithGoogle, completeGoogleSignup, requestEduVerify, setUserFromAuthResponse, setUser } = useAuth();
    const [googleFlow, setGoogleFlow] = useState<GoogleFlow | null>(null);
    const processedRef = useRef(false);

    const locationState = location.state as { email?: string; type?: 'register' | 'forgot_password'; from?: { pathname: string; search?: string } } | null;
    const pendingEmail = locationState?.email || '';
    const emailType = locationState?.type || 'register';
    const redirectTo = locationState?.from ? `${locationState.from.pathname}${locationState.from.search || ''}` : '/';

    const onGoogleCredential = useCallback(async (idToken: string) => {
        try {
            const result = await loginWithGoogle(idToken);
            if ('success' in result && result.success) {
                localStorage.setItem('last_auth_provider', 'google');
                showToast(i18n.t('auth:loginSuccess'), 'success');
                if (onLoginSuccess) onLoginSuccess();
                navigate(redirectTo, { replace: true });
                return;
            }
            if ('needsCompletion' in result && result.needsCompletion) {
                setGoogleFlow({
                    step: 'complete',
                    tempToken: result.tempToken,
                    requiredFields: result.requiredFields,
                    primaryUniversityId: result.primaryUniversityId,
                });
            }
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : i18n.t('auth:loginGoogleFailed'), 'error');
        }
    }, [loginWithGoogle, navigate, onLoginSuccess]);

    const googleLoginUI = useGoogleLogin();

    const handleLoginSuccess = () => {
        if (onLoginSuccess) onLoginSuccess();
        navigate(redirectTo, { replace: true });
    };

    const handleRegisterSuccess = (email: string) => {
        navigate('/check-email', {
            state: { email, type: 'register' }
        });
    };

    const handleForgotPasswordSuccess = (email: string) => {
        navigate('/check-email', {
            state: { email, type: 'forgot_password' }
        });
    };

    const handleBackClick = () => {
        navigate('/');
    };

    const loginLogic = useLoginForm(handleLoginSuccess);

    // Initial check for Google Redirect Flow
    useEffect(() => {
        // Guard: prevent re-running session-clearing logic when auth context
        // changes (e.g. after completeGoogleSignup updates user/token state,
        // setUserFromAuthResponse gets a new reference → this effect re-fires).
        if (initialView === 'google_complete') {
            if (processedRef.current) return;
            const token = searchParams.get('tempToken');
            if (token) {
                processedRef.current = true;
                // Clear any existing session to prevent conflicts
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                if (window.location.pathname.includes('/auth/')) {
                    if (setUser) setUser(null);
                }
                authRepository.getAuthConfig().then(cfg => {
                    setGoogleFlow({
                        step: 'complete',
                        tempToken: token,
                        requiredFields: { universityId: true, facultyId: false, className: false },
                        primaryUniversityId: cfg.primaryUniversityId ?? undefined
                    });
                });
            } else {
                navigate('/login');
            }
        } else if (initialView === 'google_edu') {
            if (processedRef.current) return;
            const token = searchParams.get('accessToken');
            if (token) {
                processedRef.current = true;
                // Clear any existing session to prevent conflicts
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                if (window.location.pathname.includes('/auth/')) {
                    if (setUser) setUser(null);
                }
                setGoogleFlow({ step: 'edu', tempAccessToken: token });
            } else {
                navigate('/login');
            }
        } else if (initialView === 'google_callback') {
            const authResponseParam = searchParams.get('authResponse');
            const needsEdu = searchParams.get('needsEduVerification') === 'true';

            if (authResponseParam) {
                if (processedRef.current) return;
                processedRef.current = true;

                try {
                    const authResponse = decodeAuthResponse(authResponseParam);

                    if (needsEdu) {
                        // Clear session if any
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('user');
                        if (setUser) setUser(null);

                        setGoogleFlow({ step: 'edu', tempAccessToken: authResponse.accessToken });
                    } else {
                        setUserFromAuthResponse(authResponse).then(() => {
                            localStorage.setItem('last_auth_provider', 'google');
                            showToast(i18n.t('auth:loginSuccessShort'), 'success');
                            if (onLoginSuccess) onLoginSuccess();
                            navigate('/');
                        }).catch(err => {
                            showToast(i18n.t('auth:loginResponseError'), 'error');
                            navigate('/login');
                        });
                    }
                } catch (e) {
                    showToast(i18n.t('auth:loginInvalidData'), 'error');
                    navigate('/login');
                }
            } else {
                navigate('/login');
            }
        } else {
            // Reset Google flow state when navigating to standard views
            setGoogleFlow(null);
            processedRef.current = false;
        }
    }, [initialView, searchParams, navigate, setUserFromAuthResponse, onLoginSuccess]);

    const renderContent = () => {
        switch (initialView) {
            case 'login':
            case 'google_complete':
            case 'google_edu':
            case 'google_callback':
                if (googleFlow?.step === 'complete') {
                    return (
                        <GoogleCompleteView
                            tempToken={googleFlow.tempToken}
                            primaryUniversityId={googleFlow.primaryUniversityId}
                            onSubmit={async (data) => {
                                const result = await completeGoogleSignup(data);
                                if ('success' in result && result.success) {
                                    showToast(i18n.t('auth:registerComplete'), 'success');
                                    setGoogleFlow(null);
                                    if (onLoginSuccess) onLoginSuccess();
                                    navigate('/');
                                    return;
                                }
                                if ('needsEduVerification' in result && result.needsEduVerification) {
                                    setGoogleFlow({ step: 'edu', tempAccessToken: result.accessToken });
                                }
                            }}
                            onBack={() => navigate('/login')}
                        />
                    );
                }
                if (googleFlow?.step === 'edu') {
                    return (
                        <GoogleEduVerifyView
                            onSubmit={async (eduEmail) => {
                                await requestEduVerify(eduEmail, googleFlow.tempAccessToken);
                                showToast(i18n.t('auth:eduVerifySent'), 'success');
                            }}
                            onSuccess={() => {
                                setGoogleFlow(null);
                                navigate('/');
                            }}
                        />
                    );
                }

                if (initialView === 'google_complete' || initialView === 'google_edu' || initialView === 'google_callback') return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-humg-blue border-t-transparent" /></div>;

                return (
                    <LoginView
                        formAction={loginLogic.formAction}
                        isPending={loginLogic.isPending}
                        error={loginLogic.state?.error}
                        onForgotPassword={() => navigate('/forgot-password')}
                        onRegister={() => navigate('/register')}
                        googleButtonRef={googleLoginUI.googleButtonRef}
                        onGoogleClick={googleLoginUI.triggerLogin}
                        isGoogleConfigLoading={googleLoginUI.isConfigLoading}
                        googleConfigError={googleLoginUI.configError}
                    />
                );

            case 'register':
                return (
                    <RegisterView
                        onSuccess={handleRegisterSuccess}
                        onGoLogin={() => navigate('/login')}
                    />
                );

            case 'forgot_password':
                return (
                    <ForgotPasswordView
                        onSuccess={handleForgotPasswordSuccess}
                        onBackToLogin={() => navigate('/login')}
                    />
                );

            case 'check_email':
                return (
                    <CheckEmailView
                        email={pendingEmail}
                        type={emailType}
                        onCancel={() => navigate('/login')}
                    />
                );

            default:
                return <div>404 - View not found</div>;
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-humg-dark font-sans transition-colors duration-300">
            <AuthBanner />

            <div className="flex-1 flex flex-col relative w-full bg-white dark:bg-humg-dark">
                {initialView !== 'check_email' && (
                    <div className="absolute top-6 left-6 z-20">
                        <button
                            onClick={handleBackClick}
                            className="p-2.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-2 group backdrop-blur-sm"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium hidden sm:inline">{i18n.t('auth:authPage.backToHome')}</span>
                        </button>
                    </div>
                )}

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