export const ProfileSkeleton = () => (
    <div className="animate-pulse container mx-auto px-4 md:px-6 relative z-10 max-w-5xl pt-24 pb-20">
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden mb-8">
                <div className="h-40 md:h-52 bg-slate-200 dark:bg-slate-800"></div>
                <div className="px-4 sm:px-6 md:px-8 pb-6 md:pb-8">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        <div className="-mt-12 sm:-mt-16 relative mx-auto md:mx-0">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-slate-300 dark:bg-slate-700 border-4 sm:border-[6px] border-white dark:border-slate-900"></div>
                        </div>
                        <div className="flex-1 pt-1 md:pt-2 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <div className="h-7 sm:h-8 w-40 sm:w-52 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 ml-1"></div>
                                <div className="flex gap-1 ml-1">
                                    {[1, 2].map(i => <div key={i} className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700" />)}
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-4 sm:mb-6">
                                <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                <div className="h-5 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                            </div>
                            <div className="flex justify-center md:justify-start gap-6 sm:gap-8 md:gap-12 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="text-center md:text-left">
                                        <div className="h-6 sm:h-7 w-10 sm:w-12 bg-slate-200 dark:bg-slate-700 rounded mb-1 mx-auto md:mx-0"></div>
                                        <div className="h-3 w-12 sm:w-14 bg-slate-100 dark:bg-slate-800 rounded mx-auto md:mx-0"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-4 sm:gap-8 px-2 overflow-x-auto">
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0"></div>
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0"></div>
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0"></div>
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0"></div>
            </div>

            {/* Content Skeleton */}
            <div className="min-h-[500px] space-y-8">
                {/* Stats Card */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 mb-3"></div>
                            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
                {/* Info Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    </div>
                    <div className="mb-8">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                        <div className="h-20 w-full bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const OverviewSkeleton = () => (
    <div className="animate-pulse space-y-8">
        {/* ── Stats Card Skeleton ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 mb-3"></div>
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
            ))}
        </div>

        {/* ── Info Card Skeleton ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div className="mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                <div className="h-20 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const BadgesSkeleton = () => (
    <div className="animate-pulse space-y-12">
        <div className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        {[1, 2].map(section => (
            <div key={section}>
                <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex flex-col items-center gap-3">
                            <div className="w-20 h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export const RequestsSkeleton = () => (
    <div className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
        {[1, 2, 3].map(i => (
            <div key={i} className="h-20 w-full bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        ))}
    </div>
);

export const SettingsSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 dark:border-slate-800">
                <div className="px-5 py-3.5"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div></div>
                <div className="px-5 py-3.5"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></div>
                <div className="px-5 py-3.5"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></div>
                <div className="px-5 py-3.5"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></div>
            </div>
            <div className="p-5 sm:p-6 space-y-6">
                {/* Appearance */}
                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        </div>
                        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0"></div>
                    </div>
                ))}

                {/* Privacy */}
                <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded mt-4"></div>
                {[1, 2, 3, 4].map(i => (
                    <div key={`p${i}`} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="space-y-2">
                            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-3 w-52 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        </div>
                        <div className="h-6 w-11 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
                    </div>
                ))}

                {/* Notifications */}
                <div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded mt-4"></div>
                {[1, 2].map(i => (
                    <div key={`n${i}`} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="space-y-2">
                            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-3 w-56 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        </div>
                        <div className="h-6 w-11 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
