import type { CSSProperties } from 'react';

// ─── Reusable Bone ────────────────────────────────────────
const S = ({ className = '', style }: { className?: string; style?: CSSProperties }) => (
    <div
        className={`bg-slate-200 dark:bg-slate-700/60 rounded-lg animate-pulse ${className}`}
        style={style}
    />
);

export const LeaderboardSkeleton = ({ rows = 6 }: { rows?: number }) => (
    <div className="animate-pulse">
        {/* Header: BarChart3 icon + title on left, pill count on right */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
                {/* p-2 rounded-lg bg-blue-50 icon box */}
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0" />
                <S className="h-5 w-28" />
            </div>
            {/* px-3 py-1 rounded-full pill */}
            <S className="h-6 w-14 rounded-full" />
        </div>

        {/* Ranking rows — mirrors RankingCardItem layout="row" */}
        <div className="space-y-3 mb-6">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40"
                >
                    {/* Rank badge */}
                    <div className={`w-10 h-10 rounded-xl shrink-0 ${i < 3
                        ? 'bg-yellow-100 dark:bg-yellow-900/20'
                        : 'bg-slate-100 dark:bg-slate-800'
                        }`} />
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                    {/* Name + badges */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <S style={{ width: `${55 + (i % 4) * 10}%` } as CSSProperties} className="h-4" />
                        <div className="flex gap-1.5">
                            <S className="h-3 w-10 rounded-full" />
                            <S className="h-3 w-14 rounded-full" />
                        </div>
                    </div>
                    {/* Score */}
                    <div className="shrink-0 text-right space-y-1">
                        <S className="h-5 w-9 ml-auto" />
                        <S className="h-3 w-6 ml-auto rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// =============================================================
//  QuestionBankSkeleton  (reused by CreateExamPage inline)
// =============================================================
export const QuestionBankSkeleton = () => (
    <div className="divide-y divide-slate-100 dark:divide-slate-800 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="px-6 py-5 flex items-start gap-4">
                <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-md shrink-0 mt-1" />
                <div className="flex-1 space-y-3">
                    <S className="h-5 w-3/4" />
                    <div className="flex gap-2">
                        <S className="h-6 w-20 rounded-lg" />
                        <S className="h-6 w-16 rounded-lg" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// =============================================================
//  ExamGridSkeleton  (exam list page cards)
// =============================================================
export const ExamGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <div
                key={i}
                className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden"
            >
                <div className="p-5 space-y-3">
                    <S className="h-5 w-4/5" />
                    <S className="h-4 w-1/2" />
                    <div className="flex gap-2">
                        <S className="h-6 w-20 rounded-full" />
                        <S className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="flex gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <S className="h-4 w-16" />
                        <S className="h-4 w-20" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// =============================================================
//  ExamPreviewSkeleton
//  Matches ExamPreviewPage: rounded-2xl cards, info rows, question list
// =============================================================
export const ExamPreviewSkeleton = () => (
    <div className="min-h-screen font-sans">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl pt-24 pb-20 animate-pulse">

            {/* Top bar: back + action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <S className="h-5 w-20" />
                <div className="flex gap-2.5">
                    <S className="h-10 w-24 rounded-xl" />
                    <S className="h-10 w-28 rounded-xl" />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main column */}
                <div className="flex-1 min-w-0 space-y-6">

                    {/* Header card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-6">
                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <S className="h-6 w-20 rounded-lg" />
                                <S className="h-6 w-18 rounded-lg" />
                                <S className="h-6 w-18 rounded-lg" />
                            </div>
                            {/* Title + description */}
                            <S className="h-7 w-3/4 mb-2" />
                            <S className="h-5 w-full mb-1" />
                            <S className="h-5 w-3/5" />
                        </div>

                        {/* Info rows (4 rows) */}
                        <div className="border-t border-slate-100 dark:border-slate-800">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center justify-between py-3.5 px-6 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                                        <S className="h-4 w-20" />
                                    </div>
                                    <S className="h-4 w-16" />
                                </div>
                            ))}
                        </div>

                        {/* Info banners */}
                        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 space-y-2.5">
                            <div className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700" />
                            <div className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700" />
                        </div>
                    </div>

                    {/* Question list card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2.5">
                            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                            <S className="h-5 w-40" />
                        </div>
                        <div className="p-6 space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50">
                                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <S className="h-4 w-full" />
                                        <S className="h-4 w-2/3" />
                                        <div className="flex gap-2">
                                            <S className="h-5 w-16 rounded-lg" />
                                            <S className="h-5 w-12 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-[340px] xl:w-[400px] shrink-0">
                    <div className="lg:sticky lg:top-28">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <LeaderboardSkeleton rows={6} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// =============================================================
//  ExamStartSkeleton
//  Matches ExamStartPage: rounded-2xl card, info rows, CTA
// =============================================================
export const ExamStartSkeleton = () => (
    <div className="min-h-screen font-sans">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl pt-24 pb-20 animate-pulse">

            {/* Back link */}
            <S className="h-5 w-20 mb-6" />

            {/* Main card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 md:p-8">
                    {/* Title centered */}
                    <div className="text-center mb-6">
                        <S className="h-7 w-3/4 mx-auto mb-2" />
                        <S className="h-4 w-1/2 mx-auto mb-3" />
                        <div className="flex items-center justify-center gap-2">
                            <S className="h-6 w-20 rounded-lg" />
                            <S className="h-6 w-16 rounded-lg" />
                        </div>
                    </div>

                    {/* Info rows (6 rows) */}
                    <div className="border-t border-slate-100 dark:border-slate-800">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex items-center justify-between py-3.5 px-1 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <S className="h-4 w-28" />
                                </div>
                                <S className="h-4 w-16" />
                            </div>
                        ))}
                    </div>

                    {/* Info banners */}
                    <div className="mt-4 space-y-3">
                        <div className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700" />
                        <div className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700" />
                    </div>

                    {/* CTA button */}
                    <div className="mt-6">
                        <S className="h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Footer share */}
            <div className="flex justify-center mt-5">
                <S className="h-10 w-28 rounded-xl" />
            </div>
        </div>
    </div>
);

