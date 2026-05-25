---
name: features-home
description: Homepage feature — hero slider, features, stats, FAQ, ranking, about/terms/privacy pages
---

## Structure

```
src/features/home/
├── components/
│   ├── FAQSection.tsx        — Accordion FAQ list
│   ├── FeatureCard.tsx       — Single feature item card
│   ├── FeaturesSection.tsx   — Grid of FeatureCards with scroll animation
│   ├── GuestHomeView.tsx     — Composes Hero + Features + Stats + Ranking + FAQ
│   ├── Hero.tsx              — Cinematic slider hero with parallax tilt + video modal
│   ├── RankingSection.tsx    — Leaderboard preview on homepage
│   ├── SmartCinematicImage.tsx — Lazy image with Ken Burns + skeleton + error fallback
│   ├── StatsSection.tsx      — Stat counters section
│   └── TypewriterEffect.tsx  — Multi-text typewriter with cursor
├── hooks/
│   ├── useCinematicSlider.ts — Frame-based auto-advance slider (framer-motion)
│   └── useHero.ts            — Fetches hero slides + video URL via heroRepository
└── pages/
    ├── AboutUsPage.tsx       — About us page with team cards + values
    ├── PrivacyPolicyPage.tsx  — Static privacy policy content
    └── TermsOfServicePage.tsx — Static terms of service content
```

## Key Patterns

- No `import React` — `react-jsx` transform (React 19.2)
- No `React.FC` — plain functions with typed props
- Named type imports — `type MouseEvent`
- `ReturnType<typeof setTimeout>` — avoids `NodeJS.Timeout`
- `useCinematicSlider` uses `useAnimationFrame` from framer-motion for smooth progress
- `useHero` uses `useRef(false)` guard to prevent double-fetch in StrictMode
