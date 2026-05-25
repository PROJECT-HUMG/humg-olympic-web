import { RoadmapRepository } from './RoadmapRepository';
import {
    RoadmapSummary,
    RoadmapDetail,
    CreateRoadmapRequest,
    UpdateRoadmapRequest,
    RoadmapFilters,
    PagedResponse
} from '@/features/roadmap/types/roadmap.types';
import { api } from '@/lib/api/apiClient';

export class ApiRoadmapRepository implements RoadmapRepository {

    async getRoadmaps(filters: RoadmapFilters): Promise<PagedResponse<RoadmapSummary>> {
        const params = {
            page: filters.page || 0,
            size: filters.limit || 10,
            keyword: filters.keyword,
            type: filters.type,
            teamId: filters.teamId
        };

        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });

        return api.get<PagedResponse<RoadmapSummary>>(`/roadmaps?${queryParams.toString()}`);
    }

    async getRoadmapBySlug(slug: string): Promise<RoadmapDetail> {
        return api.get<RoadmapDetail>(`/roadmaps/${slug}`);
    }

    async createRoadmap(data: CreateRoadmapRequest): Promise<RoadmapDetail> {
        return api.post<RoadmapDetail>('/roadmaps', data);
    }

    async updateRoadmap(id: number, data: UpdateRoadmapRequest): Promise<RoadmapDetail> {
        return api.put<RoadmapDetail>(`/roadmaps/${id}`, data);
    }

    async deleteRoadmap(id: number): Promise<void> {
        return api.delete<void>(`/roadmaps/${id}`);
    }
}