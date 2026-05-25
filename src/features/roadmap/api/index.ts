
import { RoadmapRepository } from './RoadmapRepository';
import { ApiRoadmapRepository } from './ApiRoadmapRepository';

export const roadmapRepository: RoadmapRepository = new ApiRoadmapRepository();