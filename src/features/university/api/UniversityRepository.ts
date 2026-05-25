
import { University, FacultyOption } from '@/features/university/types/university.types';

export interface UniversityRepository {
    getAll(): Promise<University[]>;
    search(query: string): Promise<University[]>;
    getFaculties(): Promise<FacultyOption[]>;
    getUniversitiesPaged(search: string, page: number, limit: number): Promise<{ data: University[]; total: number }>;
    getFacultiesPaged(search: string, page: number, limit: number): Promise<{ data: FacultyOption[]; total: number }>;
}