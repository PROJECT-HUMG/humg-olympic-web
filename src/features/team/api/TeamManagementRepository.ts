import { Team, CreateTeamPayload, UpdateTeamPayload, AddMemberPayload, GetTeamsParams, PagedResponse } from '@/features/team/types/team.types';

export interface TeamManagementRepository {
    getTeams(params: GetTeamsParams): Promise<PagedResponse<Team>>;
    getTeamBySlug(slug: string): Promise<Team>;
    createTeam(data: CreateTeamPayload): Promise<Team>;
    updateTeam(id: number | string, data: UpdateTeamPayload): Promise<Team>;
    approveTeam(id: number | string): Promise<void>;
    deleteTeam(id: number | string): Promise<void>;
    addMember(teamId: number | string, payload: AddMemberPayload): Promise<void>;
    removeMember(teamId: number | string, userId: number | string): Promise<void>;
    exportTeamData(teamId: number | string): Promise<Blob>;
}