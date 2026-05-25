
interface DashboardSkeletonProps {
    role?: 'STUDENT' | 'LECTURER' | 'ADMIN';
    isInternalStudent?: boolean;
}

export const DashboardSkeleton = ({ role = 'STUDENT', isInternalStudent = true }: DashboardSkeletonProps) => {
    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                    {/* Compact greeting */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="space-y-2">
                            <div className="h-6 w-48 sm:w-64 bg-slate-200 dark:bg-neutral-800 rounded-lg" />
                            <div className="h-4 w-36 sm:w-48 bg-slate-100 dark:bg-neutral-800/60 rounded" />
                        </div>
                        <div className="w-28 sm:w-32 h-10 bg-slate-200 dark:bg-neutral-800 rounded-xl shrink-0" />
                    </div>

                    {/* Tabs Lecturer/Admin */}
                    {(role === 'LECTURER' || role === 'ADMIN') && (
                        <div className="mb-6 border-b border-slate-200 dark:border-neutral-800">
                            <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-10 w-24 sm:w-28 flex-shrink-0 bg-slate-200 dark:bg-neutral-800 rounded-t-lg" />
                                ))}
                            </nav>
                        </div>
                    )}

                    {/* Stats Grid — internal students: 4 cards, external: 2 cards */}
                    {role === 'STUDENT' && (
                        <div className={`grid gap-4 mb-6 grid-cols-2 lg:grid-cols-4`}>
                            {(isInternalStudent ? [1, 2, 3, 4] : [1, 2]).map((i) => (
                                <div
                                    key={i}
                                    className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 min-w-0">
                                            <div className="h-3 sm:h-4 w-16 sm:w-20 bg-slate-200 dark:bg-neutral-800 rounded" />
                                            <div className="h-6 sm:h-8 w-10 sm:w-12 bg-slate-200 dark:bg-neutral-800 rounded" />
                                        </div>
                                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-200 dark:bg-neutral-800 shrink-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {(role === 'LECTURER' || role === 'ADMIN') && (
                        <div className={`grid gap-4 mb-6 grid-cols-2 ${role === 'LECTURER' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
                            {(role === 'LECTURER' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]).map((i) => (
                                <div
                                    key={i}
                                    className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 min-w-0">
                                            <div className="h-3 sm:h-4 w-16 sm:w-20 bg-slate-200 dark:bg-neutral-800 rounded" />
                                            <div className="h-6 sm:h-8 w-10 sm:w-12 bg-slate-200 dark:bg-neutral-800 rounded" />
                                        </div>
                                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-200 dark:bg-neutral-800 shrink-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Student content */}
                    {role === 'STUDENT' && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Quick Actions — 3 or 4 items */}
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 lg:col-span-1">
                                    <div className="h-6 w-32 bg-slate-200 dark:bg-neutral-800 rounded mb-6" />
                                    <div className="grid grid-cols-2 gap-3">
                                        {(isInternalStudent ? [1, 2, 3, 4] : [1, 2, 3]).map((i) => (
                                            <div key={i} className="flex flex-col items-start p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-neutral-700 mb-3" />
                                                <div className="h-4 w-20 bg-slate-200 dark:bg-neutral-700 rounded mb-1" />
                                                <div className="h-3 w-24 bg-slate-200 dark:bg-neutral-700 rounded" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Teams — only for internal students */}
                                {isInternalStudent && (
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 lg:col-span-2 overflow-hidden">
                                        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="space-y-2">
                                                    <div className="h-6 w-36 bg-slate-200 dark:bg-neutral-800 rounded" />
                                                    <div className="h-4 w-24 bg-slate-200 dark:bg-neutral-800 rounded" />
                                                </div>
                                                <div className="h-10 w-full sm:w-64 bg-slate-100 dark:bg-neutral-800 rounded-lg" />
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-neutral-700 shrink-0" />
                                                        <div className="flex-1 space-y-2 min-w-0">
                                                            <div className="h-4 w-32 sm:w-40 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                            <div className="h-3 w-24 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Events */}
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 lg:col-span-2 overflow-hidden">
                                    <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <div className="space-y-2">
                                            <div className="h-6 w-40 bg-slate-200 dark:bg-neutral-800 rounded" />
                                            <div className="h-4 w-24 bg-slate-200 dark:bg-neutral-800 rounded" />
                                        </div>
                                        <div className="h-8 w-20 bg-slate-100 dark:bg-neutral-800 rounded-lg" />
                                    </div>
                                    <div className="p-6">
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex gap-3 sm:gap-4 py-4 first:pt-0 last:pb-0">
                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-200 dark:bg-neutral-800 shrink-0" />
                                                    <div className="flex-1 space-y-2 min-w-0 py-1">
                                                        <div className="h-4 w-full max-w-[12rem] bg-slate-200 dark:bg-neutral-800 rounded" />
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <div className="h-3 w-16 bg-slate-200 dark:bg-neutral-800 rounded" />
                                                            <div className="h-3 w-20 bg-slate-200 dark:bg-neutral-800 rounded" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Activities timeline */}
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 lg:col-span-1 overflow-hidden">
                                    <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                        <div className="space-y-2">
                                            <div className="h-6 w-28 bg-slate-200 dark:bg-neutral-800 rounded" />
                                            <div className="h-4 w-20 bg-slate-200 dark:bg-neutral-800 rounded" />
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="relative">
                                            <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-neutral-800" />
                                            <div className="space-y-6">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="flex gap-3 sm:gap-4 relative z-10">
                                                        <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-neutral-700 mt-1 shrink-0 ring-4 ring-white dark:ring-neutral-900" />
                                                        <div className="flex-1 space-y-2 min-w-0">
                                                            <div className="h-4 w-full max-w-xs bg-slate-200 dark:bg-neutral-800 rounded" />
                                                            <div className="h-3 w-24 sm:w-32 bg-slate-200 dark:bg-neutral-800 rounded" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {role === 'LECTURER' && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Cột trái (3): Thao tác nhanh - map GlowCard quickActions */}
                                <div className="lg:col-span-3">
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5">
                                        <div className="h-6 w-28 sm:w-32 bg-slate-200 dark:bg-neutral-800 rounded mb-4" />
                                        <div className="grid grid-cols-2 gap-2">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-neutral-700" />
                                                    <div className="h-3 w-14 sm:w-16 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Cột giữa (4): Thống kê đội - map BentoCard Team Stats 2x2 */}
                                <div className="lg:col-span-4">
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5">
                                        <div className="h-6 w-32 bg-slate-200 dark:bg-neutral-800 rounded mb-4" />
                                        <div className="grid grid-cols-2 gap-3">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-neutral-700 mb-2" />
                                                    <div className="h-6 w-10 bg-slate-200 dark:bg-neutral-700 rounded mb-1" />
                                                    <div className="h-3 w-20 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Cột phải (5): Sinh viên xuất sắc - map Top Performers */}
                                <div className="lg:col-span-5">
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5">
                                        <div className="h-6 w-36 sm:w-40 bg-slate-200 dark:bg-neutral-800 rounded mb-4" />
                                        <div className="space-y-2 sm:space-y-3">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-neutral-700 shrink-0" />
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-neutral-700 shrink-0" />
                                                    <div className="flex-1 space-y-1 min-w-0">
                                                        <div className="h-3 w-20 sm:w-24 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                        <div className="h-2 w-14 sm:w-16 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                    </div>
                                                    <div className="h-6 w-8 bg-slate-200 dark:bg-neutral-700 rounded shrink-0" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Cột trái đáy (6): Công việc gần đây */}
                                <div className="lg:col-span-6">
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-6 w-36 bg-slate-200 dark:bg-neutral-800 rounded" />
                                        </div>
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-neutral-800">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-neutral-700 shrink-0" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 w-40 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                        <div className="h-3 w-full max-w-sm bg-slate-200 dark:bg-neutral-700 rounded" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Cột phải đáy (6): Lịch trình sắp tới */}
                                <div className="lg:col-span-6">
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5">
                                        <div className="h-6 w-40 bg-slate-200 dark:bg-neutral-800 rounded mb-4" />
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-neutral-700 shrink-0" />
                                                    <div className="flex-1 py-1 space-y-2">
                                                        <div className="h-4 w-32 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                        <div className="h-3 w-48 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {role === 'ADMIN' && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Cột trái (3): Thao tác nhanh + Truy cập nhanh - map GlowCard + BentoCard quickLinks */}
                                <div className="lg:col-span-3 space-y-6">
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5">
                                        <div className="h-6 w-28 sm:w-32 bg-slate-200 dark:bg-neutral-800 rounded mb-4" />
                                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-neutral-700" />
                                                    <div className="h-3 w-14 sm:w-16 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5">
                                        <div className="h-6 w-28 bg-slate-200 dark:bg-neutral-800 rounded mb-4" />
                                        <div className="space-y-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                    <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-neutral-700 shrink-0" />
                                                    <div className="h-4 w-24 sm:w-28 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Cột giữa (5): Yêu cầu cần duyệt - map Approvals */}
                                <div className="lg:col-span-5">
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5 overflow-hidden">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-6 w-36 sm:w-40 bg-slate-200 dark:bg-neutral-800 rounded" />
                                            <div className="h-6 w-12 sm:w-14 bg-amber-100 dark:bg-amber-900/30 rounded-lg" />
                                        </div>
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800">
                                                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-neutral-600 shrink-0" />
                                                    <div className="flex-1 space-y-1.5 min-w-0">
                                                        <div className="h-3.5 w-full max-w-[12rem] sm:max-w-xs bg-slate-200 dark:bg-neutral-700 rounded" />
                                                        <div className="h-3 w-20 sm:w-24 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Cột phải (4): Cảnh báo hệ thống - map Alerts */}
                                <div className="lg:col-span-4">
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5 overflow-hidden">
                                        <div className="h-6 w-28 sm:w-32 bg-slate-200 dark:bg-neutral-800 rounded mb-4" />
                                        <div className="space-y-2 sm:space-y-3">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-neutral-800">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-200 dark:bg-neutral-700 shrink-0 mt-0.5" />
                                                    <div className="flex-1 space-y-2 min-w-0">
                                                        <div className="h-4 w-32 sm:w-40 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                        <div className="h-3 w-full max-w-[10rem] sm:max-w-sm bg-slate-200 dark:bg-neutral-700 rounded" />
                                                        <div className="h-3 w-20 sm:w-28 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Full width: Tổng quan hệ thống - map 8 category buttons */}
                                <div className="lg:col-span-12">
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5">
                                        <div className="h-6 w-40 bg-slate-200 dark:bg-neutral-800 rounded mb-4" />
                                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                                <div key={i} className="flex flex-col items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-200 dark:bg-neutral-700 mb-2" />
                                                    <div className="h-6 sm:h-8 w-8 sm:w-10 bg-slate-200 dark:bg-neutral-700 rounded mb-1" />
                                                    <div className="h-3 w-14 sm:w-16 bg-slate-200 dark:bg-neutral-700 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
