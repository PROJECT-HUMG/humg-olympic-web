

const Shimmer = () => (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-[shimmer_1.6s_ease-in-out_infinite]" />
    </div>
);

export const ResourceSkeleton = () => {
    return (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col h-full overflow-hidden relative">
            <Shimmer />

            {/* Accent bar placeholder */}
            <div className="h-[3px] w-full bg-slate-200 dark:bg-slate-700 animate-pulse" />

            <div className="p-5 flex-1 flex flex-col">
                {/* Header: Icon & badges */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                        <div className="flex flex-col gap-1.5">
                            <div className="w-10 h-4 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
                            <div className="w-20 h-4 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
                        </div>
                    </div>
                    <div className="w-12 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 animate-pulse" />
                </div>

                {/* Title */}
                <div className="w-4/5 h-5 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mb-3" />

                {/* Description */}
                <div className="space-y-2 flex-1">
                    <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-700/60 rounded animate-pulse" />
                    <div className="w-3/5 h-3.5 bg-slate-100 dark:bg-slate-700/60 rounded animate-pulse" />
                </div>

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50 space-y-2.5">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                        <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </div>
                    {/* Meta */}
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-3 bg-slate-100 dark:bg-slate-700/60 rounded animate-pulse" />
                        <div className="w-14 h-3 bg-slate-100 dark:bg-slate-700/60 rounded animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Action buttons placeholder */}
            <div className="px-4 py-3 flex gap-2 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex-1 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="flex-1 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>
        </div>
    );
};
