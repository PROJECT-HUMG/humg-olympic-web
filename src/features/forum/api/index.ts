
import { ForumRepository } from './ForumRepository';
import { ApiForumRepository } from './ApiForumRepository';

export const forumRepository: ForumRepository = new ApiForumRepository();