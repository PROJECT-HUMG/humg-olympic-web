# Skill: Home & Landing

## Feature Folder
`src/features/home/`
`src/features/hero/`

---

## Components — `home/components/`

| Component | File | Purpose |
|-----------|------|---------|
| `GuestHomeView` | `GuestHomeView.tsx` | Public landing page wrapper |
| `Hero` | `Hero.tsx` | Hero section with cinematic slider |
| `HeroParticles` | `HeroParticles.tsx` | Particle animation overlay |
| `TypewriterEffect` | `TypewriterEffect.tsx` | Typing animation (`loop` prop controls repeat) |
| `SmartCinematicImage` | `SmartCinematicImage.tsx` | Responsive hero image |
| `FeaturesSection` | `FeaturesSection.tsx` | Feature cards grid |
| `FeatureCard` | `FeatureCard.tsx` | Individual feature card |
| `StatsSection` | `StatsSection.tsx` | Statistics counters |
| `RankingSection` | `RankingSection.tsx` | Top users preview |
| `CTASection` | `CTASection.tsx` | Call-to-action section |

## Hooks — `home/hooks/`

| Hook | File |
|------|------|
| `useCinematicSlider` | `useCinematicSlider.ts` |
| `useHero` | `useHero.ts` |

## Pages — `home/pages/`

| Page | Route |
|------|-------|
| `AboutUsPage` | `/about` |
| `PrivacyPolicyPage` | `/privacy` |
| `TermsOfServicePage` | `/terms` |

## Hero Feature — `hero/components/`
Contains `HeroSection` components and related hero rendering logic.

---

## Notes
- Root `/` route uses `HomeRouteWrapper`: authenticated → `DashboardPage`, guest → `GuestHomeView`
- `TypewriterEffect` supports `loop={false}` to type once and stop
