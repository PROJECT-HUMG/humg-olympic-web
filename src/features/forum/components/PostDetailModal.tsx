import { useState, useRef, useEffect, useMemo, useCallback, type MouseEvent as ReactMouseEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, Heart, MessageSquare, MoreHorizontal, Share2, CornerDownRight, Loader2, Edit2, Trash2, Check, XCircle, Flag } from 'lucide-react';
import i18n from '@/i18n';
import { Post, Comment, Author, Mention } from '@/features/forum/types/forum.types';
import { timeAgo } from '@/utils/timeAgo';
import { RepliesState } from '../hooks/usePostDetail';
import { MentionInput } from './MentionInput';
import { renderContentWithMentions } from '@/utils/mentionHelpers';
import { VerifiedBadge, StudentBadges } from '@/features/badges/components/VerifiedBadge';
import { getUserNameColor } from '@/utils/rankingHelpers';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useUserPreview } from '@/hooks/useUserPreview';
import { canEditDelete } from '@/utils/forumHelpers';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import { useAuth } from '@/contexts/AuthContext';
import { ShareButton } from '@/components/ui/ShareButton';

const DELETED_AVATAR = 'https://ui-avatars.com/api/?name=X&background=94a3b8&color=fff&rounded=true';

function synthesizeMentions(content: string, authorMap: Map<number, Author>): Mention[] {
    const mentions: Mention[] = [];
    // Sort by name length desc to match longest names first
    const sorted = [...authorMap.entries()].sort((a, b) => b[1].name.length - a[1].name.length);
    for (const [id, author] of sorted) {
        if (content.includes(`@${author.name}`)) {
            mentions.push({ userId: id, name: author.name });
        }
    }
    return mentions;
}

interface PostDetailModalProps {
    post: Post | null;
    comments: Comment[];
    loading?: boolean;
    onClose: () => void;
    onSendComment: (content: string, mentionedUserIds?: number[], parentId?: number) => Promise<boolean>;
    onLike: () => void;
    onLikeComment: (commentId: number) => void;
    currentUser?: Author;
    hasMoreComments?: boolean;
    isLoadingMore?: boolean;
    onLoadMore?: () => void;
    repliesMap: Record<number, RepliesState>;
    onLoadReplies: (commentId: number) => void;
    onDeletePost?: (postId: number) => Promise<boolean>;
    onEditPost?: () => void;
    onDeleteComment?: (commentId: number) => Promise<boolean>;
    onUpdateComment?: (commentId: number, content: string) => Promise<Comment | null>;
    onReport?: (postId: number) => void;
}

