---
name: ui-components
description: Shared UI primitives (Background, Toast, Modal, Pagination, etc.)
---

## Components

| Component | File | Purpose |
|---|---|---|
| `Background` | `src/components/ui/Background.tsx` | Fixed full-screen animated blob background with noise texture |
| `GlobalSpinner` | `src/components/ui/GlobalSpinner.tsx` | Full-screen spinner for loading states |
| `Logo` | `src/components/ui/Logo.tsx` | HUMG Olympic logo, supports `horizontal`/`vertical` variants |
| `MagneticWrapper` | `src/components/ui/MagneticWrapper.tsx` | Magnetic hover effect wrapper using framer-motion |
| `ConfirmModal` | `src/components/ui/ConfirmModal.tsx` | Confirm dialog with `danger`/`info`/`warning` variants |
| `ConstructionView` | `src/components/ui/ConstructionView.tsx` | 404 / under-construction placeholder page |
| `Toast` | `src/components/ui/Toast.tsx` | Toast notification system (observer pattern, stacked UI) |
| `PaginationControls` | `src/components/ui/PaginationControls.tsx` | Paginated navigation with ellipsis |
| `AsyncSearchableSelect` | `src/components/ui/AsyncSearchableSelect.tsx` | Async dropdown with search, infinite scroll, debounce |

## Key Patterns

- **No `import React`** — uses `react-jsx` transform
- **No `React.FC`** — plain functions with `Props` type annotation on destructured params
- **No `React.memo`** — React 19 Compiler auto-optimizes
- **Named type imports** — `type ReactNode`, `type ElementType`, `type MouseEvent` from `'react'`
- **DOM event handlers** — use `Event` type (not `React.MouseEvent`) for `addEventListener`
- **Timer refs** — use `ReturnType<typeof setTimeout>` (not `NodeJS.Timeout`)
- **TW v4** — arbitrary values use bracket syntax: `z-[9999]`, `z-[10001]`

## Toast API

```ts
toast.success('Message');
toast.error('Message');
toast.warning('Message');
toast.info('Message');
toast.loading('Message');
toast.promise(promise, { loading, success, error });
toast.dismiss(id);
showToast(message, type); // legacy shim
```
