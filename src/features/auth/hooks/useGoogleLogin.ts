import { useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api/apiConfig';

const REDIRECT_LOGIN_URI = (() => {
  const baseUrl = API_BASE_URL.startsWith('http') ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
  return `${baseUrl}/oauth2/authorization/google`;
})();

// #7 fix: removed unused `onCredential` parameter
export function useGoogleLogin() {
  const triggerLogin = useCallback(() => {
    window.location.href = REDIRECT_LOGIN_URI;
  }, []);

  // No-op ref callback — redirect flow doesn't need a button ref
  const setRef = useCallback((_node: HTMLDivElement | null) => { }, []);

  return {
    googleButtonRef: setRef,
    triggerLogin,
    isConfigLoading: false,
    configError: null,
  };
}
