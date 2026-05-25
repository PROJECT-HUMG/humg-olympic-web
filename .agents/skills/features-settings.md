---
name: features-settings
description: User settings — security, privacy, notifications, account deletion
---

## Structure

```
src/features/settings/
├── api/
│   ├── SettingsRepository.ts        — Interface for all settings operations
│   ├── ApiSettingsRepository.ts     — Implementation using api client
│   └── index.ts                     — Barrel export (singleton settingsRepository)
├── types/
│   └── settings.types.ts            — ChangePassword, Privacy, Notifications, LoginHistory, DeviceSession, Deletion types
├── constants/
│   └── settingsMessages.ts          — Backend error code → Vietnamese message mapping
├── hooks/
│   └── useSettings.ts               — All settings state + CRUD with optimistic updates
├── components/
│   ├── SettingsTab.tsx               — Sub-tab navigation (security/privacy/notifications/danger)
│   ├── SecuritySection.tsx           — Change password + device sessions + login history button
│   ├── PrivacySection.tsx            — Toggle switches for profile visibility
│   ├── LoginHistoryModal.tsx         — Paginated login history modal
│   ├── NotificationsSection.tsx      — Toggle switches for notification preferences
│   └── DangerZoneSection.tsx         — Account deletion with confirmation modal
└── (no pages/ — SettingsTab is embedded in profile page)
```

## Key Patterns

- No `import React` — `react-jsx` transform (React 19.2)
- No `React.FC` — plain functions with typed props
- Named type imports — `type ReactNode`, `type FormEvent`, `type MouseEvent`
- `useSettings` hook centralizes ALL settings state (password, privacy, notifications, history, devices, deletion)
- Optimistic updates for privacy + notification toggles
- `getSettingsMessage(code)` maps backend error codes to Vietnamese UI messages
- `eslint-disable-next-line react-hooks/exhaustive-deps` kept for intentional empty-deps effects
