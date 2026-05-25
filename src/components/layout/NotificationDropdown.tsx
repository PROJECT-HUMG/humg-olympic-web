import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { timeAgo } from '@/utils/timeAgo';
import { NotificationType } from '@/features/notifications/types/notification.types';
import { IconButton } from './IconButton';
import { getNotificationIcon } from './headerHelpers';
import i18n from '@/i18n';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

interface NotificationDropdownProps {
    isOpen: boolean;
    onToggle: () => void;
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    onMarkAsRead: (id: number) => void;
    onClose: () => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export const NotificationDropdown = ({
    isOpen,
    onToggle,
    notifications,
    unreadCount,
    loading,
    onMarkAsRead,
    onClose,
    dropdownRef,
}: NotificationDropdownProps) => {
    const navigate = useNavigate();

    return (
        <div className="relative" ref={dropdownRef}>
            <IconButton onClick={onToggle} active={isOpen} badge={unreadCount}>
                <Bell size={20} />
            </IconButton>

            <div
                className={`absolute right-0 top-full mt-3 w-80 xl:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden origin-top-right z-50 transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}`}
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-white">{i18n.t('common:nav.notifications')}</h3>
                    <Link to="/notifications" onClick={onClose} className="text-xs font-bold text-humg-blue hover:underline">{i18n.t('common:viewAll')}</Link>
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {loading ? (
                        <div className="p-2 space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 p-3 animate-pulse">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                                    <div className="flex-1 space-y-2 py-0.5">
                                        <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((noti) => (
                            <div
                                key={noti.id}
                                onClick={() => {
                                    onMarkAsRead(noti.id);
                                    onClose();
                                    if (noti.link) navigate(noti.link);
                                }}
                                className={`p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex gap-3 ${!noti.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                            >
                                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${!noti.isRead ? 'bg-white border-blue-100' : 'bg-slate-100 dark:bg-slate-800 border-transparent'}`}>
                                    {getNotificationIcon(noti.type)}
                                </div>
                                <div>
                                    <p className={`text-sm ${!noti.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>{noti.title}</p>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{noti.message}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{timeAgo(noti.createdAt)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center">
                            <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-500 text-sm">{i18n.t('common:nav.noNewNotifications')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
