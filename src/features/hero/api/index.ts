import { HeroRepository } from './HeroRepository';
import { ApiHeroRepository } from './ApiHeroRepository';


export const heroRepository: HeroRepository =
    new ApiHeroRepository();