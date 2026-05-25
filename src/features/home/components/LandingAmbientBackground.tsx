
/**
 * Shared ambient blob background for all landing page sections below the Hero.
 * Replaces per-section blobs to reduce composite layers.
 */
export const LandingAmbientBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute top-[5%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] right-[-10%] w-[700px] h-[700px] bg-purple-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] left-[10%] w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-600/5 rounded-full blur-[100px]" />
        <div className="absolute top-[85%] right-[5%] w-[600px] h-[600px] bg-blue-500/8 dark:bg-blue-600/8 rounded-full blur-[110px]" />
    </div>
);
