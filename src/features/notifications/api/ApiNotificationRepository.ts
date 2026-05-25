import { NotificationRepository } from './NotificationRepository';
import { BroadcastRequest, NotificationQueryParams, NotificationResponse } from '@/features/notifications/types/notification.types';
import { api } from '@/lib/api/apiClient';

export class ApiNotificationRepository implements NotificationRepository {

    async getNotifications(params: NotificationQueryParams): Promise<NotificationResponse> {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.filter) query.append('filter', params.filter);

        return api.get<NotificationResponse>(`/notifications?${query.toString()}`);
    }

    async markAsRead(id: number): Promise<boolean> {
        await api.put(`/notifications/${id}/read`, {});
        return true;
    }

    async markAllAsRead(): Promise<boolean> {
        await api.put(`/notifications/read-all`, {});
        return true;
    }

    async deleteNotification(id: number): Promise<boolean> {
        await api.delete(`/notifications/${id}`);
        return true;
    }

    async getUnreadCount(): Promise<number> {
        const res = await api.get<{ count: number }>(`/notifications/unread-count`);
        return res.count;
    }

    async broadcast(data: BroadcastRequest): Promise<void> {
        await api.post('/notifications/broadcast', data);
    }
}