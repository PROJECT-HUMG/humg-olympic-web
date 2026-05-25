import { useState, useRef, useEffect } from 'react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import i18n from '@/i18n';

const getFaqs = () => [
    { id: 1, question: i18n.t('features:landing.faq.q1'), answer: i18n.t('features:landing.faq.a1') },
    { id: 2, question: i18n.t('features:landing.faq.q2'), answer: i18n.t('features:landing.faq.a2') },
    { id: 3, question: i18n.t('features:landing.faq.q3'), answer: i18n.t('features:landing.faq.a3') },
    { id: 4, question: i18n.t('features:landing.faq.q4'), answer: i18n.t('features:landing.faq.a4') },
    { id: 5, question: i18n.t('features:landing.faq.q5'), answer: i18n.t('features:landing.faq.a5') },
    { id: 6, question: i18n.t('features:landing.faq.q6'), answer: i18n.t('features:landing.faq.a6') },
];

interface FAQItemProps {
    item: ReturnType<typeof getFaqs>[0];
    isOpen: boolean;
    onClick: () => void;
}

const FAQItem = ({ item, isOpen, onClick }: FAQItemProps) => {
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className={`border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors duration-200 ${isOpen ? 'bg-blue-50/30 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'}`}
        >
            <button
                className="flex items-center justify-between w-full p-5 md:p-6 text-left focus:outline-none group"
                onClick={onClick}
            >
                <span className={`text-base md:text-lg font-bold transition-colors ${isOpen ? 'text-humg-blue dark:text-blue-400' : 'text-slate-800 dark:text-slate-200 group-hover:text-humg-blue dark:group-hover:text-blue-400'}`}>
                    {item.question}
                </span>
                <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-blue-100 text-humg-blue dark:bg-blue-900/40 dark:text-blue-400 rotate-180' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-slate-700'}`}>
                    <ChevronDown size={18} />
                </div>
            </button>

            {/* CSS grid-rows transition — no AnimatePresence */}
            <div
                className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.04,0.62,0.23,0.98)]"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
                <div ref={contentRef} className="overflow-hidden">
                    <div className="px-5 md:px-6 pb-5 md:pb-6 text-slate-600 dark:text-slate-400 leading-relaxed text-[15px] md:text-base">
                        {item.answer}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
            { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={containerRef} className="py-20 md:py-28 relative overflow-hidden bg-transparent">

            <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-4xl">
                {/* Header — CSS transition */}
                <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-humg-blue dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <MessageCircleQuestion size={32} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {i18n.t('features:landing.faq.sectionTitle')}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        {i18n.t('features:landing.faq.sectionSubtitle')}
                    </p>
                </div>

                {/* FAQ List — CSS stagger */}
                <div className="space-y-4">
                    {getFaqs().map((item, index) => (
                        <div
                            key={item.id}
                            className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                            style={{ transitionDelay: isVisible ? `${300 + index * 80}ms` : '0ms' }}
                        >
                            <FAQItem
                                item={item}
                                isOpen={openIndex === index}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
