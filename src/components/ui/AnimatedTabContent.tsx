import { type ReactNode, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';

interface AnimatedTabContentProps {
    activeKey: string;
    children: ReactNode;
    transitionName?: string;
}

/**
 * Reusable animated tab content using View Transitions API.
 * Falls back to instant switch on unsupported browsers.
 *
 * Usage:
 *   // In parent: wrap setActiveTab with startTabTransition()
 *   const handleTabChange = (tab: string) => startTabTransition(() => setActiveTab(tab));
 *
 *   <AnimatedTabContent activeKey={activeTab}>
 *       {activeTab === 'a' && <TabA />}
 *       {activeTab === 'b' && <TabB />}
 *   </AnimatedTabContent>
 */
export const AnimatedTabContent = ({
    activeKey,
    children,
    transitionName = 'tab-content',
}: AnimatedTabContentProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.viewTransitionName = transitionName;
        }
    }, [transitionName]);

    return (
        <div key={activeKey} ref={ref}>
            {children}
        </div>
    );
};

/**
 * Wraps a state update with View Transitions API.
 * Falls back to plain execution on unsupported browsers.
 */
export const startTabTransition = (updateFn: () => void) => {
    if (document.startViewTransition) {
        document.startViewTransition(() => {
            flushSync(updateFn);
        });
    } else {
        updateFn();
    }
};