export const PostDetailModal = ({
    post,
    comments,
    loading,
    onClose,
    onSendComment,
    onLike,
    onLikeComment,
    currentUser,
    hasMoreComments = false,
    isLoadingMore = false,
    onLoadMore = () => { },
    repliesMap,
    onLoadReplies,
    onDeletePost,
    onEditPost,
    onDeleteComment,
    onUpdateComment,
    onReport
}: PostDetailModalProps) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const requireAuth = useCallback(() => {
        if (!user) {
            onClose();
            navigate('/login', { state: { from: location } });
            return false;
        }
        return true;
    }, [user, navigate, location, onClose]);
    const storedUser = useMemo(() => {
        if (currentUser) return currentUser;
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }, [currentUser]);

    const myAvatar = storedUser?.avatar || storedUser?.avatarUrl;

    const [commentText, setCommentText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
    const [isDeletingComment, setIsDeletingComment] = useState(false);
    const [isUpdatingComment, setIsUpdatingComment] = useState(false);
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replyInitialMentions, setReplyInitialMentions] = useState<{ userId: number; name: string }[]>([]);
    const [isSendingReply, setIsSendingReply] = useState(false);
    const {
        isVisible: showPreview,
        position: previewPosition,
        previewItem: previewAuthor,
        handleHoverStart,
        handleHoverEnd,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave
    } = useUserPreview<Author>();
    const commentsEndRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Unique comment authors for mention suggestions
    const commentAuthors = useMemo(() => {
        const map = new Map<number, Author>();
        for (const c of comments) {
            if (!map.has(c.author.id)) map.set(c.author.id, c.author);
        }
        return Array.from(map.values());
    }, [comments]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Build author lookup map for mention hover preview (must be before early returns)
    const authorMap = useMemo(() => {
        const map = new Map<number, Author>();
        if (post) map.set(post.author.id, post.author);
        for (const a of commentAuthors) {
            const isMe = a.id === storedUser?.id || a.id === user?.id;
            const enrichedA: Author = {
                ...a,
                avatar: a.avatar || (isMe ? (user?.avatarUrl || storedUser?.avatarUrl) : undefined) || null,
                role: a.role || (isMe ? (user?.role || storedUser?.role) : undefined) || 'STUDENT_INTERNAL',
                badges: a.badges?.length ? a.badges : (isMe ? (user?.badges || storedUser?.badges) : undefined),
                xpPoints: a.xpPoints ?? (isMe ? (user?.xpPoints ?? storedUser?.xpPoints) : undefined),
            };
            map.set(enrichedA.id, enrichedA);
        }
        return map;
    }, [commentAuthors, post, storedUser, user]);

    // Custom mention renderer with hover preview (must be before early returns)
    const renderMentionWithPreview = useCallback(
        (userId: number, name: string, key: string) => (
            <Link
                key={key}
                to={`/profile/${userId}`}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                onClick={(e: ReactMouseEvent) => e.stopPropagation()}
                onMouseEnter={(e) => {
                    const author = authorMap.get(userId);
                    if (author) handleHoverStart(author, e);
                }}
                onMouseLeave={handleHoverEnd}
            >
                @{name}
            </Link>
        ),
        [authorMap, handleHoverStart, handleHoverEnd]
    );

    if (!post && loading) {
        return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4 pb-4 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"></div>
                <div className="relative bg-white dark:bg-slate-900 w-full md:max-w-4xl h-full max-h-[85vh] md:rounded-[24px] rounded-t-[24px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-pulse">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/95 dark:bg-slate-900/95">
                        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    </div>
                    <div className="p-8 space-y-4">
                        <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    if (!post) return null;

    const handleSend = async (content: string, mentionedUserIds: number[]) => {
        if (!requireAuth()) return;
        if (!content.trim()) return;
        setIsSending(true);
        const success = await onSendComment(content, mentionedUserIds.length > 0 ? mentionedUserIds : undefined);
        setIsSending(false);
        if (success) {
            setCommentText('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(commentText, []);
        }
    };

    const handleReply = (comment: Comment) => {
        if (!requireAuth()) return;
        setReplyingToId(comment.id);
        // Don't tag yourself when replying to your own comment
        if (comment.author.id !== storedUser?.id) {
            setReplyText(`@${comment.author.name} `);
            setReplyInitialMentions([{ userId: comment.author.id, name: comment.author.name }]);
        } else {
            setReplyText('');
            setReplyInitialMentions([]);
        }
    };

    const handleSendReply = async (parentId: number, content: string, mentionedUserIds: number[]) => {
        if (!content.trim()) return;
        setIsSendingReply(true);
        const success = await onSendComment(content, mentionedUserIds.length > 0 ? mentionedUserIds : undefined, parentId);
        setIsSendingReply(false);
        if (success) {
            setReplyingToId(null);
            setReplyText('');
            setReplyInitialMentions([]);
        }
    };

    const handleCancelReply = () => {
        setReplyingToId(null);
        setReplyText('');
        setReplyInitialMentions([]);
    };

    const handleDeletePost = () => {
        if (!post || !onDeletePost) return;
        onDeletePost(post.id);
    };

    const handleDeleteComment = (commentId: number) => {
        setDeletingCommentId(commentId);
    };

    const confirmDeleteComment = async () => {
        if (!deletingCommentId || !onDeleteComment) return;
        setIsDeletingComment(true);
        await onDeleteComment(deletingCommentId);
        setIsDeletingComment(false);
        setDeletingCommentId(null);
    };

    const handleEditComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentText(comment.content);
    };

    const handleSaveComment = async () => {
        if (!editingCommentId || !onUpdateComment || !editingCommentText.trim()) return;
        setIsUpdatingComment(true);
        const result = await onUpdateComment(editingCommentId, editingCommentText);
        setIsUpdatingComment(false);
        if (result) {
            setEditingCommentId(null);
            setEditingCommentText('');
        }
    };

    const handleCancelEditComment = () => {
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    // --- Render a single comment (Facebook-style) ---
    const renderSingleComment = (comment: Comment, isReply: boolean) => {
        const avatarSize = isReply ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9';
        const parentId = isReply ? comment.parentId : comment.id;
        const authorInfo = authorMap.get(comment.author.id) || comment.author;
        const isAuthorDeleted = !!comment.author.isDeleted;
        const canEditComment = !isAuthorDeleted && user && canEditDelete(user.id, comment.author.id, user.role);

        return (
            <div className={`flex gap-2 ${isReply ? '' : 'group'}`}>
                {/* Avatar */}
                {isAuthorDeleted ? (
                    <div className="flex-shrink-0 mt-0.5">
                        <img
                            src={DELETED_AVATAR}
                            alt={i18n.t('forum:detail.deletedAccount')}
                            className={`${avatarSize} rounded-full object-cover opacity-40`}
                        />
                    </div>
                ) : (
                    <Link
                        to={`/profile/${authorInfo.id}`}
                        className="flex-shrink-0 mt-0.5"
                        onMouseEnter={(e) => handleHoverStart(authorInfo, e)}
                        onMouseLeave={handleHoverEnd}
                    >
                        <img
                            src={getAvatarUrl(authorInfo.avatar, authorInfo.name)}
                            alt="User"
                            className={`${avatarSize} rounded-full object-cover hover:opacity-80 transition-opacity`}
                            onError={(e) => handleAvatarError(e, authorInfo.name)}
                        />
                    </Link>
                )}

                <div className="flex-1 min-w-0">
                    {/* Bubble */}
                    <div className="relative inline-block max-w-full">
                        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-2xl inline-block max-w-full">
                            {editingCommentId === comment.id ? (
                                <div className="space-y-2 min-w-[200px]">
                                    <textarea
                                        className="w-full p-2 text-sm bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 resize-none"
                                        value={editingCommentText}
                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                        rows={3}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveComment}
                                            disabled={isUpdatingComment}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 flex items-center gap-1 disabled:opacity-70"
                                        >
                                            {isUpdatingComment ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {i18n.t('forum:detail.save')}
                                        </button>
                                        <button
                                            onClick={handleCancelEditComment}
                                            className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-1"
                                        >
                                            <XCircle size={14} /> {i18n.t('forum:detail.cancel')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {isAuthorDeleted ? (
                                            <span className="italic text-slate-400 dark:text-slate-500 text-[13px] leading-none">
                                                {authorInfo.name}
                                            </span>
                                        ) : (
                                            <Link
                                                to={`/profile/${authorInfo.id}`}
                                                className={`font-semibold text-[13px] hover:underline leading-none ${getUserNameColor(authorInfo.xpPoints)}`}
                                                onMouseEnter={(e) => handleHoverStart(authorInfo, e)}
                                                onMouseLeave={handleHoverEnd}
                                            >
                                                {authorInfo.name}
                                            </Link>
                                        )}
                                        {!isAuthorDeleted && <VerifiedBadge role={authorInfo.role} size={12} />}
                                        {!isAuthorDeleted && <StudentBadges badges={authorInfo.badges} maxDisplay={3} />}
                                    </div>
                                    <div className="text-[15px] text-slate-800 dark:text-slate-200 leading-snug mt-0.5 break-words">
                                        {renderContentWithMentions(
                                            comment.content,
                                            comment.mentions && comment.mentions.length > 0
                                                ? comment.mentions
                                                : synthesizeMentions(comment.content, authorMap),
                                            renderMentionWithPreview
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Like badge floating (Facebook-style) */}
                        {comment.likes > 0 && editingCommentId !== comment.id && (
                            <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 bg-white dark:bg-slate-900 rounded-full px-1.5 py-0.5 shadow-sm border border-slate-100 dark:border-slate-700 text-xs">
                                <Heart size={12} className="text-red-500 fill-red-500" />
                                <span className="text-slate-600 dark:text-slate-400 font-medium">{comment.likes}</span>
                            </div>
                        )}
                    </div>

                    {/* Action row */}
                    {editingCommentId !== comment.id && (
                        <div className="flex items-center gap-1 mt-0.5 ml-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <button
                                onClick={() => onLikeComment(comment.id)}
                                className={`hover:underline transition-colors ${comment.isLiked ? 'text-blue-600 dark:text-blue-400 font-bold' : 'hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                {i18n.t('forum:detail.like')}
                            </button>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            {/* Reply button — no reply to deleted authors */}
                            {!isAuthorDeleted && !isReply && (
                                <button
                                    onClick={() => handleReply(comment)}
                                    className="hover:underline hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                >
                                    {i18n.t('forum:detail.reply')}
                                </button>
                            )}
                            {!isAuthorDeleted && isReply && parentId ? (
                                <button
                                    onClick={() => {
                                        setReplyingToId(parentId);
                                        if (comment.author.id !== storedUser?.id) {
                                            setReplyText(`@${comment.author.name} `);
                                            setReplyInitialMentions([{ userId: comment.author.id, name: comment.author.name }]);
                                        } else {
                                            setReplyText('');
                                            setReplyInitialMentions([]);
                                        }
                                    }}
                                    className="hover:underline hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                >
                                    {i18n.t('forum:detail.reply')}
                                </button>
                            ) : null}
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <span className="text-slate-400 dark:text-slate-500 font-normal">{timeAgo(comment.created || '')}</span>
                            {canEditComment && (
                                <>
                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                    <button
                                        onClick={() => handleEditComment(comment)}
                                        className="hover:underline hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        {i18n.t('forum:detail.edit')}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="hover:underline hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        {i18n.t('forum:detail.delete')}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const canEditDeletePost = post && user ? canEditDelete(user.id, post.author.id, user.role) : false;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 pb-4 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="post-detail-title">

            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <article ref={modalRef} className="relative bg-white dark:bg-slate-900 w-full md:max-w-4xl h-full max-h-[85vh] md:rounded-[24px] rounded-t-[24px] shadow-2xl animate-fade-in-up flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">

                {/* --- HEADER --- */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 sticky top-0 rounded-t-[24px]">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-white">
                            <CornerDownRight className="rotate-180" size={24} />
                        </button>

                        <div className="flex items-center gap-3">
                            {/* Post author avatar */}
                            {post.author.isDeleted ? (
                                <div className="flex-shrink-0">
                                    <img
                                        src={DELETED_AVATAR}
                                        alt={i18n.t('forum:detail.deletedAccount')}
                                        className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-700 object-cover opacity-40"
                                    />
                                </div>
                            ) : (
                                <Link
                                    to={`/profile/${post.author.id}`}
                                    className="flex-shrink-0"
                                    onMouseEnter={(e) => handleHoverStart(post.author, e)}
                                    onMouseLeave={handleHoverEnd}
                                >
                                    <img
                                        src={getAvatarUrl(post.author.avatar, post.author.name)}
                                        alt={post.author.name}
                                        className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-700 object-cover hover:opacity-80 transition-opacity"
                                        onError={(e) => handleAvatarError(e, post.author.name)}
                                    />
                                </Link>
                            )}
                            <div>
                                <h4 className="font-bold text-sm flex items-center gap-2">
                                    {post.author.isDeleted ? (
                                        <span className="italic text-slate-400 dark:text-slate-500 text-xs">
                                            {post.author.name}
                                        </span>
                                    ) : (
                                        <Link
                                            to={`/profile/${post.author.id}`}
                                            className={`hover:underline ${getUserNameColor(post.author.xpPoints)}`}
                                            onMouseEnter={(e) => handleHoverStart(post.author, e)}
                                            onMouseLeave={handleHoverEnd}
                                        >
                                            {post.author.name}
                                        </Link>
                                    )}
                                    {!post.author.isDeleted && <VerifiedBadge role={post.author.role} size={10} />}
                                    {!post.author.isDeleted && <StudentBadges badges={post.author.badges} maxDisplay={3} />}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{timeAgo(post.createdAt)}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span className="text-humg-blue font-medium">{post.category.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <ShareButton
                            url={`${window.location.origin}/forum?post=${post.id}`}
                            title={post.title}
                            className="!p-2 !rounded-full !bg-transparent !border-none !shadow-none hover:!bg-slate-100 dark:hover:!bg-slate-800 hidden sm:block text-slate-500"
                        />
                        {user && post.author.id !== user.id && (
                            <button
                                onClick={() => onReport?.(post.id)}
                                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                                aria-label={i18n.t('forum:detail.reportPost')}
                                title={i18n.t('forum:detail.reportTooltip')}
                            >
                                <Flag size={18} />
                            </button>
                        )}
                        {canEditDeletePost && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowPostMenu(!showPostMenu)}
                                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                                    aria-label={i18n.t('forum:detail.options')}
                                >
                                    <MoreHorizontal size={20} />
                                </button>
                                {showPostMenu && (
                                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 min-w-[150px]">
                                        <button
                                            onClick={() => {
                                                setShowPostMenu(false);
                                                onEditPost?.();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                                        >
                                            <Edit2 size={16} />
                                            {i18n.t('forum:detail.editPost')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowPostMenu(false);
                                                handleDeletePost();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
                                        >
                                            <Trash2 size={16} />
                                            {i18n.t('forum:detail.deletePost')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                            aria-label={i18n.t('forum:detail.close')}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* --- BODY --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-3xl mx-auto pb-8">

                        {/* Post Content */}
                        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 mb-4 rounded-2xl md:rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 m-2 md:m-4">
                            <h2 id="post-detail-title" className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                                {post.title}
                            </h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {post.content}
                            </div>

                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-8">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={onLike}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${post.isLiked
                                        ? 'bg-red-50 text-red-500 dark:bg-red-900/20'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                    aria-label={post.isLiked ? i18n.t('forum:detail.unlikePost') : i18n.t('forum:detail.likePost')}
                                >
                                    <Heart size={22} className={post.isLiked ? 'fill-current' : ''} />
                                    <span className="font-semibold">{post.likes.toLocaleString()}</span>
                                </button>
                                <div className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400">
                                    <MessageSquare size={22} />
                                    <span className="font-semibold">{i18n.t('forum:detail.commentCount', { count: post.comments })}</span>
                                </div>
                            </div>
                        </div>



                        {/* Comments List */}
                        <div className="p-4 md:p-8">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 text-lg">
                                {i18n.t('forum:detail.commentTitle')} <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md text-sm">{post.comments.toLocaleString()}</span>
                            </h3>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex gap-4 animate-pulse">
                                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                                <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3 pb-4">
                                    {comments.length > 0 ? comments.map(rootComment => {
                                        const replies = repliesMap[rootComment.id];
                                        const replyCount = rootComment.replyCount || 0;
                                        const loadedCount = replies?.comments.length || 0;
                                        const remainingCount = replyCount - loadedCount;

                                        return (
                                            <div key={rootComment.id} className="group">
                                                {/* ── Root Comment ── */}
                                                {renderSingleComment(rootComment, false)}

                                                {/* ── Loaded Replies ── */}
                                                {replies && replies.comments.length > 0 && (
                                                    <div className="ml-11 mt-1 space-y-1">
                                                        {replies.comments.map(reply => (
                                                            <div key={reply.id} className="group">
                                                                {renderSingleComment(reply, true)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* ── View / Load More Replies Button ── */}
                                                {replyCount > 0 && remainingCount > 0 && (
                                                    <div className="ml-11 mt-1">
                                                        <button
                                                            onClick={() => onLoadReplies(rootComment.id)}
                                                            disabled={replies?.loading}
                                                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 disabled:opacity-50 py-1"
                                                        >
                                                            {replies?.loading ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <CornerDownRight size={14} />
                                                            )}
                                                            {loadedCount === 0
                                                                ? i18n.t('forum:detail.viewReplies', { count: replyCount })
                                                                : i18n.t('forum:detail.viewMoreReplies', { count: remainingCount })
                                                            }
                                                        </button>
                                                    </div>
                                                )}

                                                {/* ── Inline Reply Input ── */}
                                                {replyingToId === rootComment.id && (
                                                    <div className="ml-11 mt-2">
                                                        <MentionInput
                                                            value={replyText}
                                                            onChange={setReplyText}
                                                            onSend={(content, mentionIds) => handleSendReply(rootComment.id, content, mentionIds)}
                                                            isSending={isSendingReply}
                                                            placeholder={i18n.t('forum:detail.replyPlaceholder')}
                                                            commentAuthors={commentAuthors}
                                                            currentUserId={storedUser?.id}
                                                            postAuthor={post.author}
                                                            avatarUrl={myAvatar}
                                                            initialMentions={replyInitialMentions}
                                                            autoFocus={true}
                                                        />
                                                        <button
                                                            onClick={handleCancelReply}
                                                            className="ml-3 mt-0.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline transition-colors"
                                                        >
                                                            {i18n.t('forum:detail.cancelReply')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                            <MessageSquare size={48} className="opacity-20 mb-3" />
                                            <p className="text-sm">{i18n.t('forum:detail.noComments')}</p>
                                        </div>
                                    )}
                                    <div ref={commentsEndRef} />

                                    {/* Load More Root Comments */}
                                    {hasMoreComments && (
                                        <div className="pt-2 flex justify-center">
                                            <button
                                                onClick={onLoadMore}
                                                disabled={isLoadingMore}
                                                className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : <CornerDownRight size={16} className="rotate-90" />}
                                                {i18n.t('forum:detail.loadOlderComments')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- FOOTER: Comment Input (Facebook-style sticky bottom) --- */}
                <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 rounded-b-[24px]">
                    <MentionInput
                        value={commentText}
                        onChange={setCommentText}
                        onSend={handleSend}
                        isSending={isSending}
                        placeholder={i18n.t('forum:detail.commentPlaceholder')}
                        commentAuthors={commentAuthors}
                        currentUserId={storedUser?.id}
                        postAuthor={post.author}
                        avatarUrl={myAvatar}
                    />
                </div>


            </article>

            {/* User Preview Card */}
            {previewAuthor && (
                <UserPreviewCard
                    author={{ ...previewAuthor, xpPoints: previewAuthor.xpPoints }}
                    isVisible={showPreview}
                    position={previewPosition}
                    onMouseEnter={handlePreviewMouseEnter}
                    onMouseLeave={handlePreviewMouseLeave}
                />
            )}

            <ConfirmModal
                isOpen={!!deletingCommentId}
                onClose={() => setDeletingCommentId(null)}
                onConfirm={confirmDeleteComment}
                isLoading={isDeletingComment}
                title={i18n.t('forum:detail.deleteCommentTitle')}
                message={i18n.t('forum:detail.deleteCommentMessage')}
                confirmText={i18n.t('forum:detail.deleteCommentConfirm')}
                variant="danger"
            />
        </div>,
        document.body
    );
};