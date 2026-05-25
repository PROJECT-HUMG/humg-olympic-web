export interface AuthorResponse {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface ResourceItem {
  id: number;
  title: string;
  category: string;
  categoryId: number;
  subCategory?: string;
  fileType: string;
  date: string;
  size: string;
  downloads: number;
  author: AuthorResponse | null;

  url?: string;
  previewUrl?: string;
  description?: string;
}

export interface ResourceCategory {
  id: number;
  label: string;
  color: string;
  description?: string;
}

export interface ResourceQueryParams {
  category?: number | string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ResourceResponse {
  data: ResourceItem[];
  total: number;
  page: number;
  limit: number;
}

export interface UploadResourceDTO {
  title: string;
  categoryId: number;
  description?: string;
  file: File;
}

export interface UpdateResourceDTO {
  title: string;
  categoryId?: number;
  description?: string;
}
