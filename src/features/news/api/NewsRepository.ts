import { NewsItem, NewsQueryParams, NewsResponse, CreateNewsDTO, UpdateNewsDTO, Category } from '@/features/news/types/news.types';

export interface NewsRepository {
    getNews(params: NewsQueryParams): Promise<NewsResponse>;
    getFeaturedNews(): Promise<NewsItem | null>;
    getNewsBySlug(slug: string): Promise<NewsItem | null>;
    getNewsById(id: number): Promise<NewsItem | null>;
    createNews(data: CreateNewsDTO): Promise<boolean>;
    updateNews(id: number, data: UpdateNewsDTO): Promise<boolean>;
    deleteNews(id: number): Promise<boolean>;
    getCategories(): Promise<Category[]>;
    /** PATCH /news/{id}/featured – chỉ Admin */
    setFeatured(id: number, featured: boolean): Promise<NewsItem>;
}