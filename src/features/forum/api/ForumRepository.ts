import {
    ForumQueryParams,
    PagedResponse,
    Post,
    Category,
    Comment,
    CreatePostDTO,
    CreateCommentDTO,
    CreateReportDTO,
    LikeResponse,
    UpdatePostDTO
} from '@/features/forum/types/forum.types';

export interface ForumRepository {
    getPosts(params: ForumQueryParams): Promise<PagedResponse<Post>>;

    getCategories(): Promise<Category[]>;

    getPostById(id: string | number): Promise<Post | null>;

    getCommentsByPostId(postId: string | number, page?: number, limit?: number): Promise<PagedResponse<Comment>>;

    getReplies(commentId: number, page?: number, limit?: number): Promise<PagedResponse<Comment>>;

    createPost(data: CreatePostDTO): Promise<Post>;

    toggleLike(postId: string | number): Promise<LikeResponse>;

    toggleCommentLike(commentId: string | number): Promise<LikeResponse>;

    createComment(data: CreateCommentDTO): Promise<Comment>;

    deletePost(postId: number): Promise<void>;

    updatePost(postId: number, data: UpdatePostDTO): Promise<Post>;

    deleteComment(commentId: number): Promise<void>;

    updateComment(commentId: number, content: string): Promise<Comment>;

    reportPost(postId: number, data: CreateReportDTO): Promise<{ message: string }>;
}