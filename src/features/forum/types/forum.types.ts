import { BadgeItem, UserRole } from "@/features/auth/types/auth.types";
import { MemberRole } from "../../team/types/team.types";

export interface Author {
  id: number;
  name: string;
  avatar: string | null;
  role: UserRole | MemberRole;
  badges?: BadgeItem[];
  xpPoints?: number;
  isDeleted?: boolean;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: Author;
  category: Category;
  tags: string[];
  likes: number;
  comments: number;

  isLiked: boolean;
  createdAt: string;
}

export interface Mention {
  userId: number;
  name: string;
}

export interface Comment {
  id: number;
  postId: number;
  parentId?: number | null;
  author: Author;
  content: string;

  likes: number;
  isLiked: boolean;
  replyCount?: number;
  created?: string;
  mentions?: Mention[];
  replies?: Comment[];
}

export type CommentTree = Comment & { replies: Comment[] };

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ForumQueryParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  tag?: string;
  sort?: 'latest' | 'popular';
}

export interface CreatePostDTO {
  title: string;
  content: string;
  categoryId: number;
  tags: string[];
}

export interface CreateCommentDTO {
  postId: number;
  content: string;
  parentId?: number;
  mentionedUserIds?: number[];
}

export interface LikeResponse {
  liked: boolean;
  newCount: number;
}

export interface UpdatePostDTO {
  title: string;
  content: string;
  categoryId: number;
  tags?: string[];
}

export type ReportReason = 'SPAM' | 'OFFENSIVE' | 'MISINFORMATION' | 'OTHER';

export interface CreateReportDTO {
  reason: ReportReason;
  description?: string;
}
