# Skill: AI Chat

## Feature Folder
`src/features/ai/`

---

## Architecture

The AI chat is a **floating widget** (`AIChatWidget`) rendered globally, not tied to any route.

### States (`WidgetState`)
| State | Visual | Behavior |
|-------|--------|----------|
| `bubble` | Draggable circle (48px mobile / 56px desktop) | Tap to open chat panel |
| `open` | Chat panel anchored near bubble | Full conversation UI |
| `disabled` | Tiny 36px circle, `opacity-50`, fixed bottom-right | Click to re-enable |

### Draggable Bubble
- Pointer events for drag (snap to nearest horizontal edge on release)
- Responsive size: `window.innerWidth < 640 ? 48 : 56`, recalculated on resize
- Chat panel position computed relative to bubble position (above/below, left/right)

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `AIChatWidget` | `components/AIChatWidget.tsx` | Main widget — bubble, chat panel, disabled state |
| `SuggestionBubble` | `components/SuggestionBubble.tsx` | Proactive AI suggestion popup |

---

## Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAISuggestions` | `hooks/useAISuggestions.ts` | Manages suggestion timing & content |

---

## API

| Method | HTTP | Endpoint | Notes |
|--------|------|----------|-------|
| Chat | POST | `/ai/chat` | Body: `{ message, conversationId?, context, history }` |

No repository pattern — direct `api.post` call in component.

---

## Rate Limiting
- Authenticated: 5 messages/minute
- Guest: 3 messages/minute
- On 429 → 60s cooldown timer displayed in input area

---

## Constants
`constants/aiSuggestions.ts` — predefined suggestion messages per page context
