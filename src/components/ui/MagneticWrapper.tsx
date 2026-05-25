import { useRef, type ReactNode, type MouseEvent } from 'react';

interface MagneticWrapperProps {
    children: ReactNode;
    className?: string;
    strength?: number;
}

export const MagneticWrapper = ({
    children,
    className = "",
    strength = 15
}: MagneticWrapperProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleMouse = (e: MouseEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el) return;
        const { height, width, left, top } = el.getBoundingClientRect();

        const middleX = e.clientX - (left + width / 2);
        const middleY = e.clientY - (top + height / 2);

        const x = (middleX / width) * strength;
        const y = (middleY / height) * strength;

        el.style.transform = `translate(${x}px, ${y}px)`;
    };

    const reset = () => {
        const el = ref.current;
        if (!el) return;
        el.style.transform = 'translate(0px, 0px)';
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            className={className}
            style={{ transition: 'transform 0.15s ease-out' }}
        >
            {children}
        </div>
    );
};
