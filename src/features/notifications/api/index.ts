
import { NotificationRepository } from './NotificationRepository';
import { ApiNotificationRepository } from './ApiNotificationRepository';

export const notificationRepository: NotificationRepository = new ApiNotificationRepository();