# Skill: Ranking

## Feature Folder
`src/features/ranking/`

---

## Types — `types/ranking.types.ts`

| Type | Purpose |
|------|---------|
| `LeaderboardEntry` | `{ rank, userId, fullName, avatarUrl, xpPoints, role?, selectedBadges: BadgeItem[] }` |
| `LeaderboardResponse` | `{ data: LeaderboardEntry[], page, limit, total }` |
| `LeaderboardQueryParams` | `{ page?, size? }` |

> `xpPoints` = experience points (điểm kinh nghiệm). `selectedBadges` uses `BadgeItem` from `auth.types.ts`.

---

## Repository API

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getLeaderboard(params)` | GET | `/ranking?page=&size=` |

Singleton: `import { rankingRepository } from '@/features/ranking/api'`

---

## Hooks

| Hook | File |
|------|------|
| `useLeaderboard(params)` | `hooks/useLeaderboard.ts` |

---

## Components & Pages

| Component/Page | File | Purpose |
|----------------|------|---------|
| `RankingPage` | `pages/RankingPage.tsx` | Main leaderboard with pagination |
| `RankingCardItem` | `components/RankingCardItem.tsx` | Individual rank row: avatar, name, badges, XP |
