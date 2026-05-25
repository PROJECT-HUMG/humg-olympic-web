
import { useState, useTransition, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { extractErrorMessage } from '@/utils/errorUtils';

// Define the state shape for the action
interface LoginState {
  error?: string | null;
  success?: boolean;
}

export const useLoginForm = (onSuccess: () => void) => {
  const { login } = useAuth();
  const [state, setState] = useState<LoginState | null>(null);
  const [isPending, startTransition] = useTransition();

  const formAction = useCallback((formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setState({ error: i18n.t('auth:loginMissingFields') });
      return;
    }

    if (password.length < 8) {
      setState({ error: i18n.t('auth:loginPasswordMinLength') });
      return;
    }

    startTransition(async () => {
      try {
        await login(email, password);
        toast.success(i18n.t('auth:loginSuccess'));
        setState({ success: true, error: null });
        onSuccess();
      } catch (err: unknown) {
        const message = extractErrorMessage(err, i18n.t('auth:loginFailed'));
        toast.error(message);
        setState({ error: message, success: false });
      }
    });
  }, [login, onSuccess, startTransition]);

  return {
    state,
    formAction,
    isPending,
  };
};