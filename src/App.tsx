import '@/i18n';
import { useEffect, useState, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { QueryProvider } from '@/components/QueryProvider';
import { SimpleToaster, showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { appRoutes } from '@/routes/appRoutes';

declare global {
  interface Window {
    __splashFinish?: () => void;
  }
}

function AppLogicWrapper({ children }: { children: ReactNode }) {
  const { logout } = useAuth();

  useEffect(() => {
    const handleSessionExpired = async () => {
      showToast(i18n.t('common:sessionExpired'), 'error');
      await logout();
    };

    window.addEventListener('auth:logout', handleSessionExpired);
    return () => window.removeEventListener('auth:logout', handleSessionExpired);
  }, [logout]);

  return <>{children}</>;
}

const router = createBrowserRouter(appRoutes);

export default function App() {
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    window.__splashFinish?.();
  }, []);

  {/* ── Re-render entire tree when language changes ── */ }
  useEffect(() => {
    const onLangChange = (lng: string) => setLang(lng);
    i18n.on('languageChanged', onLangChange);
    return () => { i18n.off('languageChanged', onLangChange); };
  }, []);

  return (
    <QueryProvider>
      <AuthProvider>
        <AppLogicWrapper>
          <SimpleToaster />
          <RouterProvider key={lang} router={router} />
        </AppLogicWrapper>
      </AuthProvider>
    </QueryProvider>
  );
}