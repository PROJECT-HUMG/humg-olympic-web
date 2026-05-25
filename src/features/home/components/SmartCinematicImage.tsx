import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface SmartCinematicImageProps {
    src: string;
    alt: string;
    isActive: boolean;
    className?: string;
    priority?: boolean;
}

export const SmartCinematicImage = ({
    src,
    alt,
    isActive,
    className = "",
    priority = false
}: SmartCinematicImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative overflow-hidden w-full h-full bg-slate-100 dark:bg-slate-800 ${className}`}>

            {/* Skeleton Loading Layer */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 z-10 animate-pulse bg-slate-200 dark:bg-slate-700" />
            )}

            {/* Error Fallback Layer */}
            {hasError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                    <ImageOff size={48} strokeWidth={1} />
                    <span className="text-xs mt-2 font-medium">Image unavailable</span>
                </div>
            )}

            {/* Main Image — CSS transition instead of motion.img */}
            <img
                src={src}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                className={`absolute inset-0 w-full h-full object-cover will-change-transform transition-all duration-500 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'} ${isActive ? 'scale-100' : 'scale-[1.15]'}`}
                style={{ transitionDuration: isActive ? '8s' : '0.5s' }}
                draggable={false}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none z-10" />
        </div>
    );
};