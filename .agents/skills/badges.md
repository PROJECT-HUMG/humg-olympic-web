# Skill: Badges

## Feature Folder
`src/features/badges/`

---

## Types — `features/auth/types/auth.types.ts`

```typescript
export type BadgeType = 'NATIONAL' | 'SCHOOL' | 'STREAK' | 'LEARNING' | 'TEAM';
export type BadgeSubject =
    | 'MATH' | 'PHYSICS' | 'CHEMISTRY' | 'ENGLISH' | 'IT'
    | 'ART' | 'GENERAL' | 'ALGEBRA' | 'CALCULUS';

export interface BadgeItem {
    id: number;
    name: string;
    description: string;
    type: BadgeType;
    subject: BadgeSubject;
    level: number;     // 1-4: 1=thấp nhất, 4=cao nhất (Vàng)
    isEarned: boolean;
    isSelected: boolean;
    iconUrl?: string | null; // Custom PNG icon — null → fallback to Lucide icon
}
```

Paged badge request types: `features/badges/types/userBadge.types.ts`

---

## BadgeFlat Component — Custom SVG Design

File: `features/badges/components/BadgeFlat.tsx`

### Props
```tsx
<BadgeFlat badge={BadgeItem} onClick={() => void} size="sm" | "md" | "lg" />
```

### Visual Design — Không dùng Lucide icons cho visual badge
Badge được render bằng **inline SVG** (không phụ thuộc thư viện icon):

| `badge.type` | Hình dạng SVG | Màu gradient |
|---|---|---|
| `NATIONAL` | Lục giác (hexagon) | Vàng/Bạc/Đồng theo `level` |
| `SCHOOL` | Khiên/crest (shield path) | Vàng/Bạc/Đồng theo `level` |

### Màu theo `badge.subject`

| Subject | Màu chủ đạo | Glow |
|---------|-------------|------|
| MATH / ALGEBRA / CALCULUS | Blue / Indigo / Sky | `#3b82f6` / `#6366f1` / `#0ea5e9` |
| PHYSICS | Purple | `#a855f7` |
| CHEMISTRY | Emerald | `#10b981` |
| ENGLISH | Rose | `#f43f5e` |
| IT | Amber | `#f59e0b` |
| ART | Fuchsia | `#d946ef` |
| GENERAL | Slate | `#64748b` |

### Level → metallic rank

| `level` | Rank | Stars | Gradient |
|---------|------|-------|---------|
| 4 | Vàng (Nhất) | ★★★ | gold gradient |
| 3 | Bạc (Nhì) | ★★ | silver gradient |
| 2 | Đồng (Ba) | ★ | bronze gradient |
| 1 | Hạng 4 | – | slate gradient |

### States
- `isEarned = false`: grayscale + Lock icon overlay + opacity 50%
- `isSelected = true`: scale-110 + ping glow ring + CheckCircle2 badge top-right
- `size="sm"`: 48px, no name text
- `size="md"`: 64px (default), name text below
- `size="lg"`: 88px, name + "subject · rank" subtitle

---

## Admin Grant/Revoke Flow

| Action | Component | API |
|--------|-----------|-----|
| Grant (manual) | `AdminGrantBadgeModal.tsx` | `POST /admin/user-badges` |
| Grant (bulk Excel) | `AdminBadgeExcelUploadModal.tsx` | `POST /admin/user-badges/bulk` |
| Revoke | `AdminUserBadgesModal.tsx` | `DELETE /admin/user-badges/revoke?userId=&badgeId=` |
| User requests | `BadgeRequestModal.tsx` | `POST /user-badges/request` |
| Review requests | `AdminBadgeReviewTab.tsx` | `PUT /user-badges/:id/review` |

---

## Usage in Other Features

```tsx
// Profile page
<BadgeFlat badge={badge} onClick={() => {}} size="lg" />

// Admin dashboard (compact)
<BadgeFlat badge={{ ...item, isEarned: true, isSelected: false }} onClick={() => {}} size="sm" />

// Badge request modal
<BadgeFlat badge={badge} onClick={() => setSelectedBadgeId(badge.id)} />
```

---

## Backend Notes

Badge data model không thay đổi. Frontend redesign hoàn toàn ở client bằng SVG.
- **Không cần** thêm field `imageUrl` hay `iconUrl` cho badge.
- `type`, `subject`, `level` đủ để render badge đúng màu sắc và hình dạng.
