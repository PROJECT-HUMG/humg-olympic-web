---
name: features-resources
description: Resource Files — browse, filter, preview, download, upload, manage documents/files
---

## Structure

```
src/features/resources/
├── api/
│   ├── ResourceRepository.ts        — Interface: CRUD, download, preview, category listing
│   ├── ApiResourceRepository.ts     — Implementation using api client (blob downloads)
│   └── index.ts                     — Barrel export (singleton resourceRepository)
├── types/
│   └── resources.types.ts           — ResourceItem, ResourceCategory, ResourceAuthor
├── hooks/
│   └── useResources.ts              — Main hook: pagination, filtering, category state
├── components/
│   ├── FileIcon.tsx (52L)           — FileIcon component + FileTypeBadge + getFileConfig utility
│   ├── ResourceCard.tsx (247L)      — Grid card with memo, user preview, manage actions
│   ├── ResourceListItem.tsx (202L)  — List row with memo, user preview, manage actions
│   ├── ResourceFilters.tsx (79L)    — Sidebar category filter with animated pill
│   ├── ResourceSkeleton.tsx (62L)   — Loading skeleton with shimmer animation
│   ├── PreviewModal.tsx (308L)      — PDF viewer (react-pdf), image preview, unsupported fallback
│   └── useDebounce.ts               — Debounce hook for search input
└── pages/
    └── ResourcesPage.tsx (543L)     — Main page: search, filters, grid/list toggle, pagination, modals
```

## Key Patterns

- No `import React` — `react-jsx` transform (React 19.2)
- No `React.FC` — plain functions with typed props (`: Props`)
- `memo()` wraps `ResourceCardComponent` and `ResourceListItemComponent`
- `ResourcesPage` uses URL search params for category, page, and search query
- `PreviewModal` uses `react-pdf` with CDN worker for PDF rendering
- `FileIcon` config map drives colors/icons/accents across Card and ListItem
- `useDebounce` hook for search input delay (500ms)
- Pagination with `PaginationControls` sub-component and `generatePageNumbers` utility
