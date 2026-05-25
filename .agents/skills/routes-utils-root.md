---
name: routes-utils-root
description: Application routes, shared utility functions, and root configuration files
---

## Routes

| File | Export | Purpose |
|---|---|---|
| `src/routes/appRoutes.tsx` | `appRoutes` | Full route tree (auth, public, protected, admin) using `lazyPage()` |
| `src/routes/HomeRouteWrapper.tsx` | `HomeRouteWrapper` | Conditionally renders Dashboard (auth) or GuestHomeView (guest) |

### Key: `ChunkErrorBoundary` in `appRoutes.tsx` auto-reloads on stale chunk errors after deploy.

## Utils

| File | Export | Purpose |
|---|---|---|
| `emailHelpers.ts` | `getMailProviderInfo` | Detects HUMG Outlook vs Gmail from email |
| `errorUtils.ts` | `extractErrorMessage`, `extractErrorCode`, `extractErrorStatus` | Safe error message/code/status extraction |
| `forumHelpers.ts` | `canEditDelete` | Permission check: author or admin |
| `iconStyles.ts` | `iconColor`, `ICON_STROKE`, `IconColorName` | Flat 2D icon color palette (10 colors), stroke width |
| `mentionHelpers.ts` | `renderContentWithMentions` | Parse `@[userId]` and legacy `@Name` mentions → React nodes |
| `newsHelpers.ts` | `newsAuthorToPreviewAuthor` | Maps news API author → `Author` shape |
| `rankingHelpers.tsx` | `RANK_TIERS`, `getRankTier`, `RankedUsername`, `RankBadge` | Codeforces-style ranking (8 tiers, XP-based) |
| `resourceHelpers.ts` | `resourceAuthorToPreviewAuthor` | Maps resource API author → `Author` shape |
| `sanitize.ts` | `sanitizeHtml` | DOMPurify-based HTML sanitizer |
| `teamHelpers.tsx` | `getRoleBadge`, `getAwardLabel`, `sortMembersByAward` | Team role badges and award labels |
| `timeAgo.ts` | `timeAgo` | Vietnamese relative time ("vừa xong", "5 phút trước") |
| `validation.ts` | `AuthValidation` | Email/password validators |

## Root Files

| File | Purpose |
|---|---|
| `src/App.tsx` | Root app: `AuthProvider` → `AppLogicWrapper` → `RouterProvider` + `SimpleToaster` |
| `src/index.tsx` | Entry point: `StrictMode` wrapping `App` |
| `src/index.css` | TW v4 theme, custom utilities, scrollbar, dropdown components |
| `src/vite-env.d.ts` | Vite environment type augmentation |
| `index.html` | SEO meta tags, Google Fonts (Lexend), OG/Twitter cards |
| `vite.config.ts` | Vite 7 config: dev proxy, ES2023 target, manual chunks, `@/` alias |
| `tsconfig.json` | TS strict, ES2023, bundler resolution, `@/` path alias |

## Key Patterns

- **No `import React`** — `react-jsx` transform
- **No `React.FC`** — plain functions with typed props
- **No `React.lazy`** — `lazy` from named import
- **No `React.StrictMode`** — `StrictMode` from named import
- **No `React.createElement`** — `createElement` from named import
- **Type imports** — `type ReactNode`, `type MouseEvent`
- **No JSDoc comments** — functions are self-documenting via TypeScript types
