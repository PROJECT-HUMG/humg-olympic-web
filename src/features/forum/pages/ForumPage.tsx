import { useState } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, MessageSquare, Plus, Clock, TrendingUp, HelpCircle, X, Flag, Loader2, LogIn } from 'lucide-react';
import { CategorySidebar } from '../components/CategorySidebar';
import { PostCard } from '../components/PostCard';
import { PostDetailModal } from '../components/PostDetailModal';
import { CreatePostModal } from '../components/CreatePostModal';
import { useForum } from '../hooks/useForum';
import { usePostDetail } from '../hooks/usePostDetail';
import { Post, ReportReason, CreatePostDTO } from '@/features/forum/types/forum.types';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { forumRepository } from '@/features/forum/api';
import { ApiError } from '@/lib/api/apiClient';


export const ForumPage = () => {

    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const requireAuth = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } });
            return true;
        }
        return false;
    };
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedPostId = searchParams.get('post');


    const {
        posts,
        categories,
        loading,
        activeCategory,
        searchQuery,
        sort,
        setCategory,
        setSearch,
        setSort,
        createPost,
        toggleLikePost,
        updatePostInList,
        deletePost,
        updatePost
    } = useForum(10);


    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
    const [isDeletingPost, setIsDeletingPost] = useState(false);

    // Report state
    const [reportingPostId, setReportingPostId] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState<ReportReason>('SPAM');
    const [reportDescription, setReportDescription] = useState('');
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);


    const {
        post: detailPost,
        comments: detailComments,
        loading: detailLoading,
        sendComment,
        toggleLikeDetail,
        toggleCommentLike,
        hasMoreComments,
        isLoadingMore,
        loadMoreComments,
        repliesMap,
        loadReplies,
        deleteComment,
        updateComment,
        updatePostDetail
    } = usePostDetail(selectedPostId);



    const handlePostClick = (post: Post) => {
        setSearchParams(prev => {
            prev.set('post', String(post.id));
            return prev;
        });
    };

    const handleCloseDetail = () => {
        // Sync post data từ detail về list trước khi đóng
        if (detailPost) {
            updatePostInList(detailPost.id, {
                likes: detailPost.likes,
                comments: detailPost.comments,
                isLiked: detailPost.isLiked
            });
        }

        setSearchParams(prev => {
            prev.delete('post');
            return prev;
        });
    };

    const handleClearSearch = () => {
        setSearch('');
    };

    const handleDeletePost = (postId: number) => {
        setDeletingPostId(postId);
    };

    const confirmDeletePost = async () => {
        if (!deletingPostId) return;
        setIsDeletingPost(true);
        const success = await deletePost(deletingPostId);
        setIsDeletingPost(false);
        if (success) {
            handleCloseDetail();
        }
        setDeletingPostId(null);
    };

    const handleEditPost = (post: Post) => {
        setEditingPost(post);
        setIsCreateModalOpen(true);
    };

    const handleModalSubmit = async (data: CreatePostDTO): Promise<boolean> => {
        if (editingPost) {
            const result = await updatePost(editingPost.id, data);
            if (result) {
                if (detailPost && detailPost.id === editingPost.id) {
                    updatePostDetail(result);
                }
                updatePostInList(editingPost.id, result);
                return true;
            }
            return false;
        } else {
            const result = await createPost(data);
            return !!result;
        }
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setEditingPost(null);
    };

    const handleOpenReport = (postId: number) => {
        setReportingPostId(postId);
        setReportReason('SPAM');
        setReportDescription('');
    };

    const handleSubmitReport = async () => {
        if (!reportingPostId) return;
        setIsSubmittingReport(true);
        try {
            await forumRepository.reportPost(reportingPostId, {
                reason: reportReason,
                description: reportDescription.trim() || undefined,
            });
            showToast(i18n.t('forum:report.success'), 'success');
            setReportingPostId(null);
        } catch (err: unknown) {
            if (err instanceof ApiError && err.status === 409) {
                showToast(i18n.t('forum:report.alreadyReported'), 'info');
                setReportingPostId(null);
            } else {
                showToast(i18n.t('forum:report.failed'), 'error');
            }
        } finally {
            setIsSubmittingReport(false);
        }
    };



    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">

            {/* --- HEADER SECTION --- */}
            <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                    <section className="mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                        <MessageSquare className="text-blue-600 dark:text-blue-400" size={24} />
                                    </div>
                                    {i18n.t('forum:page.title')}
                                </h1>
                                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
                                    {i18n.t('forum:page.subtitle')}
                                </p>
                            </div>

                            {isAuthenticated ? (
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Plus size={18} />
                                    {i18n.t('forum:page.askQuestion')}
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    state={{ from: location }}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm"
                                >
                                    <LogIn size={18} />
                                    {i18n.t('forum:page.loginToJoin')}
                                </Link>
                            )}
                        </div>
                    </section>

                    {/* --- MAIN CONTENT --- */}
                    <section>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                            {/* --- LEFT COLUMN: CATEGORIES (Sticky) --- */}
                            <div className="lg:col-span-1 hidden lg:block">
                                <div className="sticky top-28 space-y-4">
                                    <CategorySidebar
                                        categories={categories}
                                        activeCategory={activeCategory}
                                        onSelect={setCategory}
                                    />

                                    {/* Widget Tips */}
                                    <div className="bg-amber-50 dark:bg-slate-800 rounded-xl p-4 border border-amber-100 dark:border-slate-700">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 text-sm flex items-center gap-2">
                                            {i18n.t('forum:page.tipTitle')}
                                        </h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {i18n.t('forum:page.tipContent')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* --- MOBILE CATEGORY (Horizontal Scroll) --- */}
                            <div className="lg:hidden col-span-1 -mx-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
                                <div className="flex gap-2 min-w-max">
                                    <button
                                        onClick={() => setCategory('all')}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${activeCategory === 'all'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        {i18n.t('forum:page.all')}
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setCategory(String(cat.id))}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${activeCategory === String(cat.id)
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* --- RIGHT COLUMN: FEED --- */}
                            <div className="lg:col-span-3 space-y-4">

                                {/* Toolbar: Search & Sort Tabs */}
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">

                                    {/* Search Box */}
                                    <div className="flex-1 relative group">
                                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder={i18n.t('forum:page.searchPlaceholder')}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm outline-none border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-colors text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                            value={searchQuery}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={handleClearSearch}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Sort Tabs */}
                                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                                        <button
                                            onClick={() => setSort('latest')}
                                            className={`px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-colors ${sort === 'latest'
                                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            <Clock size={14} /> {i18n.t('forum:page.sortNewest')}
                                        </button>
                                        <button
                                            onClick={() => setSort('popular')}
                                            className={`px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-colors ${sort === 'popular'
                                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            <TrendingUp size={14} /> {i18n.t('forum:page.sortPopular')}
                                        </button>
                                    </div>
                                </div>

                                {/* Posts List */}
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(n => (
                                            <div key={n} className="bg-white dark:bg-slate-800 rounded-xl p-5 h-32 animate-pulse border border-slate-200 dark:border-slate-700">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                                    <div className="flex-1 space-y-3">
                                                        <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                        <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : posts.length > 0 ? (
                                    <div className="space-y-3">
                                        {posts.map(post => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                                onClick={() => handlePostClick(post)}
                                                onLike={() => {
                                                    if (requireAuth()) return;
                                                    toggleLikePost(post.id);
                                                }}
                                                onEdit={handleEditPost}
                                                onDelete={(p) => handleDeletePost(p.id)}
                                                onReport={handleOpenReport}
                                            />
                                        ))}

                                        {/* End of List Indicator */}
                                        <div className="text-center pt-4 pb-6">
                                            <p className="text-xs text-slate-400 dark:text-slate-500">{i18n.t('forum:page.allDisplayed')}</p>
                                        </div>
                                    </div>
                                ) : (

                                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-500">
                                            <HelpCircle size={32} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                            {i18n.t('forum:page.noPostsTitle')}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs text-center mb-5">
                                            {i18n.t('forum:page.noPostsHint')}
                                        </p>
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="px-5 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                                        >
                                            {i18n.t('forum:page.createPostNow')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* --- MODALS --- */}
            {selectedPostId && (
                <PostDetailModal
                    post={detailPost}
                    comments={detailComments}
                    loading={detailLoading}
                    onClose={handleCloseDetail}
                    onSendComment={sendComment}
                    onLike={() => {
                        if (requireAuth()) return;
                        toggleLikeDetail();
                    }}
                    onLikeComment={(commentId) => {
                        if (requireAuth()) return;
                        toggleCommentLike(commentId);
                    }}
                    hasMoreComments={hasMoreComments}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={loadMoreComments}
                    repliesMap={repliesMap}
                    onLoadReplies={loadReplies}
                    onDeletePost={async (id: number) => { handleDeletePost(id); return false; }}
                    onEditPost={() => detailPost && handleEditPost(detailPost)}
                    onDeleteComment={deleteComment}
                    onUpdateComment={updateComment}
                    onReport={handleOpenReport}
                />
            )}

            <CreatePostModal
                isOpen={isCreateModalOpen}
                categories={categories}
                onClose={handleCloseCreateModal}
                onSubmit={handleModalSubmit}
                postToEdit={editingPost}
            />

            <ConfirmModal
                isOpen={!!deletingPostId}
                onClose={() => setDeletingPostId(null)}
                onConfirm={confirmDeletePost}
                isLoading={isDeletingPost}
                title={i18n.t('forum:page.deletePostTitle')}
                message={i18n.t('forum:page.deletePostMessage')}
                confirmText={i18n.t('forum:page.deletePostConfirm')}
                variant="danger"
            />

            {/* Report Modal */}
            {reportingPostId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReportingPostId(null)} />
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Flag size={18} className="text-red-500" /> {i18n.t('forum:page.reportTitle')}
                            </h3>
                            <button onClick={() => setReportingPostId(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <X size={18} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{i18n.t('forum:page.reportReasonLabel')}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['SPAM', 'OFFENSIVE', 'MISINFORMATION', 'OTHER'] as ReportReason[]).map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => setReportReason(value)}
                                            className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${reportReason === value
                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                                }`}
                                        >
                                            {i18n.t(`forum:page.reportReasons.${value}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{i18n.t('forum:page.reportDescLabel')} <span className="text-slate-400 font-normal">{i18n.t('forum:page.reportDescOptional')}</span></label>
                                <textarea
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    placeholder={i18n.t('forum:page.reportDescPlaceholder')}
                                    maxLength={500}
                                    rows={3}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
                                />
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                            <button
                                onClick={() => setReportingPostId(null)}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                {i18n.t('forum:page.reportCancel')}
                            </button>
                            <button
                                onClick={handleSubmitReport}
                                disabled={isSubmittingReport}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
                            >
                                {isSubmittingReport && <Loader2 size={14} className="animate-spin" />}
                                {i18n.t('forum:page.reportSubmit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Mobile FAB — auth only */}
            {isAuthenticated && (
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="lg:hidden fixed bottom-20 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-blue-700 transition-colors"
                    aria-label={i18n.t('forum:page.createPostLabel')}
                >
                    <Plus size={24} />
                </button>
            )}

        </div>
    );
};