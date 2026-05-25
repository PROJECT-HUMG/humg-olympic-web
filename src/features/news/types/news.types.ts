/** Dùng chung với Resource, Competition */
export interface AuthorResponse {
  id: string;
  name: string;
  avatar: string | null;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT_INTERNAL' | 'STUDENT_EXTERNAL';
}

export interface NewsQueryParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  isFeatured?: boolean;
}

export interface NewsResponse {
  data: NewsItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateNewsDTO {
  title: string;
  summary: string;
  content: string;
  categoryId: number;
  thumbnail?: File;
  contentImageUrls: string[];
  isFeatured: boolean;
}

export interface UpdateNewsDTO extends Omit<CreateNewsDTO, 'thumbnail'> {
  id: number;
  thumbnail?: File | string;
}

/** NewsSummaryResponse / NewsDetailResponse (detail có thêm content) */
export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content?: string | any[];
  thumbnailUrl: string | null;
  categoryName: string | null;
  author: AuthorResponse | null;
  created: string;
  published: string | null;
  viewCount: number;
  isFeatured: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}
