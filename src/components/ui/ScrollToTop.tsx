import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import i18n from '@/i18n';

export const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setIsVisible(window.scrollY > 300);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-20 lg:bottom-6 left-6 z-40 w-11 h-11 rounded-full
                bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                shadow-lg hover:shadow-xl
                flex items-center justify-center
                text-slate-500 dark:text-slate-400 hover:text-humg-blue dark:hover:text-blue-400
                transition-all duration-300
                ${isVisible
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
            aria-label={i18n.t('common:scrollToTop')}
            title={i18n.t('common:scrollToTop')}
        >
            <ArrowUp size={20} />
        </button>
    );
};
