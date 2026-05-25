import { NewsRepository } from './NewsRepository';
import { NewsItem, NewsQueryParams, NewsResponse, CreateNewsDTO, UpdateNewsDTO, Category } from '@/features/news/types/news.types';
import { api, authenticatedFetch } from '@/lib/api/apiClient';
import { API_BASE_URL } from '@/lib/api/apiConfig';
import i18n from '@/i18n';

export class ApiNewsRepository implements NewsRepository {

    async getNews(params: NewsQueryParams): Promise<NewsResponse> {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.category && params.category !== 'all') {
            searchParams.append('category', params.category);
        }
        if (params.search) searchParams.append('search', params.search);

        return api.get<NewsResponse>(`/news?${searchParams.toString()}`);
    }

    async getCategories(): Promise<Category[]> {
        return api.get<Category[]>('/categories');
    }

    async getFeaturedNews(): Promise<NewsItem | null> {
        const response = await api.get<NewsItem[]>('/news/featured?limit=1');
        return response.length > 0 ? response[0] : null;
    }

    async getNewsBySlug(slug: string): Promise<NewsItem | null> {
        return api.get<NewsItem>(`/news/${slug}`);
    }

    async getNewsById(id: number): Promise<NewsItem | null> {
        return api.get<NewsItem>(`/news/id/${id}`);
    }

    async createNews(data: CreateNewsDTO): Promise<boolean> {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('summary', data.summary);

        const contentString = typeof data.content === 'string'
            ? data.content
            : JSON.stringify(data.content);

        formData.append('content', contentString);
        formData.append('categoryId', data.categoryId.toString());
        formData.append('isFeatured', String(data.isFeatured || false));

        if (data.thumbnail) {
            formData.append('thumbnail', data.thumbnail);
        }

        if (data.contentImageUrls && data.contentImageUrls.length > 0) {
            data.contentImageUrls.forEach(url => {
                formData.append('contentImageUrls', url);
            });
        }

        const response = await authenticatedFetch(`${API_BASE_URL}/news`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error(i18n.t('news:createFailed'));
        return true;
    }
    async updateNews(id: number, data: UpdateNewsDTO): Promise<boolean> {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('summary', data.summary);
        const contentString = typeof data.content === 'string' ? data.content : JSON.stringify(data.content ?? '');
        formData.append('content', contentString);
        formData.append('categoryId', data.categoryId.toString());
        formData.append('isFeatured', String(data.isFeatured ?? false));
        if (data.thumbnail instanceof File) {
            formData.append('thumbnail', data.thumbnail);
        }
        if (data.contentImageUrls?.length) {
            data.contentImageUrls.forEach(url => formData.append('contentImageUrls', url));
        }

        const response = await authenticatedFetch(`${API_BASE_URL}/news/${id}`, {
            method: 'PUT',
            body: formData,
        });

        return response.ok;
    }

    async deleteNews(id: number): Promise<boolean> {
        await api.delete(`/news/${id}`);
        return true;
    }

    async setFeatured(id: number, featured: boolean): Promise<NewsItem> {
        return api.patch<NewsItem>(`/news/${id}/featured`, { featured });
    }
}