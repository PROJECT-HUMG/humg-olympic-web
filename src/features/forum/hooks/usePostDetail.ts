import { useState, useEffect, useRef, useCallback } from 'react';
import { forumRepository } from '@/features/forum/api';
import { Post, Comment } from '@/features/forum/types/forum.types';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';

export interface RepliesState {
    comments: Comment[];
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const usePostDetail = (postId: string | number | null) => {
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);

    const likeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const commentLikeTimeoutsRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    useEffect(() => {
        return () => {
            if (likeTimeoutRef.current) clearTimeout(likeTimeoutRef.current);
            Object.values(commentLikeTimeoutsRef.current).forEach(t => clearTimeout(t));
        };
    }, []);

    const [commentsPage, setCommentsPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const COMMENTS_LIMIT = 5;

    {/* ── Replies state (lazy-loaded per comment) ── */ }
    const [repliesMap, setRepliesMap] = useState<Record<number, RepliesState>>({});
    const REPLIES_LIMIT = 5;

    const fetchDetail = async () => {
        if (!postId) return;
        setLoading(true);
        try {
            const [postData, commentsResponse] = await Promise.all([
                forumRepository.getPostById(postId),
                forumRepository.getCommentsByPostId(postId, 1, COMMENTS_LIMIT)
            ]);

            setPost(postData);
            setComments(commentsResponse.data);
            setCommentsPage(1);
            setHasMoreComments(commentsResponse.data.length >= COMMENTS_LIMIT);
            setRepliesMap({});
        } catch (error) {
            showToast(i18n.t('forum:post.loadFailed'), 'error');
        } finally {
            setLoading(false);
            window.dispatchEvent(new Event('notification:poll'));
        }
    };

    const loadMoreComments = async () => {
        if (!postId || !hasMoreComments || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const nextPage = commentsPage + 1;
            const response = await forumRepository.getCommentsByPostId(postId, nextPage, COMMENTS_LIMIT);

            setComments(prev => [...prev, ...response.data]);
            setCommentsPage(nextPage);
            setHasMoreComments(response.data.length >= COMMENTS_LIMIT);
        } catch (error) {
        } finally {
            setIsLoadingMore(false);
            window.dispatchEvent(new Event('notification:poll'));
        }
    };

    useEffect(() => {
        if (postId) {
            fetchDetail();
        } else {
            setPost(null);
            setComments([]);
            setCommentsPage(1);
            setHasMoreComments(false);
            setRepliesMap({});
        }
    }, [postId]);

    {/* ── Load replies for a specific comment ── */ }
    const loadReplies = useCallback(async (commentId: number) => {
        const existing = repliesMap[commentId];
        const nextPage = existing ? existing.page + 1 : 1;

        if (existing?.loading) return;

        setRepliesMap(prev => ({
            ...prev,
            [commentId]: {
                comments: prev[commentId]?.comments || [],
                page: prev[commentId]?.page || 0,
                hasMore: prev[commentId]?.hasMore ?? true,
                loading: true,
            }
        }));

        try {
            const response = await forumRepository.getReplies(commentId, nextPage, REPLIES_LIMIT);
            setRepliesMap(prev => ({
                ...prev,
                [commentId]: {
                    comments: [...(prev[commentId]?.comments || []), ...response.data],
                    page: nextPage,
                    hasMore: response.data.length >= REPLIES_LIMIT,
                    loading: false,
                }
            }));
        } catch (error) {
            setRepliesMap(prev => ({
                ...prev,
                [commentId]: {
                    ...prev[commentId],
                    loading: false,
                }
            }));
        }
    }, [repliesMap]);

    const sendComment = async (content: string, mentionedUserIds?: number[], parentId?: number) => {
        if (!postId || !content.trim()) return false;

        try {
            const numericPostId = Number(postId);
            const newComment = await forumRepository.createComment({
                postId: numericPostId,
                content,
                parentId,
                mentionedUserIds
            });

            // Enrich from localStorage so it has xpPoints right away
            try {
                const savedUserStr = localStorage.getItem('user');
                if (savedUserStr && newComment.author) {
                    const savedUser = JSON.parse(savedUserStr);
                    if (savedUser.id === newComment.author.id) {
                        newComment.author = {
                            ...newComment.author,
                            xpPoints: savedUser.xpPoints ?? newComment.author.xpPoints,
                            badges: savedUser.badges ?? newComment.author.badges,
                            avatar: savedUser.avatarUrl || savedUser.avatar || newComment.author.avatar,
                            role: savedUser.role || newComment.author.role
                        };
                    }
                }
            } catch (e) {
                // Ignore parsing errors
            }

            if (parentId) {
                // Reply: increment parent's replyCount and prepend to repliesMap
                setComments(prev => prev.map(c =>
                    c.id === parentId
                        ? { ...c, replyCount: (c.replyCount || 0) + 1 }
                        : c
                ));
                setRepliesMap(prev => ({
                    ...prev,
                    [parentId]: {
                        comments: [...(prev[parentId]?.comments || []), newComment],
                        page: prev[parentId]?.page || 1,
                        hasMore: prev[parentId]?.hasMore ?? false,
                        loading: false,
                    }
                }));
            } else {
                // Root comment: prepend to list
                setComments(prev => [newComment, ...prev]);
            }

            if (post) {
                setPost(prev => prev ? {
                    ...prev,
                    comments: prev.comments + 1
                } : null);
            }
            return true;
        } catch (error) {
            showToast(i18n.t('forum:comment.submitFailed'), 'error');
            return false;
        }
    };

    const toggleLikeDetail = async () => {
        if (!post) return;

        setPost(prev => {
            if (!prev) return null;
            const isLiked = !prev.isLiked;
            return {
                ...prev,
                isLiked,
                likes: isLiked ? prev.likes + 1 : prev.likes - 1
            };
        });

        if (likeTimeoutRef.current) {
            clearTimeout(likeTimeoutRef.current);
            likeTimeoutRef.current = null;
        } else {
            likeTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await forumRepository.toggleLike(post.id);
                    setPost(prev => prev ? ({
                        ...prev,
                        isLiked: response.liked,
                        likes: response.newCount
                    }) : null);
                } catch (error) {
                } finally {
                    likeTimeoutRef.current = null;
                }
            }, 600);
        }
    };

    const toggleCommentLike = async (commentId: number) => {
        const applyLikeToggle = (list: Comment[]) =>
            list.map(c => {
                if (c.id === commentId) {
                    const isLiked = !c.isLiked;
                    return { ...c, isLiked, likes: isLiked ? c.likes + 1 : c.likes - 1 };
                }
                return c;
            });

        // Toggle in root comments
        setComments(applyLikeToggle);

        // Toggle in replies
        setRepliesMap(prev => {
            const updated = { ...prev };
            for (const key of Object.keys(updated)) {
                const numKey = Number(key);
                const state = updated[numKey];
                if (state.comments.some(c => c.id === commentId)) {
                    updated[numKey] = { ...state, comments: applyLikeToggle(state.comments) };
                    break;
                }
            }
            return updated;
        });

        if (commentLikeTimeoutsRef.current[commentId]) {
            clearTimeout(commentLikeTimeoutsRef.current[commentId]);
            delete commentLikeTimeoutsRef.current[commentId];
        } else {
            commentLikeTimeoutsRef.current[commentId] = setTimeout(async () => {
                try {
                    const response = await forumRepository.toggleCommentLike(commentId);
                    const applyServerCount = (list: Comment[]) =>
                        list.map(c => c.id === commentId
                            ? { ...c, isLiked: response.liked, likes: response.newCount }
                            : c
                        );

                    setComments(applyServerCount);
                    setRepliesMap(prev => {
                        const updated = { ...prev };
                        for (const key of Object.keys(updated)) {
                            const numKey = Number(key);
                            const state = updated[numKey];
                            if (state.comments.some(c => c.id === commentId)) {
                                updated[numKey] = { ...state, comments: applyServerCount(state.comments) };
                                break;
                            }
                        }
                        return updated;
                    });
                } catch (error) {
                } finally {
                    delete commentLikeTimeoutsRef.current[commentId];
                }
            }, 600);
        }
    };

    const deleteComment = async (commentId: number) => {
        try {
            await forumRepository.deleteComment(commentId);

            // Check if it's a root comment
            const isRoot = comments.some(c => c.id === commentId);

            if (isRoot) {
                setComments(prev => prev.filter(c => c.id !== commentId));
                // Clean up replies for this comment
                setRepliesMap(prev => {
                    const updated = { ...prev };
                    delete updated[commentId];
                    return updated;
                });
            } else {
                // It's a reply — remove from repliesMap and decrement parent's replyCount
                setRepliesMap(prev => {
                    const updated = { ...prev };
                    for (const key of Object.keys(updated)) {
                        const numKey = Number(key);
                        const state = updated[numKey];
                        if (state.comments.some(c => c.id === commentId)) {
                            updated[numKey] = {
                                ...state,
                                comments: state.comments.filter(c => c.id !== commentId),
                            };
                            // Decrement parent's replyCount
                            setComments(prev => prev.map(c =>
                                c.id === numKey
                                    ? { ...c, replyCount: Math.max((c.replyCount || 0) - 1, 0) }
                                    : c
                            ));
                            break;
                        }
                    }
                    return updated;
                });
            }

            if (post) {
                setPost(prev => prev ? {
                    ...prev,
                    comments: prev.comments - 1
                } : null);
            }
            showToast(i18n.t('forum:comment.deleteSuccess'), 'success');
            return true;
        } catch (error) {
            showToast(i18n.t('forum:comment.deleteFailed'), 'error');
            return false;
        }
    };

    const updateComment = async (commentId: number, content: string) => {
        try {
            const updatedComment = await forumRepository.updateComment(commentId, content);

            // Update in root comments
            setComments(prev =>
                prev.map(c => c.id === commentId ? updatedComment : c)
            );

            // Update in replies
            setRepliesMap(prev => {
                const updated = { ...prev };
                for (const key of Object.keys(updated)) {
                    const numKey = Number(key);
                    const state = updated[numKey];
                    if (state.comments.some(c => c.id === commentId)) {
                        updated[numKey] = {
                            ...state,
                            comments: state.comments.map(c => c.id === commentId ? updatedComment : c),
                        };
                        break;
                    }
                }
                return updated;
            });

            showToast(i18n.t('forum:comment.updateSuccess'), 'success');
            return updatedComment;
        } catch (error) {
            showToast(i18n.t('forum:comment.updateFailed'), 'error');
            return null;
        }
    };

    const updatePostDetail = (updates: Partial<Post>) => {
        setPost((prev) => prev ? { ...prev, ...updates } : null);
    };

    return {
        post,
        comments,
        loading,
        hasMoreComments,
        isLoadingMore,
        loadMoreComments,
        repliesMap,
        loadReplies,
        sendComment,
        toggleLikeDetail,
        toggleCommentLike,
        deleteComment,
        updateComment,
        updatePostDetail
    };
};