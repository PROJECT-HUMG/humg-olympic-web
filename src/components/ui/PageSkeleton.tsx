const shimmerClass = 'animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl';

export const PageSkeleton = () => (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
        {/* ── Page title skeleton ── */}
        <div className={`h-8 w-48 ${shimmerClass}`} />
        <div className={`h-4 w-72 ${shimmerClass}`} />

        {/* ── Content cards skeleton ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-5 space-y-3">
                    <div className={`h-36 w-full ${shimmerClass}`} />
                    <div className={`h-5 w-3/4 ${shimmerClass}`} />
                    <div className={`h-4 w-full ${shimmerClass}`} />
                    <div className={`h-4 w-1/2 ${shimmerClass}`} />
                </div>
            ))}
        </div>
    </div>
);
