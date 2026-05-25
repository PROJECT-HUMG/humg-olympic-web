import { ResourceRepository } from './ResourceRepository';
import { ResourceItem, ResourceQueryParams, ResourceResponse, UploadResourceDTO, ResourceCategory, UpdateResourceDTO } from '@/features/resources/types/resources.types';
import { api, authenticatedFetch } from '@/lib/api/apiClient';
import { API_BASE_URL } from '@/lib/api/apiConfig';
import i18n from '@/i18n';

const RESOURCE_ENDPOINT = '/resources';

export class ApiResourceRepository implements ResourceRepository {

    async getCategories(): Promise<ResourceCategory[]> {
        return api.get<ResourceCategory[]>(`${RESOURCE_ENDPOINT}/categories`);
    }

    async getResources(params: ResourceQueryParams): Promise<ResourceResponse> {
        const queryParams = new URLSearchParams();

        if (params.category && params.category !== 'all') {
            queryParams.append('category', params.category.toString());
        }

        if (params.search) queryParams.append('q', params.search);

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        return api.get<ResourceResponse>(`${RESOURCE_ENDPOINT}?${queryParams.toString()}`);
    }

    async getResourceById(id: number): Promise<ResourceItem | null> {
        return api.get<ResourceItem>(`${RESOURCE_ENDPOINT}/${id}`);
    }

    async uploadResource(data: UploadResourceDTO): Promise<boolean> {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('categoryId', data.categoryId.toString());

        if (data.description) {
            formData.append('description', data.description);
        }

        formData.append('file', data.file);

        const response = await authenticatedFetch(`${API_BASE_URL}${RESOURCE_ENDPOINT}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            if (response.status === 400) {
                throw new Error(i18n.t('resources:api.invalidFormat'));
            }
            throw new Error(i18n.t('resources:api.uploadFailed'));
        }

        return true;
    }

    async updateResource(id: number, data: UpdateResourceDTO): Promise<boolean> {
        const response = await authenticatedFetch(`${API_BASE_URL}${RESOURCE_ENDPOINT}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) throw new Error(i18n.t('resources:api.noEditPermission'));
            if (response.status === 404) throw new Error(i18n.t('resources:api.notFound'));
            throw new Error(i18n.t('resources:api.updateFailed'));
        }
        return true;
    }

    async deleteResource(id: number): Promise<boolean> {
        const response = await authenticatedFetch(`${API_BASE_URL}${RESOURCE_ENDPOINT}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            if (response.status === 403) throw new Error(i18n.t('resources:api.noDeletePermission'));
            if (response.status === 404) throw new Error(i18n.t('resources:api.notFound'));
            throw new Error(i18n.t('resources:api.deleteFailed'));
        }

        return true;
    }

    async downloadResource(id: number, fileName: string): Promise<void> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/resources/download/${id}`);

            if (!response.ok) {
                if (response.status === 403) throw new Error(i18n.t('resources:api.noDownloadPermission'));
                if (response.status === 404) throw new Error(i18n.t('resources:api.notFoundOrDeleted'));
                throw new Error(i18n.t('resources:api.downloadError'));
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            throw error;
        }
    }

    async previewResource(id: number): Promise<{ blob: Blob }> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/resources/view/${id}`);
            if (!response.ok) throw new Error(i18n.t('resources:api.cannotView'));

            const blob = await response.blob();
            return { blob };

        } catch (error) {
            throw error;
        }
    }


}