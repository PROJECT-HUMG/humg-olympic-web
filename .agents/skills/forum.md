# Skill: Forum

## Feature Folder
`src/features/forum/`

---

## Types — `types/forum.types.ts`

Key types: `Author`, `ForumPost`, `Comment`, `Category`, `ForumQueryParams`, `ForumResponse`

> `Author` interface from this file is re-used by news and other features for user preview.

---

## Repository API

| Method | Endpoint |
|--------|----------|
| `getPosts(params)` | `GET /forum` |
| `getPostById(id)` | `GET /forum/:id` |
| `createPost(data)` | `POST /forum` |
| `updatePost(id, data)` | `PUT /forum/:id` |
| `deletePost(id)` | `DELETE /forum/:id` |
| `likePost(id)` | `POST /forum/:id/like` |
| `addComment(postId, data)` | `POST /forum/:postId/comments` |
| `deleteComment(postId, commentId)` | `DELETE /forum/:postId/comments/:commentId` |
| `getCategories()` | `GET /forum/categories` |

Singleton: `import { forumRepository } from '@/features/forum/api'`

---

## Hooks

| Hook | File |
|------|------|
| `useForum(params)` | `hooks/useForum.ts` |
| `usePostDetail(id)` | `hooks/usePostDetail.ts` |

---

## Components & Pages

| Component/Page | File | Purpose |
|----------------|------|---------|
| `ForumPage` | `pages/ForumPage.tsx` | Post list + filters |
| `PostCard` | `components/PostCard.tsx` | Individual post card |
| `PostDetailModal` | `components/PostDetailModal.tsx` | Post detail with comments |
| `CreatePostModal` | `components/CreatePostModal.tsx` | New post form |
| `CategorySidebar` | `components/CategorySidebar.tsx` | Category navigation |
