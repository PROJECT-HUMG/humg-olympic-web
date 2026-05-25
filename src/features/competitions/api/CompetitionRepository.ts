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

export interface CompetitionRepository {
    getCompetitions(params: CompetitionQueryParams): Promise<PagedResponse<CompetitionSummary>>;
    getCompetitionBySlug(slug: string): Promise<CompetitionDetail | null>;
    getFeaturedCompetition(): Promise<CompetitionSummary | null>;
    registerCompetition(id: number): Promise<RegistrationResponse>;
    createCompetition(data: CreateCompetitionRequest, imageFile?: File): Promise<CompetitionDetail>;
    getSubjects(): Promise<Subject[]>;
    setFeatured(id: number, featured: boolean): Promise<CompetitionDetail>;
    updateCompetition(id: number, data: CompetitionUpdateRequest, image?: File): Promise<CompetitionDetail>;
    deleteCompetition(id: number): Promise<void>;
}