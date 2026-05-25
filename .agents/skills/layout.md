---
name: layout
description: Shared layout components (Header, Footer, MainLayout, RootLayout)
---

## Components

| Component | File | Purpose |
|---|---|---|
| `Header` | `src/components/layout/Header.tsx` | Fixed top nav, theme toggle, notifications dropdown, profile dropdown, mobile menu |
| `Footer` | `src/components/layout/Footer.tsx` | Site footer with links, contact, socials |
| `MainLayout` | `src/components/layout/MainLayout.tsx` | Main wrapper: Background + Header + Outlet + Footer + AIChatWidget (lazy). Hides chrome on exam-taking pages. |
| `RootLayout` | `src/components/layout/RootLayout.tsx` | Top-level wrapper with global loading spinner overlay |
| `AppSidebar` | `src/components/layout/AppSidebar.tsx` | Authenticated desktop sidebar with primary navigation, community links, and account shortcuts |

## Types

- `NavItem` — `{ label, href }` in `types/header.types.ts`
- `FeatureItem` — `{ id, title, description, icon, link, colorClass }` in `types/header.types.ts`

## Key Patterns

- **No `import React`** — uses `react-jsx` transform (React 19.2)
- **No `React.FC`** — plain function components
- **No `React.memo`** — React 19 Compiler handles optimization
- **`lazy()` + `<Suspense>`** for code-split `AIChatWidget`
- **TW v4**: arbitrary values use bracket syntax, e.g. `z-[9999]`
- Scroll detection uses `requestAnimationFrame` throttle
- Click-outside uses `useEffect` + `mousedown` listener with refs
