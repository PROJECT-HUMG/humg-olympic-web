---
name: features-ranking
description: Leaderboard/ranking — paginated list, ranking cards, user preview integration
---

## Structure

```
src/features/ranking/
├── api/
│   ├── RankingRepository.ts         — Interface: getLeaderboard (paginated)
│   ├── ApiRankingRepository.ts      — Implementation using api client
│   └── index.ts                     — Barrel export (singleton rankingRepository)
├── types/
│   └── ranking.types.ts             — LeaderboardEntry, LeaderboardResponse, SelectedBadge
├── hooks/
│   └── useLeaderboard.ts            — Hook: pagination, loading state, fetch on page change
├── components/
│   └── RankingCardItem.tsx (207L)   — RankIcon, RankBadge, main card with row/card layouts
└── pages/
    └── RankingPage.tsx (177L)       — LeaderboardSkeleton, HelpTooltip, main page with pagination
```

## Key Patterns

- No `import React` — `react-jsx` transform (React 19.2)
- No `React.FC` — plain functions with typed props
- `RankingCardItem` supports two layouts: `'card'` (landing page) and `'row'` (ranking page)
- `RankingCardItem` accepts optional `displayValue` to override XP display (e.g. exam score)
- UserPreviewCard integration via `useUserPreview` hook + `convertToAuthor` helper
- `onHoverStart(entry, e: MouseEvent)` — native MouseEvent from react, not React.MouseEvent
- Top 3 entries get special styling (gradient bg, colored rings, accent dot)
- `handleUserClick` currently a no-op (navigate commented out)
