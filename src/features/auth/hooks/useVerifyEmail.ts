import { useState, useCallback, useTransition } from 'react';
import { authRepository } from '@/features/auth/api';
import { showToast } from '@/components/ui/Toast';
import { AuthValidation } from '@/utils/validation';
import { extractErrorMessage, extractErrorCode } from '@/utils/errorUtils';
import i18n from '@/i18n';

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

type VerificationStatus = 'pending' | 'loading' | 'success' | 'error';

export const useVerifyEmail = (token: string | null, onNavigateToLogin: () => void) => {
    const [status, setStatus] = useState<VerificationStatus>(!token ? 'error' : 'pending');
    const [errorCode, setErrorCode] = useState<string | null>(!token ? 'INVALID_ACCESS_TOKEN' : null);
    const [emailForResend, setEmailForResend] = useState('');
    const [isResending, startResendTransition] = useTransition();

    const handleVerify = useCallback(async () => {
        if (!token) {
            setStatus('error');
            setErrorCode('INVALID_ACCESS_TOKEN');
            return;
        }

        setStatus('loading');
        try {
            await authRepository.verifyAccount(token);
            const delay = 3;
            setStatus('success');
            showToast(t('auth:verify.success', { delay }), 'success');

            setTimeout(() => {
                onNavigateToLogin();
            }, delay * 1000);
        } catch (err: unknown) {
            setStatus('error');
            setErrorCode(extractErrorCode(err) || 'UNKNOWN_ERROR');
        }
    }, [token, onNavigateToLogin]);

    const handleResend = () => {
        if (!emailForResend) {
            showToast(t('auth:verify.enterEmail'), 'error');
            return;
        }
        if (!AuthValidation.isValidEmail(emailForResend)) {
            showToast(t('auth:verify.invalidEmail'), 'error');
            return;
        }

        startResendTransition(async () => {
            try {
                const response = await authRepository.resendVerification(emailForResend);
                showToast(response.message || t('auth:verify.resendSuccess'), 'success');
            } catch (err: unknown) {
                showToast(extractErrorMessage(err), 'error');
            }
        });
    };

    return {
        status,
        errorCode,
        emailForResend,
        setEmailForResend,
        handleResend,
        handleVerify,
        isResending
    };
};