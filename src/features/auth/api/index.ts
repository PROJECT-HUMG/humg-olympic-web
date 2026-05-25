
import { AuthRepository } from './AuthRepository';
import { ApiAuthRepository } from './ApiAuthRepository';
import { userBadgeRepository } from './ApiUserBadgeRepository';

export const authRepository: AuthRepository = new ApiAuthRepository();
export { userBadgeRepository };
