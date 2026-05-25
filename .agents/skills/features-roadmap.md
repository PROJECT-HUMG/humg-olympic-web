---
name: features-roadmap
description: Learning roadmap — CRUD, timeline view, chapter detail, editor with stages/resources
---

## Structure

```
src/features/roadmap/
├── api/
│   ├── RoadmapRepository.ts         — Interface for roadmap CRUD + stage operations
│   ├── ApiRoadmapRepository.ts      — Implementation using api client
│   └── index.ts                     — Barrel export (singleton roadmapRepository)
├── types/
│   └── roadmap.types.ts             — RoadmapSummary, RoadmapDetail, RoadmapStage, StageResource, UpdateRoadmapRequest
├── components/
│   ├── RoadmapEditorPage.tsx (937L) — Full editor: Sk, ImageUploadInput, ExamInfiniteSelect, TeamInfiniteSelect, Field, main form
│   ├── ChapterDetailPage.tsx (415L) — Chapter view: ChapterDetailSkeleton, ResourceRow, ResourceSection, main detail page
│   └── RoadmapStatsModal.tsx (133L) — Team member progress stats modal
└── pages/
    └── RoadmapPage.tsx (748L)       — Listing: RoadmapIcon, skeletons, DeleteConfirmModal, SubjectItem/Chips, TimelineMilestone, TimelineView, main page
```

## Key Patterns

- No `import React` — `react-jsx` transform (React 19.2)
- No `React.FC` — plain functions with typed props
- Named type imports — `type ElementType`, `type ChangeEvent`, `type ReactNode`
- `ReactDOM.createPortal` kept in `ExamInfiniteSelect` for dropdown portal
- Large files (937L/748L) have tightly coupled sub-components sharing props/callbacks — not split
- `RoadmapPage` uses URL-based nav for chapter detail view
- `RoadmapEditorPage` uses infinite scroll selects for exams/teams
