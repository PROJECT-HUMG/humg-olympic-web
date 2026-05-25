interface ExamSkeletonProps {
    viewMode: 'grid' | 'list';
}

export const ExamSkeleton = ({ viewMode }: ExamSkeletonProps) => {
    if (viewMode === 'list') {
        return (
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/40 overflow-hidden animate-pulse">
                <div className="flex items-center px-4 py-3.5 gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-1/4 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="hidden sm:flex gap-4">
                        <div className="h-3 w-8 bg-slate-100 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-8 bg-slate-100 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-8 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 overflow-hidden animate-pulse">
            <div className="p-5">
                {/* Subject + category */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
                {/* Title */}
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                {/* Stats */}
                <div className="flex gap-3">
                    <div className="h-3.5 w-14 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-3.5 w-14 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-3.5 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex gap-2">
                    <div className="h-3 w-14 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-10 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
            </div>
        </div>
    );
};
