
import { useState, useRef, useEffect, useTransition, type FormEvent } from 'react';
import { authRepository } from '@/features/auth/api';
import { showToast } from '@/components/ui/Toast';
import { AuthValidation } from '@/utils/validation';
import { extractErrorMessage, extractErrorCode } from '@/utils/errorUtils';
import i18n from '@/i18n';

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

export const useResetPassword = (token: string | null, onNavigateToLogin: () => void, onNavigateToForgot: () => void) => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
        };
    }, []);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const validate = (): boolean => {
        if (!token) {
            setError(t('auth:resetPassword.invalidToken'));
            return false;
        }
        if (!AuthValidation.isValidPassword(formData.newPassword)) {
            setError(t('auth:resetPassword.minLength'));
            return false;
        }
        if (!AuthValidation.doPasswordsMatch(formData.newPassword, formData.confirmPassword)) {
            setError(t('auth:resetPassword.mismatch'));
            return false;
        }
        return true;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validate()) return;

        startTransition(async () => {
            try {
                await authRepository.resetPassword({
                    token: token!,
                    newPassword: formData.newPassword
                });
                const delay = 3;
                showToast(t('auth:resetPassword.success', { delay }), 'success');
                redirectTimerRef.current = setTimeout(onNavigateToLogin, delay * 1000);
            } catch (err: unknown) {
                setError(extractErrorMessage(err));
                if (extractErrorCode(err) === 'TOKEN_EXPIRED') {
                    showToast(t('auth:resetPassword.tokenExpired'), 'error');
                    redirectTimerRef.current = setTimeout(onNavigateToForgot, 1000);
                }
            }
        });
    };

    return {
        formData,
        isLoading,
        error,
        handleChange,
        handleSubmit
    };
};