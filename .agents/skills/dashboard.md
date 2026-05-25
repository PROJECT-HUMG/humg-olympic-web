# Skill: Dashboard

## Feature Folder
`src/features/dashboard/`

---

## Overview
Role-based dashboard: Admin, Lecturer, Student views via tab system.

---

## Types — `types/dashboard.types.ts`

Key types: `DashboardStats`, `DashboardEvent`, `DashboardPendingTask`, `DashboardTeamSummary`, `DashboardQueryParams`, `DashboardData`

### Admin Types — `src/features/admin/types/admin.types.ts`
Key report types: `AdminReport`, `ReportStatus` (`PENDING` | `RESOLVED` | `DISMISSED`)

---

## Hooks

| Hook | File |
|------|------|
| `useDashboard` | `hooks/useDashboard.ts` |
| `useDashboardActions` | `hooks/useDashboardActions.ts` — includes **`getReports`**, **`resolveReport`** |

---

## Shared Components — `components/DashboardComponents.tsx`

| Component | Purpose |
|-----------|---------|
| `AnimatedCounter` | Smooth number count-up animation |
| `StatusBadge` | Colored status label (info/success/warning/error) |
| `PriorityIndicator` | Colored dot for task priority (high/medium/low) |
| `ProgressRing` | SVG circular progress ring |
| `GlowCard` | Card with colored glow border effect |
| `AwardBadge` | Badge display with level-based styling |
| `colorTokens` | Single source of truth for `icon`, `bg`, `action` color maps |
| `ColorKey` | Type: `'blue' \| 'green' \| 'purple' \| 'amber' \| 'red' \| 'cyan'` |
| `DashboardStatCard` | Unified stat card with hover gradient + `AnimatedCounter` |
| `DashboardTabBar` | Tab navigation bar with badge counts + urgent pulse indicator |
| `DashboardTab<T>` | Tab item interface (key, label, icon, badge?, urgent?) |
| `DashboardQuickAction` | Quick action button with color-coded icon |
| `DashboardTaskCard` | Task card with `PriorityIndicator` + complete button |
| `DashboardActivityItem` | Activity timeline item with colored dot + timestamp |
| **Skeletons** | `StatCardSkeleton`, `TeamCardSkeleton`, `TaskCardSkeleton`, `EventCardSkeleton` |

## Layout Components — `components/DashboardLayout.tsx`

| Component | Purpose |
|-----------|---------|
| `DashboardLayout` | Page wrapper with greeting header |
| `BentoCard` | Base card container (rounded, bordered) |
| `SectionHeader` | Section title + optional subtitle + action/viewAll |
| `EmptyState` | Empty state with icon, title, description, action |

---

## Dashboard Views — `components/views/dashboard/`

| Component | File | Purpose |
|-----------|------|---------|
| `AdminDashboard` | `AdminDashboard.tsx` | System admin: stats, approvals, **reports**, data management, badge review, exams, activity |
| `LecturerDashboard` | `LecturerDashboard.tsx` | Lecturer: team stats, quick actions, tasks, schedule, exams |
| `StudentDashboard` | `StudentDashboard.tsx` | Student: stats, quick actions, teams, events, activities |
| `DashboardPage` | `pages/DashboardPage.tsx` | Main entry: routes to role-based view |
| `DashboardSkeleton` | `components/DashboardSkeleton.tsx` | Loading skeleton |

---

## Modals

| Component | File | Purpose |
|-----------|------|---------|
| `CreateCompetitionModal` | `components/` | Create competition |
| `EditCompetitionModal` | `components/` | Edit competition (includes exam picker) |
| `CreateEventModal` | `components/` | Create event |
| `EditEventModal` | `components/` | Edit event |
| `PostNewsModal` | `components/` | Create news article |
| `UploadResourceModal` | `components/` | Upload resource |
| `UpdateResourceModal` | `components/` | Update resource |
| `TeamCard` | `components/` | Team summary card |

## Admin Modals — `components/admin/`

| Component | Purpose |
|-----------|---------|
| `AdminManagementModals` | CRUD modals for badges, users, universities, faculties, subjects, etc. |
| `AdminGrantBadgeModal` | Manual badge grant |
| `AdminBadgeExcelUploadModal` | Bulk badge grant via Excel |
| `AdminUserBadgesModal` | View/revoke user badges |
| `AdminBadgeReviewTab` | Review badge requests |

## Admin Reports API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `getReports(params)` | `GET /admin/reports?page&limit&status` | List reports (paginated, filterable by status) |
| `resolveReport(id, data)` | `PUT /admin/reports/{id}` | Resolve/dismiss a report with action |

### AdminOverviewTab
- Stat card "Báo cáo" shows pending report count (replaces old "Cảnh báo")
- "Báo cáo từ diễn đàn" section shows up to 5 reports with reporter avatar, post title, reason badge
