---
name: features-ai
description: AI chat widget, suggestion bubbles, and related hooks/constants
---

## Components

| File | Export | Purpose |
|---|---|---|
| `components/AIChatWidget.tsx` | `AIChatWidget` | Draggable floating AI chat widget with rate limiting, conversation history |
| `components/SuggestionBubble.tsx` | `SuggestionBubble` | Animated suggestion popup with framer-motion, appears near AI bubble |

### AIChatWidget States
- `disabled` — minimal dot (bottom-right), click to re-enable
- `bubble` — draggable floating avatar with ping indicator + suggestion bubbles
- `open` — full chat panel (positioned relative to bubble), with header/messages/input

### Key Features
- Pointer-based drag with snap-to-edge
- Rate limit cooldown (60s timer, different limits for auth/guest)
- Conversation history sent to backend via `messagesRef` (stale-closure safe)
- `sanitizeHtml` for AI response formatting

## Hooks

| File | Export | Purpose |
|---|---|---|
| `hooks/useAISuggestions.ts` | `useAISuggestions` | Page-aware suggestion rotation (15min interval, 5s initial delay) |

## Constants

| File | Export | Purpose |
|---|---|---|
| `constants/aiSuggestions.ts` | `DEFAULT_SUGGESTIONS`, `PAGE_SPECIFIC_SUGGESTIONS` | Vietnamese suggestion strings by page |

## Key Patterns

- **No `import React`** — `react-jsx` transform
- **No `React.FC`** — plain functions with typed props
- **Named type imports** — `type PointerEvent`, `type CSSProperties`, `type FormEvent`
- **Timer refs** — `ReturnType<typeof setTimeout>` / `ReturnType<typeof setInterval>`
