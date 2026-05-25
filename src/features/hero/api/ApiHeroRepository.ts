import { HeroRepository } from './HeroRepository';
import { HeroSlideResponse } from '@/features/hero/types/hero.types';
import { api } from '@/lib/api/apiClient';

export class ApiHeroRepository implements HeroRepository {

    async getHeroSlides(): Promise<HeroSlideResponse[]> {
        return api.get<HeroSlideResponse[]>('/universities/hero-slides');
    }

    async getVideoIntroduction(): Promise<string> {
        const response = await api.get<{ videoIntroductionUrl: string }>('/universities/hero-intro');
        return response.videoIntroductionUrl;
    }
}