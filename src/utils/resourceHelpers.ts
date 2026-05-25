import type { Author } from '@/features/forum/types/forum.types';
import type { AuthorResponse } from '@/features/resources/types/resources.types';

export function resourceAuthorToPreviewAuthor(a: AuthorResponse): Author {
  return {
    id: Number(a.id),
    name: a.name,
    avatar: a.avatar ?? null,
    role: a.role as Author['role'],
  };
}
