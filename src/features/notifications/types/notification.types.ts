export type NotificationType =
  | "SYSTEM"
  | "MESSAGE"
  | "RESOURCE"
  | "COMPETITION"
  | "TEAM"
  | "BADGE"
  | "FORUM"
  | "ROADMAP"
  | "NEWS"
  | "EXAM";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface NotificationResponse {
  data: Notification[];
  unreadCount: number;
  total: number;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  filter?: "all" | "unread";
}

export interface BroadcastRequest {
  title: string;
  message: string;
  sendEmail?: boolean;
}
