
import { HeroSlideResponse } from '@/features/hero/types/hero.types';

export interface HeroRepository {
    getHeroSlides(): Promise<HeroSlideResponse[]>;

    getVideoIntroduction(): Promise<string>;
}
