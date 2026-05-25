import { University, FacultyResponse, FacultyOption } from '@/features/university/types/university.types';
import { UniversityRepository } from './UniversityRepository';
import { api } from '@/lib/api/apiClient';

interface PagedResponse<T> {
    data: T[];
    total: number;
}

export class ApiUniversityRepository implements UniversityRepository {
    private facultiesCache: FacultyOption[] | null = null;

    async getAll(): Promise<University[]> {
        const res = await this.getUniversitiesPaged('', 1, 10);
        return res.data;
    }

    async search(query: string): Promise<University[]> {
        const res = await this.getUniversitiesPaged(query?.trim() || '', 1, 10);
        return res.data;
    }

    async getFaculties(): Promise<FacultyOption[]> {
        if (this.facultiesCache) {
            return this.facultiesCache;
        }

        const data = await api.get<FacultyResponse[]>('/universities/faculties');

        const options: FacultyOption[] = data.map(faculty => ({
            value: String(faculty.id),
            label: faculty.name
        }));

        this.facultiesCache = options;
        return options;
    }

    async getUniversitiesPaged(search: string, page: number, limit: number): Promise<{ data: University[]; total: number }> {
        const query = new URLSearchParams();
        query.append('page', page.toString());
        query.append('limit', limit.toString());
        if (search?.trim()) {
            query.append('search', search.trim());
        }
        return api.get<PagedResponse<University>>(`/universities?${query.toString()}`);
    }

    async getFacultiesPaged(search: string, page: number, limit: number): Promise<{ data: FacultyOption[]; total: number }> {
        const all = await this.getFaculties();
        const filtered = search
            ? all.filter(f => f.label.toLowerCase().includes(search.toLowerCase()))
            : all;

        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            data: filtered.slice(start, end),
            total: filtered.length
        };
    }
}

export const universityRepository = new ApiUniversityRepository();