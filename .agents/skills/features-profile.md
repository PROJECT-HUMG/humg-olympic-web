---
name: features-profile
description: User profile — view/edit profile, avatar/background upload, badges, exam history, badge requests
---

## Structure

```
src/features/profile/
├── components/
│   ├── ProfileSkeletons.tsx (125L)     — ProfileSkeleton, OverviewSkeleton, BadgesSkeleton, RequestsSkeleton, SettingsSkeleton
│   ├── UserPreviewCard.tsx (168L)      — Hover preview card, portal-rendered, smart positioning
│   ├── MyBadgeRequestsTab.tsx (240L)   — Badge requests list (StatusBadge, ImagePreviewModal, RequestCard)
│   ├── InfoField.tsx (47L)             — Editable info field with icon
│   └── ExamHistoryTab.tsx (185L)       — Exam attempt history with stats and pagination
└── pages/
    └── ProfilePage.tsx (745L)          — Main profile page, all tabs, avatar/bg upload, badge management
```

## Key Patterns

- No `import React` — `react-jsx` transform (React 19.2)
- No `React.FC` — plain functions with typed props
- `ChangeEvent` imported from react for file input handlers
- `ProfilePage.tsx` (745L) — skeletons extracted to `ProfileSkeletons.tsx`
  - Tightly coupled state: avatar upload, background upload, profile editing, badge toggle
  - **Not splitting** due to heavy state dependencies between sections
- `UserPreviewCard` uses `createPortal` to render at document.body level
- `UserPreviewCard` uses `useLayoutEffect` for smart viewport-aware positioning
- `MyBadgeRequestsTab` has 5 sub-components (StatusBadge, ImagePreviewModal, RequestCard, RequestSkeleton, main)
- `ExamHistoryTab` fetches from `examAttemptRepository` with local pagination
- Profile supports: own profile (editing, upload, settings) vs other user profile (read-only)
- Tab system: overview, badges, exam-history, my-requests, settings
