

export const TeamDetailSkeleton = () => {
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-pulse">
            {/* A. Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-3 flex-1">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-zinc-800 rounded-full" />
                    <div className="h-10 w-3/4 max-w-md bg-slate-200 dark:bg-zinc-800 rounded-lg" />
                </div>
                <div className="flex gap-2">
                    <div className="h-9 w-9 bg-slate-200 dark:bg-zinc-800 rounded-full" />
                    <div className="h-9 w-9 bg-slate-200 dark:bg-zinc-800 rounded-full" />
                </div>
            </div>

            {/* B. Tabs Skeleton */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div className="h-9 w-28 bg-slate-200 dark:bg-zinc-800 rounded-full" />
                <div className="h-9 w-28 bg-slate-200 dark:bg-zinc-800 rounded-full" />
            </div>

            {/* C. Content Skeleton (Mirrors the Overview Layout) */}
            <div className="flex flex-col gap-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl h-32 flex flex-col justify-between">
                            <div className="h-10 w-10 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded" />
                                <div className="h-6 w-12 bg-slate-200 dark:bg-zinc-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Banner Skeleton */}
                <div className="h-24 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex gap-4 items-center w-full">
                        <div className="h-12 w-12 bg-slate-200 dark:bg-zinc-800 rounded-xl shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded" />
                            <div className="h-3 w-48 bg-slate-200 dark:bg-zinc-800 rounded" />
                        </div>
                    </div>
                </div>

                {/* Description Skeleton */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-zinc-800 rounded" />
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-slate-200 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-5/6 bg-slate-200 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-4/6 bg-slate-200 dark:bg-zinc-800 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
};