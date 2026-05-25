---
name: features-news
description: News system — list, detail, create/edit, BlockNote rendering, categories, hero banner
---

## Structure

```
src/features/news/
├── api/
│   ├── NewsRepository.ts               — Interface: list, detail, create, update, delete, categories
│   ├── ApiNewsRepository.ts            — Implementation using api client
│   └── index.ts                        — Barrel export (singleton newsRepository)
├── types/
│   └── news.types.ts                   — NewsItem, Category, CreateNewsDTO, UpdateNewsDTO
├── hooks/
│   ├── useNews.ts                      — List: pagination, search, category filter, featured
│   └── useNewsDetail.ts                — Detail: fetch, setFeatured, delete, refresh
├── components/
│   ├── BlockNoteJsonRenderer.tsx (289L) — Custom BlockNote JSON → JSX (lists, tables, code, images, media)
│   ├── EditNewsModal.tsx (232L)         — Full edit form: title, summary, body (BlockNote editor), thumbnail
│   ├── NewsHero.tsx (218L)             — Featured news hero banner with image + author preview
│   ├── NewsCard.tsx (145L)             — News card with thumbnail, author, category, views
│   ├── NewsSkeletons.tsx (101L)        — Card/Hero/Grid/BentoGrid skeleton loaders
│   ├── NewsFilters.tsx (78L)           — Search + category pills + post button
│   ├── NewsDetailSkeleton.tsx (60L)    — Detail page loading skeleton
│   ├── NewsContentRenderer.tsx (20L)   — Wrapper for BlockNoteJsonRenderer
│   └── EmptyState.tsx (14L)            — Empty search result
└── pages/
    ├── NewsPage.tsx (175L)             — List page: hero + filters + grid + pagination
    └── NewsDetailPage.tsx (321L)       — Detail page: hero banner + prose content + toolbar
```

## Key Patterns

- No `import React` — `react-jsx` transform (React 19.2)
- No `React.FC` — plain functions with typed props
- `ReactNode`, `Fragment`, `useMemo` imported directly from 'react' in BlockNoteJsonRenderer
- `ChangeEvent`, `FormEvent` imported from 'react' in EditNewsModal
- `SyntheticEvent` imported from 'react' in NewsCard
- `RefObject` imported from 'react' in NewsPage
- `BlockNoteJsonRenderer` is a custom read-only renderer (no BlockNoteView dependency for display)
- `EditNewsModal` uses BlockNote editor (write mode) with image upload via `/news/upload-image`
- `useUserPreview` hook + `UserPreviewCard` portal used in NewsHero, NewsCard, NewsDetailPage
- `newsAuthorToPreviewAuthor` maps news author type → forum Author type for preview
