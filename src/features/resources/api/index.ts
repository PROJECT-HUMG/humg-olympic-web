
import { ResourceRepository } from './ResourceRepository';
import { ApiResourceRepository } from './ApiResourceRepository';

export const resourceRepository: ResourceRepository =
    new ApiResourceRepository();