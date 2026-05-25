# Skill: Profile

## Feature Folder
`src/features/profile/`

---

## Types — `types/profile.types.ts`

| Type | Purpose |
|------|---------|
| `BadgeType` | `'NATIONAL' \| 'SCHOOL' \| 'STREAK' \| 'LEARNING' \| 'TEAM'` |
| `SubjectType` | `'MATH' \| 'PHYSICS' \| 'CHEMISTRY' \| 'ENGLISH' \| 'IT' \| 'GENERAL'` |
| `BadgeItem` | `{ id, name, description, type, subject?, level?, isEarned, isSelected, earnedDate? }` |
| `Achievement` | `{ id, title, rank, date, colorFrom, colorTo, icon: LucideIcon }` |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `ProfilePage` | `pages/ProfilePage.tsx` | User profile with tabs (info, badges, exam history) |
| `UserPreviewCard` | `components/UserPreviewCard.tsx` | Hover popup showing user preview (used globally) |
| `InfoField` | `components/InfoField.tsx` | Key-value display field |
| `ExamHistoryTab` | `components/ExamHistoryTab.tsx` | Paginated exam attempt history (integrates with `exams` feature) |
| `MyBadgeRequestsTab` | `components/MyBadgeRequestsTab.tsx` | User's badge request list |

---

## Integration Notes

### UserPreviewCard (global usage)
Used via `useUserPreview` hook in many features (news, forum, ranking):
```tsx
const { isVisible, position, previewItem, handleHoverStart, handleHoverEnd, handlePreviewMouseEnter, handlePreviewMouseLeave } = useUserPreview<Author>();
```

### Privacy enforcement
When viewing another user's profile, respect `PrivacySettings` (see `settings.md`):
- `showEmail === false` → hide email
- `showExamHistory === false` → hide "Lịch sử thi" tab
