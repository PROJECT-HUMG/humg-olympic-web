


interface LogoProps {
    className?: string;
    variant?: 'horizontal' | 'vertical';
}

export const Logo = ({ className = "h-10", variant = 'horizontal' }: LogoProps) => {
    if (variant === 'vertical') {
        return (
            <div className="flex flex-col items-start gap-2 md:gap-3 group cursor-pointer">
                <img
                    src="/assets/logo.png"
                    alt="HUMG Logo"
                    className={`${className} flex-shrink-0 object-contain transition-transform duration-300 group-hover:scale-110`}
                />
                <div className="flex flex-col items-start">
                    <span className="text-xl md:text-2xl font-extrabold text-humg-blue dark:text-white transition-colors duration-300 leading-none">
                        HUMG
                    </span>
                    <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300 tracking-widest mt-1 uppercase">
                        Olympic
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
            <div className="flex-shrink-0 flex items-center justify-center">
                <img
                    src="/assets/logo.png"
                    alt="HUMG Logo"
                    className={`${className} object-contain transition-transform duration-300 group-hover:scale-110`}
                />
            </div>
            <div className="flex flex-col justify-center">
                <span className="text-xl md:text-2xl font-extrabold text-humg-blue dark:text-white transition-colors duration-300 leading-none">
                    HUMG
                </span>
                <span className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 transition-colors duration-300 tracking-[0.15em] uppercase mt-0.5">
                    Olympic
                </span>
            </div>
        </div>
    );
};
