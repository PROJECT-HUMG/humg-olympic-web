import { useState, type ReactNode } from 'react';
import { Header } from './Header';
import { AppSidebar } from './AppSidebar';
import { BottomNav } from './BottomNav';
import { Background } from '../ui/Background';
import { ScrollToTop } from '../ui/ScrollToTop';

interface ProtectedLayoutProps {
  children: ReactNode;
  afterContent?: ReactNode;
}

export const ProtectedLayout = ({ children, afterContent }: ProtectedLayoutProps) => {
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('humg_sidebar_pinned') === 'true';
  });
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const isSidebarExpanded = isSidebarPinned || isSidebarHovered;

  const handleToggleSidebarPin = () => {
    setIsSidebarPinned((prev) => {
      const next = !prev;
      localStorage.setItem('humg_sidebar_pinned', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-600 dark:text-slate-300 relative transition-colors duration-300">
      <Background />
      <Header />
      <AppSidebar
        isPinned={isSidebarPinned}
        isExpanded={isSidebarExpanded}
        onTogglePin={handleToggleSidebarPin}
        onHoverChange={setIsSidebarHovered}
      />
      <main className={`grow relative pb-16 lg:pb-0 transition-[padding] duration-300 ${isSidebarPinned ? 'lg:pl-[19rem]' : 'lg:pl-[7.5rem]'}`}>
        {children}
      </main>
      <ScrollToTop />
      <BottomNav />
      {afterContent}
    </div>
  );
};
