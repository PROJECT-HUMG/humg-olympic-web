---
name: contexts-hooks-lib
description: Core contexts, shared hooks, and API infrastructure
---

## Contexts

| File | Export | Purpose |
|---|---|---|
| `src/contexts/AuthContext.tsx` | `AuthProvider`, `useAuth` | Auth state, login/logout, Google OAuth, session refresh, profile sync |

### AuthContext API
- `user`, `accessToken`, `isAuthenticated`, `isLoading`
- `login(email, password)`, `logout()`
- `loginWithGoogle(idToken)` → `GoogleLoginResult`
- `completeGoogleSignup(data)` → `GoogleCompleteResult`
- `requestEduVerify(eduEmail, accessToken?)`
- `setUserFromAuthResponse(auth)`, `refreshUserProfile()`
- Listens for `auth:token_refreshed` event to auto-refresh profile

## Hooks

| File | Export | Purpose |
|---|---|---|
| `src/hooks/useUserPreview.ts` | `useUserPreview<T>` | Hover preview with show/hide delays, position tracking, preview card mouse handling |

## Lib

| File | Export | Purpose |
|---|---|---|
| `src/lib/router-utils.tsx` | `lazyPage()` | React Router `lazy` prop wrapper with optional `extraProps` injection |
| `src/lib/api/api.config.ts` | `API_BASE_URL` | Dev proxy vs prod URL |
| `src/lib/api/apiClient.ts` | `api`, `authenticatedFetch`, `ApiError`, `suppressAutoLogout` | Fetch-based HTTP client with auth, token refresh, 401 retry |
| `src/lib/api/errorMapping.ts` | `ERROR_MESSAGES`, `getErrorMessage` | Vietnamese error code → message mapping |
| `src/lib/api/index.ts` | barrel | Re-exports all API utilities |

## Key Patterns

- **No `import React`** — uses `react-jsx` transform
- **No `React.FC`** — plain functions with type annotations on destructured params
- **Timer refs** — `ReturnType<typeof setTimeout>` (not `NodeJS.Timeout`)
- **Type imports** — `type ReactNode`, `type ComponentType` from `'react'`
- **API client** — `RefreshController` class handles token refresh + auto-logout
- Events: `auth:logout`, `auth:token_refreshed`, `profile:updated`
