import { ResourceQueryParams, ResourceResponse, UploadResourceDTO, ResourceItem, ResourceCategory, UpdateResourceDTO } from '@/features/resources/types/resources.types';

export interface ResourceRepository {
    getCategories(): Promise<ResourceCategory[]>;

    getResources(params: ResourceQueryParams): Promise<ResourceResponse>;

    getResourceById(id: number): Promise<ResourceItem | null>;

    uploadResource(data: UploadResourceDTO): Promise<boolean>;

    updateResource(id: number, data: UpdateResourceDTO): Promise<boolean>;

    deleteResource(id: number): Promise<boolean>;

    downloadResource(id: number, fileName: string): Promise<void>;

    previewResource(id: number): Promise<{ blob: Blob }>;
}