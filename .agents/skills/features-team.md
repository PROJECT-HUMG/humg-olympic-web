---
name: features-team
description: Team management — team CRUD, member management, settings, sidebar
---

## Structure

```
src/features/team/
├── api/
│   ├── TeamManagementRepository.ts  — Interface for team CRUD + member ops
│   ├── ApiTeamManagementRepository.ts — Implementation using api client
│   └── index.ts                     — Barrel export (singleton teamRepository)
├── types/
│   └── team.types.ts                — Team, TeamMember, TeamStatus, payloads
├── hooks/
│   ├── useTeam.ts                   — Teams list + active team + detail fetch
│   ├── useTeamPageLogic.ts          — Page-level logic: modals, handlers, permissions
│   └── useUserSearch.ts             — Debounced user search for add-member
├── components/
│   ├── AddMemberModal.tsx           — Search + select user + role picker modal
│   ├── CreateTeamModal.tsx          — Create team form with avatar upload
│   ├── EmptyTeamState.tsx           — Illustration placeholder
│   ├── TeamDetailSection.tsx        — Tabs (overview/members), stats, actions
│   ├── TeamDetailSkeleton.tsx       — Loading skeleton for detail section
│   ├── TeamMemberList.tsx           — Lecturer cards + student cards grid
│   ├── TeamSettingsModal.tsx        — Edit name/status/desc, avatar, danger zone
│   └── TeamSidebar.tsx              — Filterable team list with active highlight
└── pages/
    └── TeamManagementPage.tsx       — Split-view layout (sidebar + detail), mobile responsive
```

## Key Patterns

- No `import React` — `react-jsx` transform (React 19.2)
- No `React.FC` — plain functions with typed props
- Named type imports — `type MouseEvent`, `type ChangeEvent`, `type FormEvent`, `type UIEvent`
- `memo(TeamSidebar)` — named import instead of `React.memo`
- `onRemove?.()` — optional chaining for optional callbacks
- `useTeamPageLogic` centralizes all modal state + API handlers
- `useUserSearch` uses 300ms debounce for search API calls
