
import { BroadcastRequest, NotificationQueryParams, NotificationResponse } from '@/features/notifications/types/notification.types';

export interface NotificationRepository {
    getNotifications(params: NotificationQueryParams): Promise<NotificationResponse>;

    markAsRead(id: number): Promise<boolean>;

    markAllAsRead(): Promise<boolean>;

    deleteNotification(id: number): Promise<boolean>;

    getUnreadCount(): Promise<number>;

    broadcast(data: BroadcastRequest): Promise<void>;
}
