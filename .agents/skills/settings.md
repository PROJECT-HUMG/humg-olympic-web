# Skill: Settings

## Feature Folder
`src/features/settings/`

---

## Types — `types/settings.types.ts`

| Type | Purpose |
|------|---------|
| `ChangePasswordRequest` | `{ currentPassword, newPassword, confirmPassword }` |
| `PrivacySettings` | `{ showEmail, showPhone, showUniversity, showClass, showExamHistory }` — all `boolean` |
| `NotificationPreferences` | `{ emailNotifications, systemNotifications, badgeApproval, teamInvites, competitionUpdates, resourceUpdates }` — all `boolean` |
| `LoginHistoryItem` | `{ id, ipAddress, userAgent, device, location, loginAt, status: 'SUCCESS' \| 'FAILED' }` |
| `LoginHistoryResponse` | `{ data: LoginHistoryItem[], pagination: { page, limit, totalItems, totalPages } }` |
| `DeviceSession` | `{ id, device, ipAddress, location, lastLoginAt }` — one entry per unique device (last login only) |
| `DeleteAccountRequest` | `{ password, confirmText, reason? }` |
| `SettingsApiResponse` | `{ success: boolean, message: string }` |

---

## Repository API — `api/SettingsRepository.ts` → `api/ApiSettingsRepository.ts`

| Method | HTTP | Endpoint | Notes |
|--------|------|----------|-------|
| `changePassword(data)` | PUT | `/users/settings/password` | |
| `getPrivacySettings()` | GET | `/users/settings/privacy` | Response wrapped in `{ data }` |
| `updatePrivacySettings(data)` | PUT | `/users/settings/privacy` | |
| `getNotificationPreferences()` | GET | `/users/settings/notifications` | Response wrapped in `{ data }` |
| `updateNotificationPreferences(data)` | PUT | `/users/settings/notifications` | |
| `getLoginHistory(page?, limit?)` | GET | `/users/settings/login-history?page=&limit=` | Default limit 10, pagination in response |
| `getDeviceSessions()` | GET | `/users/settings/devices` | Response wrapped in `{ data: DeviceSession[] }` — grouped by device, only latest login |
| `requestAccountDeletion(data)` | POST | `/users/settings/delete-account` | Logs user out after success |
| `cancelAccountDeletion()` | POST | `/users/settings/cancel-deletion` | |

Singleton: `import { settingsRepository } from '@/features/settings/api'`

---

## Hook — `hooks/useSettings.ts`

Single hook `useSettings()` manages all settings state. Returns:

| Key | Type | Description |
|-----|------|-------------|
| `changePassword` | `fn(data) → boolean` | |
| `changingPassword` | `boolean` | |
| `privacy` | `PrivacySettings` | Default: all `true` |
| `privacyLoading / privacySaving` | `boolean` | |
| `loadPrivacy / updatePrivacy` | `fn` | Optimistic update with revert on error |
| `notifications` | `NotificationPreferences` | Default: all `true` |
| `notificationsLoading / notificationsSaving` | `boolean` | |
| `loadNotifications / updateNotifications` | `fn` | Optimistic update with revert on error |
| `loginHistory` | `LoginHistoryItem[]` | |
| `historyPage / historyTotalPages / historyLoading` | `number / boolean` | |
| `loadLoginHistory(page?)` | `fn` | Call inside `LoginHistoryModal` on open, not on mount |
| `deviceSessions` | `DeviceSession[]` | |
| `devicesLoading` | `boolean` | |
| `loadDeviceSessions()` | `fn` | Called on mount in `SecuritySection` |
| `requestDeletion / cancelDeletion` | `fn → boolean` | `requestDeletion` calls `logout()` on success |
| `deletionLoading` | `boolean` | |

> **Important:** `loadLoginHistory` is NOT called on mount — it's called lazily when `LoginHistoryModal` opens.

---

## Components

| Component | Purpose |
|-----------|---------|
| `SettingsTab.tsx` | Tab switcher: Bảo mật / Riêng tư / Thông báo / Nguy hiểm |
| `SecuritySection.tsx` | Change password + Login History button + Device Sessions list |
| `LoginHistoryModal.tsx` | Modal triggered by button in `SecuritySection`. Loads history on open. Escape / backdrop to close. Pagination in footer. |
| `PrivacySection.tsx` | Toggle switches for `PrivacySettings` |
| `NotificationsSection.tsx` | Toggle switches for `NotificationPreferences` |
| `DangerZoneSection.tsx` | Delete account + cancel deletion flow |

### SecuritySection layout (right column order)
1. **Lịch sử đăng nhập** — button "Xem lịch sử →" opens `LoginHistoryModal`
2. **Thiết bị đã đăng nhập** — `DeviceSession` cards with skeleton loading

### LoginHistoryModal
- Receives `settings: ReturnType<typeof useSettings>` + `onClose`
- Calls `settings.loadLoginHistory(1)` in `useEffect` on mount
- Displays `LoginHistoryItem[]` with status badge (SUCCESS=green, FAILED=red)
- Device icon: `Monitor` from `lucide-react`
- Pagination: Prev/Next buttons in modal footer

---

## Pages

| Page | File | Route | Auth |
|------|------|-------|------|
| `SettingsPage` | `pages/SettingsPage.tsx` | `/settings` | Authenticated (all roles) |

---

## Integration Notes

### Privacy enforcement (Profile page)
When displaying another user's profile, respect their `PrivacySettings`:
- If `showEmail === false` → hide email
- If `showPhone === false` → hide phone
- If `showExamHistory === false` → hide "Lịch sử thi" tab
- etc.

### Account deletion flow
1. User fills `DangerZoneSection` form → `requestDeletion()` → backend schedules deletion
2. On success → `logout()` is called immediately (user is logged out)
3. If account is pending deletion and user logs back in → show "cancel deletion" option

### Device tracking (X-Device-Info header)
Frontend sends `navigator.userAgent` as `X-Device-Info` header on all login requests:
- `POST /auth/login` (email/password)
- `POST /auth/google` (Google OAuth)
- `POST /auth/google/complete` (Google signup completion)

Backend reads this header to populate `device` field in `LoginHistoryItem` and `DeviceSession`.

### Error messages
Settings errors are mapped via `getSettingsMessage(code, fallback)` from `constants/settingsMessages.ts`.
Key codes: `PASSWORD_CHANGED_SUCCESS`, `PRIVACY_UPDATED_SUCCESS`, `NOTIFICATIONS_UPDATED_SUCCESS`, `DELETION_REQUEST_SUCCESS`, `DELETION_CANCELLED_SUCCESS`.
