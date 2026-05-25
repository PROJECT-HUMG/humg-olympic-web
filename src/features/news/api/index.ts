
import { NewsRepository } from './NewsRepository';
import { ApiNewsRepository } from './ApiNewsRepository';


export const newsRepository: NewsRepository = new ApiNewsRepository();
