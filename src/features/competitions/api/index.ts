
import { CompetitionRepository } from './CompetitionRepository';
import { ApiCompetitionRepository } from './ApiCompetitionRepository';


export const competitionRepository: CompetitionRepository =
    new ApiCompetitionRepository();