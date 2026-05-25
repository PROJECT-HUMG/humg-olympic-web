# Skill: News

## Feature Folder
`src/features/news/`

---

## Types — `types/news.types.ts`

| Type | Purpose |
|------|---------|
| `AuthorResponse` | `{ id, name, avatar, role }` — shared with Resource, Competition |
| `NewsQueryParams` | `{ category?, search?, page?, limit?, isFeatured? }` |
| `NewsResponse` | `{ data: NewsItem[], total, page, limit }` |
| `CreateNewsDTO` | `{ title, summary, content, categoryId, thumbnail?, contentImageUrls, isFeatured }` |
| `UpdateNewsDTO` | Extends `CreateNewsDTO` with `id`, `thumbnail?: File \| string` |
| `NewsItem` | `{ id, title, slug, summary, content?, thumbnailUrl, categoryName, author, created, published, viewCount, isFeatured }` |
| `Category` | `{ id, name, description? }` |

---

## Repository API

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getNews(params)` | GET | `/news` |
| `getFeaturedNews()` | GET | `/news?isFeatured=true` |
| `getNewsBySlug(slug)` | GET | `/news/slug/:slug` |
| `getNewsById(id)` | GET | `/news/:id` |
| `createNews(data)` | POST | `/news` (multipart) |
| `updateNews(id, data)` | PUT | `/news/:id` (multipart) |
| `deleteNews(id)` | DELETE | `/news/:id` |
| `getCategories()` | GET | `/news/categories` |
| `setFeatured(id, featured)` | PATCH | `/news/:id/featured` (Admin only) |

Singleton: `import { newsRepository } from '@/features/news/api'`

---

## Hooks

| Hook | File | Returns |
|------|------|---------|
| `useNews(params)` | `hooks/useNews.ts` | `{ news, categories, total, loading, featured, ... }` |
| `useNewsDetail(slug)` | `hooks/useNewsDetail.ts` | `{ news, loading, deleteNews, updateNews, setFeatured }` |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `NewsHero` | `components/NewsHero.tsx` | Featured news cinematic hero card |
| `NewsCard` | `components/NewsCard.tsx` | Standard news card in grid |
| `NewsRecentWidget` | `components/NewsRecentWidget.tsx` | Compact sidebar news item |
| `NewsFilters` | `components/NewsFilters.tsx` | Search + category filter bar |
| `NewsContentRenderer` | `components/NewsContentRenderer.tsx` | Renders BlockNote JSON content |
| `BlockNoteJsonRenderer` | `components/BlockNoteJsonRenderer.tsx` | Low-level BlockNote block renderer |
| `EditNewsModal` | `components/EditNewsModal.tsx` | Edit existing news modal |
| `EmptyState` | `components/EmptyState.tsx` | Empty state placeholder |
| `NewsSkeletons` | `components/NewsSkeletons.tsx` | Grid/hero/card skeleton loaders |
| `NewsDetailSkeleton` | `components/NewsDetailSkeleton.tsx` | Detail page skeleton |

---

## Pages

| Page | File | Route |
|------|------|-------|
| `NewsPage` | `pages/NewsPage.tsx` | `/news` |
| `NewsDetailPage` | `pages/NewsDetailPage.tsx` | `/news/:slug` |

---

## Design Notes
- **NewsHero**: Cinematic background (ambient blur + main image), multi-stop gradient overlays, glassmorphism meta pill
- **NewsDetailPage**: Hero banner with `rounded-[2rem]`, glassmorphism article card, no hardcoded background (inherits global)
- Content editor: BlockNote (rich text) — stored as JSON, rendered via `NewsContentRenderer`
- News creation: `PostNewsModal` (in `dashboard/`) for new articles