// =============================================================
//  ExamResultSkeleton
//  Matches ExamResultPage: rounded-2xl card, horizontal header with
//  score on right, progress bar, info rows, question cards
// =============================================================
export const ExamResultSkeleton = () => (
    <div className="min-h-screen font-sans">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl pt-24 pb-24 animate-pulse">

            {/* Back button */}
            <S className="h-5 w-20 mb-6" />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main column */}
                <div className="flex-1 min-w-0 space-y-4">

                    {/* Score Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-6">
                            {/* Result heading: icon + title + score */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <S className="h-5 w-52" />
                                    <S className="h-4 w-36" />
                                </div>
                                <div className="text-right space-y-1">
                                    <S className="h-7 w-12 ml-auto" />
                                    <S className="h-3 w-14 ml-auto" />
                                </div>
                            </div>

                            {/* Score progress bar */}
                            <div className="mb-2">
                                <div className="flex items-center justify-between mb-1.5">
                                    <S className="h-4 w-10" />
                                    <S className="h-3 w-24" />
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800" />
                            </div>
                        </div>

                        {/* Stats rows (4 rows) */}
                        <div className="border-t border-slate-100 dark:border-slate-800">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center justify-between py-3.5 px-6 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                                        <S className="h-4 w-24" />
                                    </div>
                                    <S className="h-4 w-14" />
                                </div>
                            ))}
                        </div>

                        {/* Appeal section */}
                        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-center">
                            <S className="h-9 w-44 rounded-xl" />
                        </div>
                    </div>

                    {/* Detail toggle */}
                    <S className="h-12 w-full rounded-2xl" />

                    {/* Result detail cards */}
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900">
                                <div className="px-5 py-4 flex items-center gap-4">
                                    <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <S className="h-4 w-12" />
                                            <S className="h-4 w-14 rounded" />
                                        </div>
                                        <S className="h-3 w-3/4" />
                                    </div>
                                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded shrink-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar: leaderboard */}
                <div className="w-full lg:w-[340px] xl:w-[400px] shrink-0">
                    <div className="lg:sticky lg:top-28">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <LeaderboardSkeleton rows={6} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// =============================================================
