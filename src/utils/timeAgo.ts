import i18n from '@/i18n';

export function timeAgo(date: string | Date | null | undefined): string {
    if (!date) return '';
    const now = Date.now();
    const then = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
    const diffMs = now - then;

    if (diffMs < 0) return i18n.t('common:timeAgo.justNow');

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (seconds < 60) return i18n.t('common:timeAgo.justNow');
    if (minutes < 60) return i18n.t('common:timeAgo.minutesAgo', { count: minutes });
    if (hours < 24) return i18n.t('common:timeAgo.hoursAgo', { count: hours });
    if (days === 1) return i18n.t('common:timeAgo.yesterday');
    if (days < 7) return i18n.t('common:timeAgo.daysAgo', { count: days });
    if (weeks < 5) return i18n.t('common:timeAgo.weeksAgo', { count: weeks });
    if (months < 12) return i18n.t('common:timeAgo.monthsAgo', { count: months });

    const years = Math.floor(months / 12);
    return i18n.t('common:timeAgo.yearsAgo', { count: years });
}
