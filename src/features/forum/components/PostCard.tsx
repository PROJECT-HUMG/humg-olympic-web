import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2, MoreHorizontal, Flag, Bookmark, Trash2, Edit } from 'lucide-react';
import { Author, Post } from '@/features/forum/types/forum.types';
import { timeAgo } from '@/utils/timeAgo';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { VerifiedBadge, StudentBadges } from '@/features/badges/components/VerifiedBadge';
import { getUserNameColor } from '@/utils/rankingHelpers';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';
import { useUserPreview } from '@/hooks/useUserPreview';
import { useAuth } from '@/contexts/AuthContext';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import { ShareButton } from '@/components/ui/ShareButton';

interface PostCardProps {
    post: Post;
    onClick: () => void;
    onLike: () => void;
    onEdit?: (post: Post) => void;
    onDelete?: (post: Post) => void;
    onReport?: (postId: number) => void;
}

const DELETED_AVATAR = 'https://ui-avatars.com/api/?name=X&background=94a3b8&color=fff&rounded=true';

export const PostCard = ({ post, onClick, onLike, onEdit, onDelete, onReport }: PostCardProps) => {
    const { user } = useAuth();
    const isAuthorDeleted = !!post.author.isDeleted;
    const canEdit = !isAuthorDeleted && (user?.id === post.author.id || user?.role === 'ADMIN');

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const {
        isVisible: showPreview,
        position: previewPosition,
        previewItem: previewAuthor,
        handleHoverStart,
        handleHoverEnd,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave
    } = useUserPreview<Author>();




    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMenuAction = (action: string) => {
        setIsMenuOpen(false);
        if (action === 'report') {
            onReport?.(post.id);
        } else if (action === 'save') {
            showToast(i18n.t('forum:post.saved'), 'success');
        }
    };

    return (
        <article
            className="group bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-200 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            aria-label={i18n.t('forum:card.postAriaLabel', { title: post.title })}
        >

            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {isAuthorDeleted ? (
                        <div className="flex-shrink-0">
                            <img
                                src={DELETED_AVATAR}
                                alt={i18n.t('forum:card.deletedAccount')}
                                className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-700 object-cover opacity-50"
                            />
                        </div>
                    ) : (
                        <Link
                            to={`/profile/${post.author.id}`}
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={(e) => handleHoverStart(post.author, e)}
                            onMouseLeave={handleHoverEnd}
                            className="flex-shrink-0"
                        >
                            <img
                                src={getAvatarUrl(post.author.avatar, post.author.name)}
                                alt={post.author.name}
                                className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-700 object-cover hover:opacity-90 transition-opacity"
                                onError={(e) => handleAvatarError(e, post.author.name)}
                            />
                        </Link>
                    )}

                    {/* Meta Info */}
                    <div>
                        <h4 className="font-semibold text-sm leading-tight flex items-center gap-2">
                            {isAuthorDeleted ? (
                                <span className="italic text-slate-400 dark:text-slate-500 text-xs">
                                    {post.author.name}
                                </span>
                            ) : (
                                <Link
                                    to={`/profile/${post.author.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseEnter={(e) => handleHoverStart(post.author, e)}
                                    onMouseLeave={handleHoverEnd}
                                    className={`hover:underline text-slate-900 dark:text-slate-100 ${getUserNameColor(post.author.xpPoints)}`}
                                >
                                    {post.author.name}
                                </Link>
                            )}

                            {/* Verified Badge & Student Badges — hidden for deleted */}
                            {!isAuthorDeleted && <VerifiedBadge role={post.author.role} size={12} />}
                            {!isAuthorDeleted && <StudentBadges badges={post.author.badges} maxDisplay={2} />}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>{timeAgo(post.createdAt)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                                {post.category.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* More Menu (Dropdown) */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        aria-label={i18n.t('forum:card.options')}
                        aria-expanded={isMenuOpen}
                    >
                        <MoreHorizontal size={18} />
                    </button>

                    {/* Dropdown Content */}
                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-hidden">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleMenuAction('save'); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                            >
                                <Bookmark size={16} /> {i18n.t('forum:card.savePost')}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleMenuAction('report'); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors border-b border-slate-100 dark:border-slate-700"
                            >
                                <Flag size={16} /> {i18n.t('forum:card.report')}
                            </button>

                            {/* Edit/Delete Actions */}
                            {canEdit && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMenuOpen(false);
                                            onEdit?.(post);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                        <Edit size={16} /> {i18n.t('forum:card.editPost')}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMenuOpen(false);
                                            onDelete?.(post);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                    >
                                        <Trash2 size={16} /> {i18n.t('forum:card.deletePost')}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="mb-4">
                <h3
                    onClick={onClick}
                    className="text-base font-semibold text-slate-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug"
                >
                    {post.title}
                </h3>
                <p
                    onClick={onClick}
                    className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-2"
                >
                    {post.excerpt}
                </p>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer / Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    {/* Like Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike();
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${post.isLiked
                            ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-500'
                            }`}
                        aria-label={post.isLiked ? i18n.t('forum:card.unlike') : i18n.t('forum:card.like')}
                    >
                        <Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
                        <span className="text-xs font-medium">{post.likes.toLocaleString()}</span>
                    </button>

                    {/* Comment Button */}
                    <button
                        onClick={onClick}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label={i18n.t('forum:card.viewComments')}
                    >
                        <MessageSquare size={16} />
                        <span className="text-xs font-medium">{post.comments.toLocaleString()}</span>
                    </button>
                </div>

                {/* Share Button */}
                <div onClick={(e) => e.stopPropagation()}>
                    <ShareButton
                        url={`${window.location.origin}/forum?post=${post.id}`}
                        title={post.title}
                        className="!bg-transparent !border-none !shadow-none !p-1.5 hover:!bg-slate-100 dark:hover:!bg-slate-700 text-slate-400"
                    />
                </div>
            </div>

            {/* User Preview Card — only for non-deleted authors */}
            {previewAuthor && !isAuthorDeleted && (
                <UserPreviewCard
                    author={{ ...previewAuthor, xpPoints: previewAuthor.xpPoints }}
                    isVisible={showPreview}
                    position={previewPosition}
                    onMouseEnter={handlePreviewMouseEnter}
                    onMouseLeave={handlePreviewMouseLeave}
                />
            )}
        </article>
    );
};