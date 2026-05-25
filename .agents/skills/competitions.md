# Skill: Competitions

## Feature Folder
`src/features/competitions/`

---

## Types — `types/competition.types.ts`

| Type | Purpose |
|------|---------|
| `CompetitionType` | `'ONLINE' \| 'OFFLINE'` |
| `CompetitionStatus` | e.g. `'UPCOMING' \| 'ONGOING' \| 'ENDED'` |
| `Subject` | `{ id, name, color? }` — shared with Exams |
| `Prize` | `{ id, rankName, prizeValue, quantity }` |
| `TimelineEvent` | `{ id, title, eventTime, description, isCompleted }` |
| `CompetitionSummary` | List-view fields |
| `CompetitionDetail` | Extends Summary: `{ ..., summary, content?, rules?, isRegistered, timeline, prizes, examId?, examTitle? }` |
| `CreateCompetitionRequest` | Create payload incl. `examId?` |
| `CompetitionUpdateRequest` | Same shape as create incl. `examId?` |
| `CompetitionQueryParams` | Filters: `page, limit, search, subjectId, status, type` |

### examId on CompetitionDetail
Optional field linking to an exam from the Question Bank:
- Set via `EditCompetitionModal` (exam picker)
- Displayed as "Đề thi trực tuyến" sidebar card on `CompetitionDetailPage`
- Backend spec: see `BACKEND_EXAM_INTEGRATION_SPEC.md`

---

## Repository API

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getCompetitions(params)` | GET | `/competitions` |
| `getCompetitionDetail(id)` | GET | `/competitions/:id` |
| `createCompetition(data, image?)` | POST | `/competitions` (multipart) |
| `updateCompetition(id, data, image?)` | PUT | `/competitions/:id` (multipart) |
| `deleteCompetition(id)` | DELETE | `/competitions/:id` |
| `registerForCompetition(id)` | POST | `/competitions/:id/register` |
| `setFeatured(id, isFeatured)` | PUT | `/competitions/:id/featured` |
| `getSubjects()` | GET | `/competitions/subjects` |

Singleton: `import { competitionRepository } from '@/features/competitions/api'`

---

## Hooks

| Hook | File |
|------|------|
| `useCompetitions(params)` | `hooks/useCompetitions.ts` |
| `useCompetitionDetail(id)` | `hooks/useCompetitionDetail.ts` — includes `updateCompetition`, `deleteCompetition`, `register`, `setFeatured` |

---

## Components & Pages

| Component/Page | File | Purpose |
|----------------|------|---------|
| `CompetitionsPage` | `pages/CompetitionsPage.tsx` | List + filter |
| `CompetitionDetailPage` | `pages/CompetitionDetailPage.tsx` | Detail, tabs (info/rules/prizes/teams), sidebar with exam card |
| `CompetitionDetailSkeleton` | `components/` | Loading skeleton |
| `CompetitionBadges` | `components/CompetitionBadges.tsx` | `<SubjectBadge>`, `<StatusBadge>` |
| `EditCompetitionModal` | `dashboard/components/EditCompetitionModal.tsx` | Edit form with exam picker |

---

## Styling
- Subject color: pulled from `competition.subjectColor`
- Status badges in `CompetitionBadges`
- `humg-blue` = primary brand color
