# Skill: Roadmap

## Feature Folder
`src/features/roadmap/`

---

## Types — `types/roadmap.types.ts`

| Type | Purpose |
|------|---------|
| `ResourceType` | `'VIDEO' \| 'DOC' \| 'EXAM' \| 'CONTEST'` |
| `StageStatus` | `'LOCKED' \| 'UNLOCKED'` |
| `StageResource` | `{ id?, title, url, type, orderIndex, examId?, examTitle? }` |
| `RoadmapStage` | A stage in the roadmap, contains `resources: StageResource[]` |
| `RoadmapSummary` | List-view — has `iconUrl: string` (external image URL, empty = HUMG logo default) |
| `RoadmapDetail` | Full roadmap with stages — has `iconUrl: string` |
| `UpdateRoadmapRequest` | PUT body — contains `iconUrl` + `stages` with resources |

### `iconUrl` — Ảnh biểu tượng lộ trình
- `iconUrl` là URL ảnh ngoài (PNG, SVG, WebP, ...)
- Nếu `iconUrl = ''` (empty): frontend tự dùng `/assets/logo.svg` (logo HUMG)
- Frontend render: `<img src={iconUrl || '/assets/logo.svg'}>` với `onError` fallback
- **Không còn dùng Lucide icon / `iconName`**

### `examId` trên `StageResource`
Khi `type` là `EXAM` hoặc `CONTEST`:
- `examId` → link đề thi nội bộ từ Question Bank
- `url` để trống (giữ backward compat với VIDEO/DOC)
- Frontend navigate: `examId` → `/exams/:id/preview`, ngược lại `window.open(url)`

---

## Repository API

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getRoadmaps()` | GET | `/roadmaps` |
| `getRoadmapById(id)` | GET | `/roadmaps/:id` |
| `createRoadmap(data)` | POST | `/roadmaps` |
| `updateRoadmap(id, data)` | PUT | `/roadmaps/:id` |
| `deleteRoadmap(id)` | DELETE | `/roadmaps/:id` |

Singleton: `import { roadmapRepository } from '@/features/roadmap/api'`

---

## Hooks

| Hook | File |
|------|------|
| `useRoadmap(id?)` | `hooks/useRoadmap.ts` |

---

## Components & Pages

| Component/Page | File | Purpose |
|----------------|------|---------|
| `RoadmapPage` | `pages/RoadmapPage.tsx` | List + tab switcher. Dùng `<img iconUrl>` fallback logo |
| `ChapterDetailPage` | `components/ChapterDetailPage.tsx` | Stage detail + resource rows |
| `RoadmapEditorPage` | `components/RoadmapEditorPage.tsx` | Admin/Lecturer editor — `ImageUrlInput` để nhập URL ảnh |
| `RoadmapStatsModal` | `components/RoadmapStatsModal.tsx` | Stats modal |

---

## Icon Display Pattern (RoadmapPage)

```tsx
// Component dùng để render icon roadmap
const RoadmapIcon = ({ iconUrl, size = 18 }) => (
    <img
        src={iconUrl || '/assets/logo.svg'}
        width={size} height={size}
        className="object-contain"
        onError={(e) => { e.currentTarget.src = '/assets/logo.svg'; }}
    />
);
```

---

## ImageUrlInput — Editor Icon Picker

Component inline trong `RoadmapEditorPage.tsx`:
- Nhập URL ảnh ngoài (PNG, SVG, WebP)
- Preview live 64×64 trong khi nhập
- Hiển thị trạng thái: ✓ hợp lệ / ⚠ lỗi
- Nút ✕ để xóa URL (về logo mặc định)
- Để trống = logo HUMG mặc định (`/assets/logo.svg`)

---

## Exam Picker in RoadmapEditorPage

`ExamInfiniteSelect` component là inline trong `RoadmapEditorPage.tsx`:
- Hiện ra khi resource type là `EXAM` hoặc `CONTEST`
- Thay thế URL text input
- Fetch: `examRepository.getExams({ status: 'PUBLISHED', search, page, limit: 10 })`
- Lưu `examId` + `examTitle` vào resource; clear `url`

---

## Backend Notes

Xem `BACKEND_ICON_MIGRATION_SPEC.md` để biết migration sql và DTO changes cần thiết:
- DB: `icon_name VARCHAR` → `icon_url TEXT DEFAULT ''`
- DTO: đổi field name `iconName` → `iconUrl` trong tất cả request/response
