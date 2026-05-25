import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, Check, Trash2, MessageSquare, FileText, Trophy,
    Map, Users, Award, Settings, Files, Loader2
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationType } from '../types/notification.types';
import { timeAgo } from '@/utils/timeAgo';
import { iconColor, ICON_STROKE } from '@/utils/iconStyles';
import i18n from '@/i18n';


export const NotificationsPage = () => {
    const navigate = useNavigate();
    const sentinelRef = useRef<HTMLDivElement>(null);

    const {
        notifications,
        loading,
        loadingMore,
        hasMore,
        filter,
        setFilter,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        loadMore,
    } = useNotifications(10);

    useEffect(() => {
        fetchNotifications();
    }, []);

    {/* ── Infinite scroll observer ── */ }
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
            loadMore();
        }
    }, [hasMore, loading, loadingMore, loadMore]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(handleObserver, {
            rootMargin: '200px',
        });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [handleObserver]);

    const handleItemClick = (id: number, link?: string) => {
        markAsRead(id);
        if (link) {
            navigate(link);
        }
    };

    const getNotificationIcon = (type: NotificationType) => {
        const iconProps = { size: 18, strokeWidth: 1.75 };
        switch (type) {
            case 'MESSAGE': return <MessageSquare {...iconProps} className="text-blue-500" />;
            case 'RESOURCE': return <Files {...iconProps} className="text-blue-600" />;
            case 'COMPETITION': return <Trophy {...iconProps} className="text-yellow-600" />;
            case 'ROADMAP': return <Map {...iconProps} className="text-purple-600" />;
            case 'NEWS': return <Bell {...iconProps} className="text-rose-600" />;
            case 'TEAM': return <Users {...iconProps} className="text-orange-600" />;
            case 'BADGE': return <Award {...iconProps} className="text-yellow-500" />;
            case 'FORUM': return <MessageSquare {...iconProps} className="text-green-600" />;
            case 'EXAM': return <FileText {...iconProps} className="text-emerald-500" />;
            case 'SYSTEM': return <Settings {...iconProps} className="text-slate-500" />;
            default: return <Bell {...iconProps} className="text-slate-400" />;
        }
    };

    const getNotificationIconBg = (type: NotificationType) => {
        switch (type) {
            case 'MESSAGE': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30';
            case 'RESOURCE': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30';
            case 'COMPETITION': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800/30';
            case 'ROADMAP': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30';
            case 'NEWS': return 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30';
            case 'TEAM': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30';
            case 'BADGE': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800/30';
            case 'FORUM': return 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30';
            case 'EXAM': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30';
            case 'SYSTEM': return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
            default: return 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700';
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">

            <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl ${iconColor('blue')} flex items-center justify-center`}>
                                        <Bell size={24} strokeWidth={ICON_STROKE} />
                                    </div>
                                    {i18n.t('features:notifications.title')}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 ml-14">{i18n.t('features:notifications.subtitle')}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm"
                                >
                                    <Check size={16} />
                                    {i18n.t('features:notifications.markAllRead')}
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2 mb-6 bg-white dark:bg-humg-dark-surface p-1.5 rounded-2xl w-fit border border-slate-100 dark:border-slate-800 shadow-sm">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'all'
                                    ? 'bg-humg-blue text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {i18n.t('features:notifications.filterAll')}
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'unread'
                                    ? 'bg-humg-blue text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {i18n.t('features:notifications.filterUnread')}
                            </button>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(n => (
                                        <div key={n} className="h-24 bg-white dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : notifications.length > 0 ? (
                                <>
                                    {notifications.map(noti => (
                                        <div
                                            key={noti.id}
                                            className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-colors duration-300 hover:shadow-md cursor-pointer ${!noti.isRead
                                                ? 'bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700 shadow-sm'
                                                : 'bg-slate-50 dark:bg-slate-900/50 border-transparent hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                                                }`}
                                            onClick={() => handleItemClick(noti.id, noti.link)}
                                        >
                                            {/* Unread Indicator */}
                                            {!noti.isRead && (
                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                            )}

                                            {/* Type Icon */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getNotificationIconBg(noti.type)}`}>
                                                {getNotificationIcon(noti.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className={`text-base font-bold ${!noti.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {noti.title}
                                                    </h3>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{timeAgo(noti.createdAt)}</span>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${!noti.isRead ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {noti.message}
                                                </p>
                                            </div>

                                            {/* Actions (Visible on Hover) */}
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(noti.id); }}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title={i18n.t('features:notifications.deleteTooltip')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* ── Infinite scroll sentinel ── */}
                                    <div ref={sentinelRef} className="py-2">
                                        {loadingMore && (
                                            <div className="flex justify-center py-4">
                                                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-humg-blue border-t-transparent" />
                                            </div>
                                        )}
                                        {!hasMore && notifications.length > 0 && (
                                            <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-3">
                                                {i18n.t('features:notifications.allDisplayed')}
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-20 bg-white dark:bg-humg-dark-surface rounded-[24px] border border-slate-100 dark:border-slate-800">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <Bell size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">{i18n.t('features:notifications.emptyTitle')}</h3>
                                    <p className="text-slate-500">{i18n.t('features:notifications.emptyDescription')}</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};