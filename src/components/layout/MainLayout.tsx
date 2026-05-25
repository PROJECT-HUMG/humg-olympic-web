import { lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { AppSidebar } from './AppSidebar';
import { Background } from '../ui/Background';
import { PageSkeleton } from '../ui/PageSkeleton';
import { ScrollToTop } from '../ui/ScrollToTop';
import { useAuth } from '@/contexts/AuthContext';

const AIChatWidget = lazy(() => import('../../features/ai/components/AIChatWidget').then(m => ({ default: m.AIChatWidget })));

export const MainLayout = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  // Hide chrome (header, footer, background) on full-screen exam pages
  const isExamTaking = /\/exams\/[^/]+\/take\//.test(pathname);
  const showSidebar = !isExamTaking && isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-600 dark:text-slate-300 relative transition-colors duration-300">

      {!isExamTaking && <Background />}
      {!isExamTaking && <Header />}
      {showSidebar && <AppSidebar />}

      <main className={`grow relative pb-16 lg:pb-0 transition-[padding] duration-300 ${showSidebar ? 'lg:pl-[19rem]' : ''}`}>
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      {!isExamTaking && (
        <div className={`transition-[padding] duration-300 ${showSidebar ? 'lg:pl-[19rem]' : ''}`}>
          <Footer />
        </div>
      )}
      {!isExamTaking && (
        <Suspense fallback={null}>
          <AIChatWidget />
        </Suspense>
      )}
      {!isExamTaking && <ScrollToTop />}
      {!isExamTaking && <BottomNav />}
    </div>
  );
};
