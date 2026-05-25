---
name: features-notifications
description: Notification system — paginated list, mark read, delete, type-based icons
---

## Structure

```
src/features/notifications/
├── api/
│   ├── NotificationRepository.ts        — Interface: list, markRead, markAllRead, delete, unreadCount
│   ├── ApiNotificationRepository.ts     — Implementation using api client
│   └── index.ts                         — Barrel export (singleton notificationRepository)
├── types/
│   └── notification.types.ts            — NotificationItem, NotificationType, NotificationFilter
├── hooks/
│   └── useNotifications.ts              — Hook: fetch, filter (all/unread), mark read, delete, pagination
└── pages/
    └── NotificationsPage.tsx (193L)     — Main page: header, filters, notification list, empty state
```

## Key Patterns

- No `import React` — `react-jsx` transform (React 19.2)
- No `React.FC` — plain functions
- `getNotificationIcon(type)` and `getNotificationIconBg(type)` switch-based icon/color mapping
- Notification types: MESSAGE, RESOURCE, COMPETITION, ROADMAP, NEWS, TEAM, BADGE, FORUM, EXAM, SYSTEM
- Filter: 'all' | 'unread' with pill-style toggle
- Unread indicator: red dot on left side
- Hover actions: delete button appears on hover
- Uses `timeAgo()` utility for relative timestamps
- Uses `iconColor()` and `ICON_STROKE` from shared icon utils
