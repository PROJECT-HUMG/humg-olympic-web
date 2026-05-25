import { TeamManagementRepository } from './TeamManagementRepository';
import { ApiTeamManagementRepository } from './ApiTeamManagementRepository';

export const teamRepository: TeamManagementRepository =
    new ApiTeamManagementRepository();