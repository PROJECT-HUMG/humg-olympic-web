---
trigger: always_on
---

# humg-olympic-web — Project Context

## Stack
React 19.2 · TypeScript 5.9.3 · Vite 7.3.1 · Tailwind CSS 4.2.1 · Framer Motion (phasing out) · Lucide React
Extras: KaTeX, BlockNote, react-pdf, date-fns, **i18next** · Auth: Google OAuth2 + JWT · Roles: `ADMIN` > `LECTURER` > `STUDENT_INTERNAL` / `STUDENT_EXTERNAL`

## Structure
```
src/
├── App.tsx                  # Root (AuthProvider + Router + SimpleToaster)
├── index.css                # Tailwind v4 theme (NO tailwind.config)
├── components/              # Shared UI (layout, Toast, modals, Background)
├── contexts/                # AuthContext only
├── features/<name>/         # Feature modules (see pattern below)
│   ├── api/                 # Repository interface + implementation + barrel
│   ├── components/          # Feature UI components
│   ├── hooks/               # Data fetching + state hooks
│   ├── types/               # TypeScript interfaces
│   └── pages/               # Page components (route-level)
├── hooks/                   # Shared hooks
├── i18n/                    # i18next config + vi/*.json + en/*.json (see skills/i18n.md)
├── lib/api/                 # apiConfig, apiClient, errorMapping
├── routes/appRoutes.tsx     # React Router v7, lazy-loaded
└── utils/                   # Shared utilities
```

## Coding Standards

### Clean Code
- Single Responsibility: 1 file = 1 job. Component > 400 lines → split
- DRY: repeated ≥ 2x → extract to shared component/hook/util
- No `any` (use `unknown`), no magic numbers (use constants), early return over nested if/else
- Descriptive names: `handleSubmitForm` not `handle`, `isLoading` not `flag`

### Comments
- NO obvious comments. Code is self-documenting via naming
- ONLY comment: complex logic, workarounds, business rules
- JSX section dividers: `{/* ── Section Name ── */}`

### File Naming
| Type | Convention | Example |
|---|---|---|
| Components | PascalCase `.tsx` | `AuthPage.tsx` |
| Hooks | `use` + camelCase `.ts` | `useLoginForm.ts` |
| Utils/config | camelCase `.ts` | `apiConfig.ts` |
| Types | `name.types.ts` | `auth.types.ts` |
| API repos | PascalCase `.ts` | `ApiAuthRepository.ts` |
| Folders | lowercase | `features/auth/` |

### Coding Workflow
Always follow this order — **never skip layers**:
1. Types → `types/<name>.types.ts`
2. API → `<Name>Repository.ts` (interface) + `Api<Name>Repository.ts` (impl) + `index.ts` (singleton)
3. Hook → `use<Name>.ts` (calls repository, NEVER fetch directly)
4. Component → uses hook, reuses existing shared components
5. Verify → `cmd /c "npx tsc --noEmit --skipLibCheck 2>&1"`

### Component Pattern
```tsx
// Import order: react → libs → components → hooks → types → utils
// Functional only, destructure props, handle<Action> naming
const MyPage = ({ id }: Props) => {
  const { data, loading } = useMyHook(id);
  const handleDelete = (itemId: number) => { ... };
  if (loading) return <Skeleton />;
  return <MainContent />;
};
// Lists: stable key={item.id}, never index
// i18n: import i18n from '@/i18n'; use i18n.t('namespace:section.key')
// Static arrays with translated text: convert to functions → getItems()
```

### API Client
```typescript
import { api, authenticatedFetch } from '@/lib/api/apiClient';
import { API_BASE_URL } from '@/lib/api/apiConfig';
// Standard: api.get<T>('/endpoint') · api.post<T>('/endpoint', body)
// File upload: authenticatedFetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData })
```

### Styling & Responsive
- Tailwind v4 utilities only — NO inline styles, NO CSS files per component
- Icons: Lucide React only · Font: Lexend · Palette: HUMG blue/amber
- Dark mode: always pair `text-slate-800 dark:text-slate-100`
- Design: glassmorphism, `rounded-[2rem]`, ambient blur, staggered `animate-in`
- Global bg: `Background.tsx` — never override
- **Framer Motion → prefer CSS `animate-in` for new code**
- **Responsive (mandatory)**: all components must work 375px → 1280px+
  - Mobile-first: default = mobile, scale with `sm:` `md:` `lg:` `xl:`
  - Touch targets: min `h-10 min-w-[44px]`
  - Grids: start `grid-cols-1`, scale up
  - Tables: `overflow-x-auto` on mobile
  - Modals: full-screen mobile, `md:max-w-lg md:h-auto`

### Toast
```typescript
showToast('Message', 'success');                                    // simple
toast.info('Title', { description: '...', duration: 5000 });       // rich
toast.promise(call(), { loading: '...', success: '...', error: '...' }); // async
```

### Routing
```typescript
{ path: 'page', lazy: lazyPage(() => import('../features/.../Page'), 'Page') }
// Protected: <ProtectedRoute allowedRoles={['ADMIN']} />
```

## Core Principles
1. **Feature-first**: all domain logic in `features/<name>/`
2. **Repository Pattern**: Component → Hook → Repository → API
3. **No global state lib**: AuthContext + local state only
4. **i18n all strings**: use `i18n.t('namespace:section.key')` — NO hardcoded Vietnamese/English (see `skills/i18n.md`)
5. **Clean Architecture**: types → api → hooks → components
6. **Verify builds** after changes · **Update skill files** after features
7. **Git commit**: after completing a task, suggest a commit short summary message:
   - Format: `type(scope): description` — e.g. `feature(notifications): add route-change polling with throttle`
   - Types: `feature` · `fix` · `refactor` · `style` · `chore` · `docs`
   - Scope = feature name or `ui` / `config` / `deps`
   - Keep description concise, lowercase, no period

## i18n Migration Status

### ✅ Completed
- **Layout**: Header, Footer, BottomNav, headerHelpers
- **Landing**: Hero, StatsSection, FeaturesSection, FAQSection, RankingSection, FeatureCard, GuestHomeView
- **Competitions**: CompetitionsPage, CompetitionDetailPage, CompetitionCard, CompetitionHero, CompetitionBadges, TrendingList, UpcomingWidget, hooks
- **AI Chat**: AIChatWidget, SuggestionBubble, aiSuggestions, useAISuggestions
- **Other features**: Team, News, Settings, Resources, Profile, Roadmap, Ranking, Forum, Notifications
- **Shared**: common.json (nav/footer/userRole), features.json (all above)
- **App.tsx**: `key={lang}` on `RouterProvider` for reactive language switching

### ❌ Remaining (not yet migrated)
- **Exams** (~6 files): GradingDetailPage, SubmissionsDashboardPage, ExamResultPage, DocxImportModal, QuestionEditor, ExamSkeletons
- **Dashboard** (~20+ files): AdminDashboard, StudentDashboard, LecturerDashboard, all Admin*Modal components, PostNewsModal, TeamCard, EditEventModal, etc.
- **Static pages**: AboutUsPage, TermsOfServicePage, PrivacyPolicyPage
- **Types files**: Vietnamese comments/enum labels in ranking.types, exam.types, attempt.types, dashboard.types, news.types
- **Misc**: ForumPage (partial), CreatePostModal, CategorySidebar, PreviewModal, appRoutes (meta titles)