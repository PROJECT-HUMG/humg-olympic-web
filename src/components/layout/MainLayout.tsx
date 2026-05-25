import { lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PageSkeleton } from '../ui/PageSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { PublicLayout } from './PublicLayout';
import { ProtectedLayout } from './ProtectedLayout';

const AIChatWidget = lazy(() => import('../../features/ai/components/AIChatWidget').then(m => ({ default: m.AIChatWidget })));

const RoutedOutlet = () => (
  <Suspense fallback={<PageSkeleton />}>
    <Outlet />
  </Suspense>
);

const LazyAIWidget = () => (
  <Suspense fallback={null}>
    <AIChatWidget />
  </Suspense>
);

export const MainLayout = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const isExamTaking = /\/exams\/[^/]+\/take\//.test(pathname);

  if (isExamTaking) {
    return (
      <div className="min-h-screen font-sans text-slate-600 dark:text-slate-300 relative transition-colors duration-300">
        <RoutedOutlet />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <ProtectedLayout afterContent={<LazyAIWidget />}>
        <RoutedOutlet />
      </ProtectedLayout>
    );
  }

  return (
    <PublicLayout afterContent={<LazyAIWidget />}>
      <RoutedOutlet />
    </PublicLayout>
  );
};
