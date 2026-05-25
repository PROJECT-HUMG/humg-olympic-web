import { ForumRepository } from './ForumRepository';
import {
    ForumQueryParams,
    PagedResponse,
    LikeResponse,
    Post,
    Category,
    Comment,
    CreatePostDTO,
    CreateCommentDTO,
    CreateReportDTO,
    UpdatePostDTO
} from '@/features/forum/types/forum.types';
import { api } from '@/lib/api/apiClient';

export class ApiForumRepository implements ForumRepository {

    async getCategories(): Promise<Category[]> {
        return api.get<Category[]>('/forum/categories');
    }

    async getPosts(params: ForumQueryParams): Promise<PagedResponse<Post>> {
        const queryParams = new URLSearchParams();

        if (params.category && params.category !== 'all') {
            queryParams.append('category', params.category);
        }

        if (params.search) queryParams.append('search', params.search);
        if (params.tag) queryParams.append('tag', params.tag);
        if (params.sort) queryParams.append('sort', params.sort);

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        return api.get<PagedResponse<Post>>(`/forum/posts?${queryParams.toString()}`);
    }

    async getPostById(id: string | number): Promise<Post | null> {
        return api.get<Post>(`/forum/posts/${id}`);
    }

    async getReplies(commentId: number, page = 1, limit = 5): Promise<PagedResponse<Comment>> {
        return api.get<PagedResponse<Comment>>(`/forum/comments/${commentId}/replies?page=${page}&limit=${limit}`);
    }

    async getCommentsByPostId(postId: string | number, page = 1, limit = 10): Promise<PagedResponse<Comment>> {
        return api.get<PagedResponse<Comment>>(`/forum/posts/${postId}/comments?page=${page}&limit=${limit}`);
    }

    async createPost(data: CreatePostDTO): Promise<Post> {
        return api.post<Post>('/forum/posts', data);
    }

    async toggleLike(postId: string | number): Promise<LikeResponse> {
        return api.post<LikeResponse>(`/forum/posts/${postId}/like`, {});
    }

    async toggleCommentLike(commentId: string | number): Promise<LikeResponse> {
        return api.post<LikeResponse>(`/forum/comments/${commentId}/like`, {});
    }

    async createComment(data: CreateCommentDTO): Promise<Comment> {
        return api.post<Comment>('/forum/comments', data);
    }

    async deletePost(postId: number): Promise<void> {
        return api.delete<void>(`/forum/posts/${postId}`);
    }

    async updatePost(postId: number, data: UpdatePostDTO): Promise<Post> {
        return api.put<Post>(`/forum/posts/${postId}`, data);
    }

    async deleteComment(commentId: number): Promise<void> {
        return api.delete<void>(`/forum/comments/${commentId}`);
    }

    async updateComment(commentId: number, content: string): Promise<Comment> {
        return api.put<Comment>(`/forum/comments/${commentId}`, { content });
    }

    async reportPost(postId: number, data: CreateReportDTO): Promise<{ message: string }> {
        return api.post<{ message: string }>(`/forum/posts/${postId}/report`, data);
    }
}