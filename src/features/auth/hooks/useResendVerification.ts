
import { useState, useEffect, useTransition } from 'react';
import { authRepository } from '@/features/auth/api';
import { showToast } from '@/components/ui/Toast';
import { extractErrorMessage } from '@/utils/errorUtils';
import i18n from '@/i18n';

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

export const useResendVerification = (email: string, type: 'register' | 'forgot_password') => {
    const [isLoading, startTransition] = useTransition();
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [countdown]);

    const handleResend = () => {
        if (countdown > 0 || isLoading) return;

        startTransition(async () => {
            try {
                if (type === 'register') {
                    await authRepository.resendVerification(email);
                    showToast(t('auth:resend.verificationSent'), 'success');
                } else {

                    await authRepository.forgotPassword({ email });
                    showToast(t('auth:resend.resetLinkSent'), 'success');
                }
                setCountdown(30);
            } catch (error: unknown) {
                if (type === 'register') {
                    showToast(t('auth:resend.verificationFailed'), 'error');
                } else {
                    const errorMsg = extractErrorMessage(error);
                    showToast(t('auth:resend.resetCooldown', { msg: errorMsg }), 'error');
                }
            }
        });
    };

    return {
        handleResend,
        isLoading,
        countdown,
        isCooldown: countdown > 0
    };
};
