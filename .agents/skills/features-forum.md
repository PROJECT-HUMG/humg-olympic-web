---
name: features-forum
description: Forum feature — posts, comments, categories, mention input, like debounce, report
---

## Structure

| Path | Purpose |
|---|---|
| `api/ForumRepository.ts` | Interface: CRUD for posts, comments, categories, likes, **reportPost** |
| `api/ApiForumRepository.ts` | Implementation using `api` client |
| `api/index.ts` | Barrel — exports singleton `forumRepository` |
| `types/forum.types.ts` | `Post`, `Comment`, `CommentTree`, `Author`, `Category`, DTOs, `PagedResponse`, **`ReportReason`**, **`CreateReportDTO`** |

## Hooks

| File | Export | Purpose |
|---|---|---|
| `hooks/useForum.ts` | `useForum(limit)` | Posts list, categories, search, pagination, like debounce, CRUD |
| `hooks/usePostDetail.ts` | `usePostDetail(postId)` | Single post with comments (paginated), comment tree, like debounce, reply, edit, delete |

### Like Debounce Pattern
Both hooks use `useRef<Record<number, ReturnType<typeof setTimeout>>>` to debounce like toggles (600ms). On quick double-tap the request is cancelled, not doubled.

## Components

| File | Export | Purpose |
|---|---|---|
| `components/CategorySidebar.tsx` | `CategorySidebar` | Category filter nav with icon mapping |
| `components/CreatePostModal.tsx` | `CreatePostModal` | Create/edit post modal with tag extraction |
| `components/MentionInput.tsx` | `MentionInput`, `createReplyMention` | Textarea with @mention dropdown, keyboard nav, tracked mentions → `@[userId]` conversion |
| `components/PostCard.tsx` | `PostCard` | Post card with author preview, like, share, edit/delete, **onReport** |
| `components/PostDetailModal.tsx` | `PostDetailModal` | Full post view, threaded comments, inline reply, edit/delete, **Flag report button** |

## Pages

| File | Export | Purpose |
|---|---|---|
| `pages/ForumPage.tsx` | `ForumPage` | Main forum page with category sidebar, search, post list, detail modal, **report modal** |

## Key Patterns

- **No `import React`** — `react-jsx` transform
- **No `React.FC`** — plain functions with typed props
- **Named type imports** — `type ChangeEvent`, `type KeyboardEvent`, `type ElementType`, `type MouseEvent as ReactMouseEvent`
- **`ReturnType<typeof setTimeout>`** — avoids `NodeJS.Timeout`
- **DOM vs React MouseEvent** — `document.addEventListener` callbacks use native DOM `MouseEvent`, JSX handlers use `ReactMouseEvent` alias
