import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Background } from '../ui/Background';
import { ScrollToTop } from '../ui/ScrollToTop';

interface PublicLayoutProps {
  children: ReactNode;
  afterContent?: ReactNode;
}

export const PublicLayout = ({ children, afterContent }: PublicLayoutProps) => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }

    const timer = window.setTimeout(() => {
      const element = document.getElementById(hash.replace('#', ''));
      element?.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', pathname);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-600 dark:text-slate-300 relative transition-colors duration-300">
      <Background />
      <Header />
      <main className="grow relative">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
      {afterContent}
    </div>
  );
};
