import { CompetitionRepository } from './CompetitionRepository';
import {
    CompetitionSummary,
    CompetitionDetail,
    CompetitionQueryParams,
    CreateCompetitionRequest,
    CompetitionUpdateRequest,
    PagedResponse,
    RegistrationResponse,
    Subject,
} from '@/features/competitions/types/competition.types';
import { api, authenticatedFetch } from '@/lib/api/apiClient';
import { extractErrorStatus } from '@/utils/errorUtils';
import { API_BASE_URL } from '@/lib/api/apiConfig';
import i18n from '@/i18n';


export class ApiCompetitionRepository implements CompetitionRepository {

    async getCompetitions(params: CompetitionQueryParams): Promise<PagedResponse<CompetitionSummary>> {
        const query = new URLSearchParams();

        if (params.subjectId && params.subjectId !== 'all') {
            query.append('subjectId', params.subjectId.toString());
        }

        if (params.search) query.append('search', params.search);
        if (params.status) query.append('status', params.status);
        if (params.page !== undefined) query.append('page', params.page.toString());
        if (params.limit !== undefined) query.append('limit', params.limit.toString());

        return api.get<PagedResponse<CompetitionSummary>>(`/competitions?${query.toString()}`);
    }

    async getCompetitionBySlug(slug: string): Promise<CompetitionDetail | null> {
        try {
            return await api.get<CompetitionDetail>(`/competitions/${slug}`);
        } catch (error: unknown) {
            const status = extractErrorStatus(error);
            if (status === 404) return null;
            throw error;
        }
    }

    async getFeaturedCompetition(): Promise<CompetitionSummary | null> {
        try {
            const response = await api.get<CompetitionSummary>('/competitions/featured');
            return response || null;
        } catch (error) {
            return null;
        }
    }

    async registerCompetition(id: number): Promise<RegistrationResponse> {
        return api.post<RegistrationResponse>(`/competitions/${id}/register`, {});
    }

    async createCompetition(data: CreateCompetitionRequest, imageFile?: File): Promise<CompetitionDetail> {
        const formData = new FormData();

        const jsonBlob = new Blob([JSON.stringify(data)], {
            type: 'application/json'
        });
        formData.append('data', jsonBlob);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await authenticatedFetch(`${API_BASE_URL}/competitions`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.message || "Failed to create competition");
        }

        return await response.json();
    }

    async getSubjects(): Promise<Subject[]> {
        return api.get<Subject[]>('/competitions/subjects');
    }

    async setFeatured(id: number, featured: boolean): Promise<CompetitionDetail> {
        return api.patch<CompetitionDetail>(`/competitions/${id}/featured`, { featured });
    }

    async updateCompetition(id: number, data: CompetitionUpdateRequest, image?: File): Promise<CompetitionDetail> {
        const formData = new FormData();
        const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        formData.append('data', jsonBlob);
        if (image) formData.append('image', image);

        const response = await authenticatedFetch(`${API_BASE_URL}/competitions/${id}`, {
            method: 'PUT',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || i18n.t('common:errors.updateFailed'));
        }
        return response.json();
    }

    async deleteCompetition(id: number): Promise<void> {
        await api.delete(`/competitions/${id}`);
    }
}