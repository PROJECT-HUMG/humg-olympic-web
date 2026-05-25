

// Shimmer layer
const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent pointer-events-none" />
);

const SkeletonBox = ({ className }: { className?: string }) => (
    <div className={`bg-slate-200 dark:bg-slate-700/80 rounded ${className}`} />
);

export const CompetitionDetailSkeleton = () => {
    return (
        <div className="animate-pulse">

            {/* ─── Top Bar Actions ─── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                {/* Back button */}
                <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700/80 border border-slate-100 dark:border-slate-700 rounded-xl" />

                {/* Action buttons row */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700/80 border border-slate-100 dark:border-slate-700 rounded-xl" />
                    <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700/80 border border-slate-100 dark:border-slate-700 rounded-xl hidden sm:block" />
                    <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700/80 border border-slate-100 dark:border-slate-700 rounded-xl hidden sm:block" />
                    <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700/80 border border-slate-100 dark:border-slate-700 rounded-xl hidden sm:block" />
                </div>
            </div>

            {/* ─── Hero Banner Skeleton ─── */}
            <div className="relative w-full rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700/50 mb-8 min-h-[300px] md:min-h-[340px] bg-slate-50 dark:bg-slate-800/50">
                <div className="relative flex flex-col md:flex-row gap-6 lg:gap-8 p-6 lg:p-8">
                    {/* Cover image placeholder */}
                    <div className="w-full md:w-[45%] lg:min-w-[400px] max-w-[500px] aspect-[16/10] rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0 relative overflow-hidden">
                        <Shimmer />
                    </div>

                    {/* Content area */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-5">
                        <div>
                            {/* Badge row */}
                            <div className="flex flex-wrap gap-2.5 mb-4">
                                <SkeletonBox className="h-7 w-20 rounded-lg" />
                                <SkeletonBox className="h-7 w-24 rounded-lg" />
                            </div>
                            {/* Title */}
                            <SkeletonBox className="h-10 w-full rounded-xl mb-2" />
                            <SkeletonBox className="h-10 w-3/4 rounded-xl mb-6" />
                            {/* Description lines */}
                            <SkeletonBox className="h-4 w-full rounded mb-2" />
                            <SkeletonBox className="h-4 w-5/6 rounded mb-6" />

                            {/* Bento info grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <SkeletonBox className="h-2.5 w-12" />
                                        <SkeletonBox className="h-4 w-32" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <SkeletonBox className="h-2.5 w-16" />
                                        <SkeletonBox className="h-4 w-24" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Author row + CTA */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <SkeletonBox className="h-3 w-10" />
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <SkeletonBox className="h-4 w-28" />
                            </div>
                            <SkeletonBox className="h-12 w-36 rounded-xl hidden md:block" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Tab Bar Skeleton ─── */}
            <div className="mb-8">
                <div className="bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl p-1.5 flex gap-1 w-full sm:w-auto">
                    {[120, 96, 104, 120].map((w, i) => (
                        <div
                            key={i}
                            className="h-11 rounded-xl bg-slate-300/70 dark:bg-slate-700/70 flex-1 sm:flex-none"
                            style={{ minWidth: `${w}px` }}
                        />
                    ))}
                </div>
            </div>

            {/* ─── Main Grid ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* Left: Content cards */}
                <div className="xl:col-span-8 space-y-6">
                    {/* Article content card */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[1.5rem] p-6 md:p-8 border border-slate-100 dark:border-slate-700/50">
                        <div className="space-y-3 relative overflow-hidden">
                            <Shimmer />
                            <SkeletonBox className="h-5 w-1/3" />
                            <SkeletonBox className="h-4 w-full" />
                            <SkeletonBox className="h-4 w-full" />
                            <SkeletonBox className="h-4 w-5/6" />
                            <SkeletonBox className="h-4 w-full" />
                            <SkeletonBox className="h-4 w-4/6" />
                            <SkeletonBox className="h-4 w-full" />
                            <SkeletonBox className="h-4 w-3/4" />
                        </div>
                    </div>

                    {/* Timeline card */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[1.5rem] p-6 md:p-8 border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-2.5 mb-8">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl" />
                            <SkeletonBox className="h-6 w-44" />
                        </div>
                        <div className="space-y-0 pl-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-5 relative">
                                    {i < 3 && (
                                        <div className="absolute left-[19px] top-10 bottom-[-10px] w-[2px] bg-slate-200 dark:bg-slate-700" />
                                    )}
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 z-10 mt-1" />
                                    <div className="pb-8 pt-1.5 flex-1 space-y-2">
                                        <SkeletonBox className="h-3 w-36" />
                                        <SkeletonBox className="h-5 w-1/2" />
                                        <SkeletonBox className="h-4 w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar */}
                <div className="xl:col-span-4 space-y-6">
                    {/* Registration info card */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30" />
                            <SkeletonBox className="h-5 w-36" />
                        </div>

                        <div className="space-y-6 mb-6">
                            <div>
                                <div className="flex justify-between items-center mb-2.5">
                                    <SkeletonBox className="h-3 w-24" />
                                    <SkeletonBox className="h-6 w-28 rounded-md" />
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2.5">
                                    <SkeletonBox className="h-3 w-20" />
                                    <SkeletonBox className="h-6 w-20 rounded-md" />
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="h-20 w-full bg-slate-100 dark:bg-slate-800/70 rounded-xl" />
                    </div>

                    {/* Exam card placeholder */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-[1.5rem] p-1 border border-indigo-100 dark:border-indigo-800/30">
                        <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40" />
                                <SkeletonBox className="h-5 w-40" />
                            </div>
                            <SkeletonBox className="h-4 w-full" />
                            <SkeletonBox className="h-4 w-3/4" />
                            <SkeletonBox className="h-12 w-full rounded-xl" />
                            <SkeletonBox className="h-10 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