//  CreateExamSkeleton  (create / edit page)
//  Matches CreateExamPage layout:
//  - bg-slate-50/50 dark:bg-[#0a0f1c] min-h-screen
//  - max-w-[1400px] pt-24 pb-24
//  - Header: back arrow button + h1 + subtitle
//  - grid lg:grid-cols-12 gap-8
//    left  lg:col-span-4: glass card with title, inputs, toggles, action box
//    right lg:col-span-8: glass card with toolbar, select-all bar, question rows
// =============================================================
export const CreateExamSkeleton = () => (
    <div className="min-h-screen relative font-sans text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-[#0a0f1c] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 relative z-10 animate-pulse">

            {/* ── Page header ── */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                {/* p-3 rounded-2xl back button */}
                <div className="w-12 h-12 bg-white/70 dark:bg-slate-900/70 border border-white/50 dark:border-slate-700/50 rounded-2xl shrink-0" />
                <div className="space-y-2">
                    <S className="h-9 w-52 rounded-xl" />
                    <S className="h-4 w-72" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                {/* ── Left: config card ── lg:col-span-4 */}
                <div className="lg:col-span-4">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] border border-white/50 dark:border-slate-700/50 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-6 lg:sticky lg:top-24">

                        {/* Section title: icon + "Cấu hình chung" */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl" />
                            <S className="h-6 w-36" />
                        </div>

                        <div className="space-y-5">
                            {/* Tên đề thi */}
                            <div>
                                <S className="h-4 w-24 mb-2" />
                                <S className="h-12 w-full rounded-2xl" />
                            </div>
                            {/* Mô tả */}
                            <div>
                                <S className="h-4 w-16 mb-2" />
                                <S className="h-20 w-full rounded-2xl" />
                            </div>
                            {/* Môn học + Phân loại (2-col) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <S className="h-4 w-20 mb-2" />
                                    <S className="h-12 w-full rounded-2xl" />
                                </div>
                                <div>
                                    <S className="h-4 w-20 mb-2" />
                                    <S className="h-12 w-full rounded-2xl" />
                                </div>
                            </div>
                            {/* Thời gian */}
                            <div>
                                <S className="h-4 w-40 mb-2" />
                                <S className="h-12 w-full rounded-2xl" />
                            </div>
                            {/* Datetime box */}
                            <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <S className="h-3.5 w-20 mb-1.5" />
                                        <S className="h-10 w-full rounded-xl" />
                                    </div>
                                    <div>
                                        <S className="h-3.5 w-24 mb-1.5" />
                                        <S className="h-10 w-full rounded-xl" />
                                    </div>
                                </div>
                                <S className="h-3.5 w-56 rounded-full" />
                            </div>
                            {/* Toggle buttons */}
                            <div className="space-y-3">
                                <div className="h-14 w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20" />
                                <div className="h-14 w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20" />
                            </div>
                        </div>

                        {/* Final action box */}
                        <div className="pt-6 border-t border-slate-200/50 dark:border-slate-700/50 space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex justify-between items-center">
                                        <S className="h-4 w-24" />
                                        <S className="h-5 w-16" />
                                    </div>
                                ))}
                            </div>
                            {/* Submit button */}
                            <S className="h-14 w-full rounded-2xl" />
                        </div>
                    </div>
                </div>

                {/* ── Right: question picker ── lg:col-span-8 */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden flex flex-col">

                        {/* Toolbar: p-6 border-b */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                            {/* h2: icon + "Ngân hàng câu hỏi" */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-11 h-11 bg-purple-50 dark:bg-purple-900/30 rounded-xl" />
                                <S className="h-6 w-44" />
                            </div>
                            {/* Search + filters row */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <S className="h-12 flex-1 rounded-xl" />
                                <div className="flex flex-wrap gap-2">
                                    {/* 4 filter chips: Tất cả + 3 types */}
                                    {[1, 2, 3, 4].map(i => (
                                        <S key={i} className="h-10 w-20 rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Select all + random bar: px-6 py-4 bg-slate-50/50 border-b */}
                        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-md" />
                                <S className="h-4 w-36" />
                            </div>
                            <S className="h-8 w-32 rounded-xl" />
                        </div>

                        {/* Question rows: divide-y */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="px-6 py-5 flex items-start gap-4">
                                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-md shrink-0 mt-1" />
                                    <div className="flex-1 space-y-3">
                                        <S className="h-5 w-3/4" />
                                        <div className="flex gap-2">
                                            <S className="h-6 w-20 rounded-lg" />
                                            <S className="h-6 w-14 rounded-lg" />
                                            <S className="h-6 w-24 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// =============================================================
//  GradingDetailSkeleton
//  max-w-4xl, header card + student + score summary + question cards
// =============================================================
export const GradingDetailSkeleton = () => (
    <div className="min-h-screen font-sans">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl pt-24 pb-24 animate-pulse">

            {/* Back button */}
            <S className="h-5 w-20 mb-6" />

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                {/* Title bar */}
                <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
                        <div className="flex-1 space-y-2">
                            <S className="h-5 w-36" />
                            <S className="h-4 w-48" />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Student row */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <S className="h-4 w-32" />
                            <div className="flex gap-1.5">
                                <S className="h-3 w-12 rounded-full" />
                                <S className="h-3 w-16 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Score Summary */}
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <S className="h-5 w-20" />
                        <S className="h-5 w-20" />
                        <S className="h-5 w-24" />
                        <S className="h-5 w-28 rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Action Logs placeholder */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-6 py-4 mb-6 flex items-center gap-3">
                <S className="h-4 w-4 rounded" />
                <S className="h-4 w-4 rounded" />
                <S className="h-4 w-28" />
                <div className="flex-1" />
                <S className="h-4 w-16" />
            </div>

            {/* Question Cards */}
            <div className="space-y-4 mb-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Question header */}
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
                            <S className="h-4 w-16" />
                            <S className="h-5 w-14 rounded-lg" />
                            <div className="flex-1" />
                            <S className="h-5 w-12 rounded-lg" />
                        </div>
                        {/* Question content */}
                        <div className="p-5 space-y-3">
                            <S className="h-4 w-full" />
                            <S className="h-4 w-3/4" />
                            {/* Answer area */}
                            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 space-y-2">
                                <S className="h-3 w-20" />
                                <S className="h-4 w-full" />
                                <S className="h-4 w-2/3" />
                            </div>
                            {/* Grading inputs */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-4">
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <S className="h-3 w-16" />
                                </div>
                                <div className="p-4 space-y-3">
                                    <S className="h-10 w-full rounded-xl" />
                                    <S className="h-16 w-full rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                    <S className="h-4 w-28" />
                </div>
                <div className="p-6 space-y-4">
                    <S className="h-20 w-full rounded-xl" />
                    <S className="h-12 w-full rounded-xl" />
                </div>
            </div>
        </div>
    </div>
);

// =============================================================
//  SubmissionsDashboardSkeleton
//  max-w-5xl, header + view+status tabs + table header + submission rows
// =============================================================
export const SubmissionsDashboardSkeleton = () => (
    <div className="min-h-screen font-sans">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl pt-24 pb-24 animate-pulse">

            {/* Back button */}
            <S className="h-5 w-20 mb-6" />

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                {/* Title */}
                <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
                    <div className="space-y-2">
                        <S className="h-5 w-32" />
                        <S className="h-4 w-20" />
                    </div>
                </div>

                {/* View tabs: Bài nộp / Phúc khảo */}
                <div className="px-6 py-3 flex gap-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <S className="h-9 w-24 rounded-lg" />
                    <S className="h-9 w-24 rounded-lg" />
                </div>

                {/* Status tabs */}
                <div className="px-6 py-3 flex gap-1.5 bg-slate-50 dark:bg-slate-800/30">
                    <S className="h-9 w-20 rounded-lg" />
                    <S className="h-9 w-24 rounded-lg" />
                    <S className="h-9 w-22 rounded-lg" />
                </div>
            </div>

            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-6 py-2 mb-1">
                <S className="col-span-5 h-3 w-16" />
                <S className="col-span-2 h-3 w-20" />
                <S className="col-span-2 h-3 w-16" />
                <S className="col-span-1 h-3 w-10 mx-auto" />
                <S className="col-span-2 h-3 w-16 ml-auto" />
            </div>

            {/* Submission rows */}
            <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-6 py-4 sm:grid sm:grid-cols-12 sm:items-center gap-3">
                        {/* Student */}
                        <div className="sm:col-span-5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                            <div className="space-y-1.5 flex-1">
                                <S style={{ width: `${50 + (i % 3) * 15}%` } as CSSProperties} className="h-4" />
                                <S className="h-3 w-16 rounded-full" />
                            </div>
                        </div>
                        {/* Status */}
                        <div className="sm:col-span-2">
                            <S className="h-6 w-20 rounded-lg" />
                        </div>
                        {/* Time */}
                        <div className="sm:col-span-2">
                            <S className="h-4 w-24" />
                        </div>
                        {/* Score */}
                        <div className="sm:col-span-1 flex justify-center">
                            <S className="h-5 w-10" />
                        </div>
                        {/* Actions */}
                        <div className="sm:col-span-2 flex justify-end gap-2">
                            <S className="h-8 w-8 rounded-lg" />
                            <S className="h-8 w-20 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// =============================================================
//  ExamTakingSkeleton
//  Fixed top bar + main question area + sidebar + bottom nav
// =============================================================
export const ExamTakingSkeleton = () => (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans">

        {/* Fixed Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 md:h-[60px] flex items-center justify-between gap-3 animate-pulse">
                {/* Title */}
                <S className="h-5 w-40 md:w-56" />
                {/* Timer */}
                <S className="h-9 w-24 rounded-full" />
                {/* Right controls */}
                <div className="flex items-center gap-2">
                    <S className="hidden sm:block h-8 w-20 rounded-lg" />
                    <S className="hidden sm:block h-8 w-8 rounded-lg" />
                    <S className="hidden sm:block h-7 w-16 rounded-lg" />
                </div>
            </div>
            {/* Progress bar */}
            <div className="h-0.5 bg-slate-100 dark:bg-slate-700" />
        </div>

        {/* Main Content */}
        <div className="pt-[60px] md:pt-[64px] pb-[72px] md:pb-[80px]">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6 animate-pulse">
                <div className="flex gap-5 lg:gap-6">

                    {/* Question Area */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            {/* Question header */}
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                                <S className="h-6 w-16 rounded-lg" />
                                <S className="h-5 w-24 rounded-lg" />
                                <div className="flex-1" />
                                <S className="h-6 w-14 rounded-full" />
                                <S className="h-8 w-8 rounded-lg" />
                            </div>

                            {/* Question content */}
                            <div className="p-5 md:p-6 space-y-4">
                                <S className="h-5 w-full" />
                                <S className="h-5 w-4/5" />
                                <S className="h-5 w-3/5" />

                                {/* LaTeX toolbar placeholder */}
                                <S className="h-8 w-44 rounded-lg mt-4" />

                                {/* Answer area */}
                                <div className="mt-4 space-y-3">
                                    <S className="h-24 w-full rounded-xl" />
                                </div>

                                {/* Preview area */}
                                <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 space-y-2">
                                    <S className="h-3 w-20" />
                                    <S className="h-4 w-full" />
                                    <S className="h-4 w-2/3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block w-56 xl:w-64 shrink-0">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            {/* Sidebar header */}
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <S className="h-4 w-28" />
                                <S className="h-4 w-10" />
                            </div>
                            {/* Question grid */}
                            <div className="p-3">
                                <div className="grid grid-cols-6 gap-1.5">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-700" />
                                    ))}
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-blue-500" />
                                        <S className="h-3 w-14" />
                                    </div>
                                    <S className="h-3 w-4" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-600" />
                                        <S className="h-3 w-16" />
                                    </div>
                                    <S className="h-3 w-4" />
                                </div>
                            </div>
                            {/* Submit button */}
                            <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                                <S className="h-10 w-full rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Fixed Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 md:h-16 flex items-center justify-between gap-3 animate-pulse">
                <S className="h-9 w-24 rounded-lg" />
                <S className="h-5 w-12" />
                <S className="h-9 w-24 rounded-lg" />
            </div>
        </div>
    </div>
);
