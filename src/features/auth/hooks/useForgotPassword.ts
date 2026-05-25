
import { useState, useTransition } from 'react';
import { authRepository } from '@/features/auth/api';
import { showToast } from '@/components/ui/Toast';
import { AuthValidation } from '@/utils/validation';
import { extractErrorMessage, extractErrorStatus } from '@/utils/errorUtils';
import i18n from '@/i18n';

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

export const useForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const validate = (): boolean => {
        if (!email) {
            setError(t('auth:forgotPassword.enterEmail'));
            return false;
        }
        if (!AuthValidation.isValidEmail(email)) {
            setError(t('auth:forgotPassword.invalidEmail'));
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent, onSuccess?: () => void) => {
        e.preventDefault();
        setError(null);

        if (!validate()) return;

        startTransition(async () => {
            try {
                await authRepository.forgotPassword({ email });
                showToast(t('auth:forgotPassword.success'), 'success');

                if (onSuccess) {
                    onSuccess();
                }
            } catch (err: unknown) {
                let displayMessage = extractErrorMessage(err);

                const status = extractErrorStatus(err);
                if (status === 429) {
                    const minutes = extractErrorMessage(err);
                    displayMessage = t('auth:forgotPassword.rateLimited', { minutes });
                }

                else if (status === 404) {
                    displayMessage = t('auth:forgotPassword.notRegistered');
                }

                setError(displayMessage);
                showToast(displayMessage, 'error');
            }
        });
    };

    return {
        email,
        setEmail,
        isLoading,
        error,
        handleSubmit
    };
};
