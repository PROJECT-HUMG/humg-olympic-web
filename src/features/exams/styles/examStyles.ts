export const pageContainer = 'max-w-5xl mx-auto px-4 md:px-6 pt-24 pb-20';
export const pageContainerWide = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20';

export const ambientBg = 'fixed inset-0 pointer-events-none -z-10';
export const ambientBlob1 = 'absolute top-32 left-1/4 w-[400px] h-[400px] bg-blue-500/3 rounded-full blur-3xl';
export const ambientBlob2 = 'absolute bottom-20 right-1/4 w-[320px] h-[320px] bg-purple-500/3 rounded-full blur-3xl';

// ─── Cards ───────────────────────────────────────────────

export const card =
    'bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden';

export const cardHover =
    'bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden hover:border-slate-300 dark:hover:border-neutral-700 transition-colors duration-200';

export const cardPadding = 'p-6';

// ─── Section Headings ────────────────────────────────────

export const sectionTitle =
    'text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2';

export const sectionSubtitle =
    'text-base text-slate-500 dark:text-slate-400';

export const pageTitle =
    'text-2xl font-bold text-slate-900 dark:text-white';

// ─── Form Controls ───────────────────────────────────────

export const label =
    'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';

export const input =
    'w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors dark:text-white';

export const inputError =
    'w-full px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-300 dark:border-red-700 rounded-lg text-base focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-colors dark:text-white';

export const select =
    'w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-base focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer dark:text-white';

export const textarea =
    'w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-colors dark:text-white';

export const errorText =
    'text-sm text-red-500 dark:text-red-400 mt-1 flex items-center gap-1';

// ─── Buttons ─────────────────────────────────────────────

export const btnBase =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed';

export const btnPrimary =
    `${btnBase} px-5 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-700`;

export const btnPrimaryLg =
    `${btnBase} px-6 py-3 text-base text-white bg-blue-600 hover:bg-blue-700`;

export const btnSecondary =
    `${btnBase} px-5 py-2.5 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-700`;

export const btnDanger =
    `${btnBase} px-5 py-2.5 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30`;

export const btnGhost =
    `${btnBase} px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800`;

export const btnSuccess =
    `${btnBase} px-5 py-2.5 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30`;

export const btnWarning =
    `${btnBase} px-5 py-2.5 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30`;

export const btnIndigo =
    `${btnBase} px-5 py-2.5 text-sm text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30`;

// ─── Icon button (small, for toolbar actions) ────────────

export const iconBtn =
    'p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors';

export const iconBtnDanger =
    'p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors';

// ─── Back navigation button ─────────────────────────────

export const backBtn =
    'p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 hover:bg-white hover:border-slate-300 dark:hover:bg-neutral-900 dark:hover:border-neutral-700 transition-colors text-slate-600 dark:text-slate-400';

export const backLink =
    'flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors';

// ─── Badges ──────────────────────────────────────────────

export const badge =
    'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md';

export const badgeSlate = `${badge} bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400`;
export const badgePurple = `${badge} bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400`;
export const badgeBlue = `${badge} bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400`;
export const badgeEmerald = `${badge} bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400`;
export const badgeAmber = `${badge} bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400`;
export const badgeRed = `${badge} bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400`;

// ─── Stat Card ───────────────────────────────────────────

export const statCard = 'rounded-lg p-4 text-center';
export const statLabel = 'text-sm text-slate-500 dark:text-slate-400 font-medium mb-1';
export const statValue = 'text-lg font-bold text-slate-900 dark:text-white';

// ─── Empty State ─────────────────────────────────────────

export const emptyState =
    'text-center py-16 rounded-xl border-2 border-dashed border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50';

export const emptyStateIcon =
    'w-14 h-14 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4';

export const emptyStateTitle =
    'text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1';

export const emptyStateDesc =
    'text-base text-slate-500 dark:text-slate-400';

// ─── Metadata row ────────────────────────────────────────

export const metaRow =
    'flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400';

export const metaItem =
    'flex items-center gap-1.5';

// ─── Question type config ────────────────────────────────

import i18n from '@/i18n';

export const TYPE_LABELS: Record<string, string> = {
    SINGLE_CHOICE: i18n.t('exams:typeLabels.singleChoice'),
    MULTIPLE_CHOICE: i18n.t('exams:typeLabels.multipleChoice'),
    SHORT_ANSWER: i18n.t('exams:typeLabels.shortAnswer'),
};

// ─── Pagination ──────────────────────────────────────────

export const paginationBtn =
    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors';

export const paginationBtnActive =
    `${paginationBtn} bg-blue-600 text-white`;

export const paginationBtnInactive =
    `${paginationBtn} text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800`;

// ─── Search input ────────────────────────────────────────

export const searchInput =
    'w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors dark:text-white placeholder:text-slate-400';

// ─── Filter chip ─────────────────────────────────────────

export const filterChip =
    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer';

export const filterChipActive =
    `${filterChip} bg-blue-600 text-white`;

export const filterChipInactive =
    `${filterChip} text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800`;

// ─── Modal ───────────────────────────────────────────────

export const modalOverlay =
    'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';

export const modalPanel =
    'bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xl w-full overflow-hidden';

export const modalHeader =
    'flex items-center justify-between p-6 border-b border-slate-100 dark:border-neutral-800';

export const modalTitle =
    'text-xl font-semibold text-slate-900 dark:text-white';

export const modalBody = 'p-6';

export const modalFooter =
    'flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-neutral-800';

// ─── Utility ─────────────────────────────────────────────

/** Merge class strings, filtering out falsy values */
export const cx = (...classes: (string | false | null | undefined)[]) =>
    classes.filter(Boolean).join(' ');
