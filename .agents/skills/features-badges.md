---
name: features-badges
description: Badge display, request modal, verified badges, and badge management hooks
---

## Components

| File | Export | Purpose |
|---|---|---|
| `components/BadgeFlat.tsx` | `BadgeFlat` | Flat badge display with subject icon, rank color, lock overlay, selection checkmark |
| `components/BadgeRequestModal.tsx` | `BadgeRequestModal` | Modal for requesting badges with image upload proof |
| `components/VerifiedBadge.tsx` | `VerifiedBadge`, `StudentBadges` | Role verification checkmarks (admin=red, lecturer=blue) + student badge row with glow animation |

### BadgeFlat Visual Logic
- `iconUrl` → custom image
- `type === 'NATIONAL'` → Award Award with halo glow per level
- `type === 'SCHOOL'` → Rank number (1–4)
- Default → Star icon

### StudentBadges Glow
- National badges get animated `badge-glow-pulse` keyframe
- Gold (level 4), Silver (3), Bronze (2) each have distinct glow colors

## Hooks

| File | Export | Purpose |
|---|---|---|
| `hooks/useBadgeRequests.ts` | `useBadgeRequests` | Full badge CRUD: request, fetch, review, bulk grant, revoke |

### Hook API
- **User**: `requestBadge`, `fetchMyRequests`
- **Admin**: `fetchPendingRequests`, `reviewRequest`, `bulkGrantBadges`, `grantBadgeToUser`, `revokeBadge`, `getUserBadges`

## Types

| File | Purpose |
|---|---|
| `types/userBadge.types.ts` | `UserBadgeResponse`, `RequestBadgePayload`, `ReviewBadgeRequest`, `BulkGrantBadgeResult`, pagination types |

## Key Patterns

- **No `import React`** — `react-jsx` transform
- **No `React.FC`** — plain functions with typed props
- **Named type imports** — `type ChangeEvent`, `type CSSProperties`
- **`withLoading` wrapper** — generic async helper with error toast
