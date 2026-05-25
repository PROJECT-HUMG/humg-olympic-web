export const NewsDetailSkeleton = () => (
  <div className="animate-pulse">
    {/* Toolbar */}
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
      <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700/80 rounded-2xl" />
      <div className="flex items-center gap-2">
        <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700/80 rounded-2xl" />
        <div className="h-10 w-16 bg-slate-200 dark:bg-slate-700/80 rounded-2xl hidden sm:block" />
        <div className="h-10 w-16 bg-slate-200 dark:bg-slate-700/80 rounded-2xl hidden sm:block" />
      </div>
    </div>

    {/* Meta: Author row + Date/Views row (mobile) | Author left + Date/Views right (desktop) */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 dark:bg-slate-700/80" />
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700/80 rounded" />
          <div className="h-3 w-14 bg-slate-200 dark:bg-slate-700/80 rounded" />
        </div>
      </div>
      {/* Date (left) + Views (right) on mobile; stacked right on desktop */}
      <div className="flex items-center justify-between md:flex-col md:items-end gap-1">
        <div className="h-4 w-44 sm:w-52 bg-slate-200 dark:bg-slate-700/80 rounded" />
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/80 rounded" />
      </div>
    </div>

    {/* Title */}
    <div className="mb-8 space-y-3">
      <div className="h-8 md:h-10 w-full max-w-3xl bg-slate-200 dark:bg-slate-700/70 rounded-lg" />
      <div className="h-8 md:h-10 w-3/4 max-w-xl bg-slate-200 dark:bg-slate-700/70 rounded-lg" />
    </div>

    {/* Full-width Image */}
    <div className="-mx-4 lg:-mx-8 mb-8">
      <div className="w-full h-[250px] md:h-[400px] bg-slate-200 dark:bg-slate-700/60" />
    </div>

    {/* Summary quote */}
    <div className="mb-10 pl-6 md:pl-8 border-l-4 border-slate-200 dark:border-slate-700 bg-blue-50/30 dark:bg-blue-900/10 rounded-r-2xl p-4">
      <div className="h-5 w-full bg-slate-200 dark:bg-slate-700/80 rounded mb-2" />
      <div className="h-5 w-5/6 bg-slate-200 dark:bg-slate-700/80 rounded mb-2" />
      <div className="h-5 w-4/6 bg-slate-200 dark:bg-slate-700/80 rounded" />
    </div>

    {/* Content lines */}
    <div className="space-y-3.5">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded" style={{ width: i === 4 ? '85%' : i === 6 ? '70%' : i === 8 ? '50%' : '100%' }} />
      ))}
    </div>

    {/* Footer */}
    <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center">
      <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700/80 rounded-2xl" />
      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/80 rounded" />
    </div>
  </div>
);
