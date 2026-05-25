# Skill: Team Management

## Feature Folder
`src/features/team/`

---

## Types — `types/team.types.ts`

Key types: `Team`, `TeamMember`, `TeamSummary`, `CreateTeamRequest`, `TeamQueryParams`

---

## Repository API

Singleton: `import { teamRepository } from '@/features/team/api'`

Key endpoints: CRUD for teams, member management (add, remove, change role), search users.

---

## Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useTeam` | `hooks/useTeam.ts` | Team CRUD + member ops |
| `useTeamPageLogic` | `hooks/useTeamPageLogic.ts` | Page-level state (selected team, mobile layout) |
| `useUserSearch` | `hooks/useUserSearch.ts` | User search for adding members |

---

## Components & Pages

| Component/Page | File | Purpose |
|----------------|------|---------|
| `TeamManagementPage` | `pages/TeamManagementPage.tsx` | Main page: sidebar + detail |
| `TeamSidebar` | `components/TeamSidebar.tsx` | Team list sidebar |
| `TeamDetailSection` | `components/TeamDetailSection.tsx` | Selected team details |
| `TeamMemberList` | `components/TeamMemberList.tsx` | Member list with role management |
| `CreateTeamModal` | `components/CreateTeamModal.tsx` | Create team form |
| `AddMemberModal` | `components/AddMemberModal.tsx` | Add member with user search |
| `TeamSettingsModal` | `components/TeamSettingsModal.tsx` | Team settings/edit |
| `EmptyTeamState` | `components/EmptyTeamState.tsx` | Empty state |
| `TeamDetailSkeleton` | `components/TeamDetailSkeleton.tsx` | Skeleton loader |

---

## Notes
- Mobile: auto-focus disabled to prevent UX bugs on small screens
- Team sidebar and detail use responsive layout (sidebar hidden on mobile when team selected)
