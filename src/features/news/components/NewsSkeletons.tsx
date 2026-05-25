

/* ── Card Skeleton (Horizontal) ── */
export const NewsCardSkeleton = () => (
    <div className="rounded-2xl overflow-hidden flex flex-col sm:flex-row animate-pulse shadow-sm
        bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl
        border border-slate-200/50 dark:border-slate-700/40">
        {/* Image */}
        <div className="w-full sm:w-[280px] h-48 sm:h-auto shrink-0 bg-slate-200/70 dark:bg-slate-800/60 p-3">
            <div className="w-full h-full rounded-xl bg-slate-300/50 dark:bg-slate-700/50" />
        </div>
        {/* Body */}
        <div className="p-4 sm:p-5 sm:pl-3 flex flex-col flex-grow justify-between">
            <div>
                <div className="h-5 w-3/4 bg-slate-200/60 dark:bg-slate-800 rounded mb-2" />
                <div className="h-5 w-1/2 bg-slate-200/60 dark:bg-slate-800 rounded mb-4" />
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded mb-1.5" />
                <div className="h-3.5 w-2/3 bg-slate-100 dark:bg-slate-800/50 rounded" />
            </div>
            <div className="flex flex-col gap-2 mt-4">
                {/* Author */}
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200/60 dark:bg-slate-700" />
                    <div className="w-24 h-3.5 bg-slate-200/60 dark:bg-slate-700 rounded" />
                </div>
                {/* Date + Views */}
                <div className="flex gap-4">
                    <div className="w-28 h-3 bg-slate-200/60 dark:bg-slate-700 rounded" />
                    <div className="w-20 h-3 bg-slate-200/60 dark:bg-slate-700 rounded" />
                </div>
            </div>
        </div>
    </div>
);

/* ── Hero Skeleton ── */
export const HeroSkeleton = () => (
    <div className="relative rounded-[2rem] overflow-hidden min-h-[340px] lg:min-h-[400px] animate-pulse
        bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">

        <div className="flex flex-col lg:flex-row min-h-[340px] lg:min-h-[400px]">
            {/* Left content (1/3) */}
            <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 w-full lg:w-1/3 shrink-0 space-y-5">
                {/* Category ribbon placeholder (mobile: inline, desktop: absolute top-left) */}
                <div className="h-7 w-20 bg-slate-300/60 dark:bg-slate-700/60 lg:absolute lg:top-0 lg:left-0" />

                <div className="space-y-3">
                    <div className="h-7 md:h-9 w-full bg-slate-200/60 dark:bg-slate-700/70 rounded-lg" />
                    <div className="h-7 md:h-9 w-3/4 bg-slate-200/60 dark:bg-slate-700/70 rounded-lg" />
                </div>
                <div className="space-y-2">
                    <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded" />
                    <div className="h-3.5 w-2/3 bg-slate-100 dark:bg-slate-800/50 rounded" />
                </div>
                <div className="h-10 w-28 bg-slate-200/60 dark:bg-slate-700 rounded-xl" />
                <div className="flex items-center gap-3 mt-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="w-24 h-4 bg-slate-200/60 dark:bg-slate-700 rounded" />
                </div>
                <div className="flex gap-4">
                    <div className="w-28 h-3 bg-slate-100 dark:bg-slate-800/50 rounded" />
                    <div className="w-20 h-3 bg-slate-100 dark:bg-slate-800/50 rounded" />
                </div>
            </div>
            {/* Right image (2/3) */}
            <div className="order-first lg:order-last h-[200px] sm:h-[240px] lg:h-auto lg:w-2/3 shrink-0 bg-slate-200/50 dark:bg-slate-800/40" />
        </div>
    </div>
);

/* ── Sidebar Filter Skeleton ── */
export const FiltersSkeleton = () => (
    <div className="animate-pulse bg-white/85 dark:bg-slate-800/75 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/50 shadow-sm space-y-4">
        {/* Search — always visible */}
        <div className="h-11 w-full bg-slate-200/60 dark:bg-slate-700/60 rounded-xl" />

        {/* Desktop: full category list */}
        <div className="hidden lg:block space-y-3">
            <div className="h-3 w-16 bg-slate-200/50 dark:bg-slate-700/50 rounded" />
            <div className="flex flex-col gap-1.5">
                {[1, 2, 3, 4].map(n => (
                    <div key={n} className="h-10 w-full bg-slate-200/50 dark:bg-slate-700/40 rounded-xl" />
                ))}
            </div>
        </div>

        {/* Mobile: compact dropdown bar */}
        <div className="lg:hidden h-12 w-full bg-slate-200/50 dark:bg-slate-700/40 rounded-xl" />
    </div>
);

/* ── Grid Skeleton (card list only) ── */
export const GridSkeleton = () => (
    <div className="flex flex-col gap-4">
        {[1, 2, 3, 4, 5, 6].map(n => <NewsCardSkeleton key={n} />)}
    </div>
);

/* ── Full Page Skeleton (Hero + Sidebar + Cards) ── */
export const BentoGridSkeleton = () => (
    <div className="space-y-6">
        {/* Hero */}
        <HeroSkeleton />

        {/* Sidebar + Cards */}
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[260px] shrink-0">
                <FiltersSkeleton />
            </div>
            <div className="flex-1 min-w-0">
                <GridSkeleton />
            </div>
        </div>
    </div>
);

/* ── Compat alias ── */
export const FullPageSkeleton = BentoGridSkeleton;