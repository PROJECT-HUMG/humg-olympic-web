
const noiseImage = `url("data:image/svg+xml,%3 viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`;

export const Background = () => {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-humg-light dark:bg-humg-dark transition-colors duration-300 isolate">

            {/* ── Gradient base ── */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FAF9F7] via-[#F0EDE8cc] to-[#EDE8E080] dark:from-[#020617] dark:via-[#0f172a] dark:to-[#17255499] translate-z-0" />

            {/* ── Animated blobs (smaller on mobile for perf) ── */}
            <div className="absolute inset-0 opacity-80 dark:opacity-90 motion-reduce:hidden">

                <div className="absolute top-[-20%] left-[-10%] w-[50vw] md:w-[80vw] h-[50vw] md:h-[80vw] rounded-full 
                        bg-[#60a5fa14] dark:bg-[#2563eb33] 
                        blur-[40px] md:blur-[70px] lg:blur-[90px] 
                        animate-blob will-change-transform transform-gpu" />

                <div className="absolute top-[20%] right-[-20%] w-[45vw] md:w-[70vw] h-[45vw] md:h-[70vw] rounded-full 
                        bg-[#fcd34d1a] dark:bg-[#d9770626] 
                        blur-[40px] md:blur-[80px] lg:blur-[90px] 
                        animate-blob animation-delay-2000 will-change-transform transform-gpu" />

                <div className="absolute bottom-[-20%] left-[10%] w-[40vw] md:w-[60vw] h-[40vw] md:h-[60vw] rounded-full 
                        bg-[#818cf814] dark:bg-[#4f46e533] 
                        blur-[40px] md:blur-[70px] lg:blur-[90px] 
                        animate-blob animation-delay-4000 will-change-transform transform-gpu" />
            </div>

            {/* ── Static fallback for reduced motion ── */}
            <div className="absolute inset-0 hidden motion-reduce:block opacity-50 dark:opacity-40">
                <div className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] rounded-full bg-[#60a5fa0f] dark:bg-[#2563eb26] blur-[60px]" />
                <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#fcd34d14] dark:bg-[#d976061a] blur-[60px]" />
            </div>

            <div className="absolute inset-0 bg-math-pattern bg-[length:24px_24px] opacity-[0.25] dark:opacity-[0.1] mix-blend-overlay" />

            {/* Noise texture — hidden on mobile for perf */}
            <div
                className="absolute inset-0 opacity-[0.3] dark:opacity-[0.15] mix-blend-soft-light hidden md:block"
                style={{ backgroundImage: noiseImage }}
            />

        </div>
    );
};