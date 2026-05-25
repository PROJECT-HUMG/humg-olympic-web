/* ── Card Skeleton: matches CompetitionCard ── */
const CardSkeleton = () => (
    <div className="rounded-[1.5rem] overflow-hidden animate-pulse
        bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/40 shadow-sm">
        {/* Image */}
        <div className="aspect-[3/2] sm:aspect-square w-full bg-slate-200/60 dark:bg-slate-800/60" />
        {/* Body */}
        <div className="p-3.5 sm:p-5 space-y-3">
            <div className="h-4 sm:h-5 w-3/4 bg-slate-200/60 dark:bg-slate-800 rounded" />
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/40 rounded" />
            <div className="h-3.5 w-2/3 bg-slate-100 dark:bg-slate-800/40 rounded" />
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="w-10 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
        </div>
    </div>
);

/* ── Hero Skeleton ── */
const HeroSkeleton = () => (
    <div className="rounded-[2rem] overflow-hidden min-h-[340px] sm:min-h-[380px] lg:min-h-[460px] animate-pulse
        bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative">
        {/* Background */}
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/40" />
        {/* Content */}
        <div className="relative z-10 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center h-full w-full md:w-[70%] lg:w-[60%] space-y-6">
            {/* Badges */}
            <div className="flex gap-3">
                <div className="h-7 w-28 bg-slate-200/60 dark:bg-slate-700/60 rounded-xl" />
                <div className="h-7 w-20 bg-slate-200/60 dark:bg-slate-700/60 rounded-xl" />
            </div>
            {/* Title */}
            <div className="space-y-3">
                <div className="h-8 md:h-10 w-full bg-slate-200/60 dark:bg-slate-700/70 rounded-lg" />
                <div className="h-8 md:h-10 w-3/4 bg-slate-200/60 dark:bg-slate-700/70 rounded-lg" />
            </div>
            {/* Description */}
            <div className="space-y-2">
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/50 rounded" />
                <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800/50 rounded" />
            </div>
            {/* CTA */}
            <div className="h-12 w-36 bg-slate-200/60 dark:bg-slate-700 rounded-xl" />
            {/* Author */}
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="w-24 h-4 bg-slate-200/60 dark:bg-slate-700 rounded" />
            </div>
        </div>
    </div>
);

/* ── Sidebar Filter Skeleton ── */
const FiltersSkeleton = () => (
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

/* ── Grid Skeleton ── */
export const GridSkeleton = () => (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-5">
        {[1, 2, 3, 4, 5, 6].map(n => <CardSkeleton key={n} />)}
    </div>
);

/* ── Full Page Skeleton (Hero + Sidebar + Grid) ── */
export const BentoGridSkeleton = () => (
    <div className="space-y-8">
        {/* Hero */}
        <HeroSkeleton />

        {/* Sidebar + Grid */}
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

/** Alias for backward compatibility */
export const FullPageSkeleton = BentoGridSkeleton;
