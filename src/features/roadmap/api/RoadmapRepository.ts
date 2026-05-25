import {
    RoadmapSummary,
    RoadmapDetail,
    CreateRoadmapRequest,
    UpdateRoadmapRequest,
    RoadmapFilters,
    PagedResponse
} from '@/features/roadmap/types/roadmap.types';

export interface RoadmapRepository {
    getRoadmaps(filters: RoadmapFilters): Promise<PagedResponse<RoadmapSummary>>;

    getRoadmapBySlug(slug: string): Promise<RoadmapDetail>;

    createRoadmap(data: CreateRoadmapRequest): Promise<RoadmapDetail>;

    updateRoadmap(id: number, data: UpdateRoadmapRequest): Promise<RoadmapDetail>;
    deleteRoadmap(id: number): Promise<void>;
}