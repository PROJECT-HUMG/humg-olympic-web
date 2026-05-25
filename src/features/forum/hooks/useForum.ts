import { useState, useEffect, useCallback, useRef } from "react";
import { forumRepository } from "@/features/forum/api";
import { Post, Category, CreatePostDTO, UpdatePostDTO } from "@/features/forum/types/forum.types";
import { showToast } from "@/components/ui/Toast";
import i18n from '@/i18n';

export const useForum = (limit: number = 10) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [sort, setSort] = useState<'latest' | 'popular'>('latest');

    const categoriesFetchedRef = useRef(false);
    const lastFetchParamsRef = useRef<string>("");

    const likeTimeouts = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    useEffect(() => {
        return () => {
            Object.values(likeTimeouts.current).forEach((timer) =>
                clearTimeout(timer),
            );
        };
    }, []);

    useEffect(() => {
        if (categoriesFetchedRef.current) return;
        categoriesFetchedRef.current = true;

        const loadMetadata = async () => {
            try {
                const cats = await forumRepository.getCategories();
                setCategories(cats);
            } catch (e) {
            }
        };
        loadMetadata();
    }, []);

    const fetchPosts = useCallback(
        async (force = false) => {
            const paramsKey = JSON.stringify({
                category: activeCategory,
                search: searchQuery,
                page: currentPage,
                limit: limit,
                sort: sort,
            });

            if (!force && lastFetchParamsRef.current === paramsKey) {
                return;
            }

            lastFetchParamsRef.current = paramsKey;
            setLoading(true);

            try {
                const response = await forumRepository.getPosts({
                    category: activeCategory,
                    search: searchQuery,
                    page: currentPage,
                    limit: limit,
                    sort: sort,
                });

                setPosts(response.data);
                setTotalItems(response.total);
            } catch (error) {
                setPosts([]);
                lastFetchParamsRef.current = "";
            } finally {
                setLoading(false);
                window.dispatchEvent(new Event('notification:poll'));
            }
        },
        [activeCategory, searchQuery, currentPage, limit, sort],
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPosts();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchPosts]);

    const handleCategoryChange = (id: string) => {
        if (id === activeCategory) return;
        setActiveCategory(id);
        setCurrentPage(1);
    };

    const handleSearchChange = (query: string) => {
        if (query === searchQuery) return;
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handleSortChange = (newSort: 'latest' | 'popular') => {
        if (newSort === sort) return;
        setSort(newSort);
        setCurrentPage(1);
    };

    const createPost = async (data: CreatePostDTO) => {
        try {
            const newPost = await forumRepository.createPost(data);
            setPosts((prev) => [newPost, ...prev]);
            showToast(i18n.t('forum:post.createSuccess'), "success");
            return true;
        } catch (error) {
            showToast(i18n.t('forum:post.createFailed'), "error");
            return false;
        }
    };

    const toggleLikePost = async (postId: number) => {
        setPosts((prevPosts) =>
            prevPosts.map((p) => {
                if (p.id === postId) {
                    const isLiked = !p.isLiked;
                    return {
                        ...p,
                        isLiked,
                        likes: isLiked ? p.likes + 1 : p.likes - 1,
                    };
                }
                return p;
            }),
        );

        if (likeTimeouts.current[postId]) {
            clearTimeout(likeTimeouts.current[postId]);
            delete likeTimeouts.current[postId];
        } else {
            likeTimeouts.current[postId] = setTimeout(async () => {
                try {
                    const response = await forumRepository.toggleLike(postId);

                    setPosts((prevPosts) =>
                        prevPosts.map((p) => {
                            if (p.id === postId) {
                                return {
                                    ...p,
                                    isLiked: response.liked,
                                    likes: response.newCount,
                                };
                            }
                            return p;
                        }),
                    );
                } catch (error) {
                } finally {
                    delete likeTimeouts.current[postId];
                }
            }, 600);
        }
    };

    const updatePostInList = (postId: number, updates: Partial<Post>) => {
        setPosts((prevPosts) =>
            prevPosts.map((p) =>
                p.id === postId ? { ...p, ...updates } : p
            )
        );
    };

    const deletePost = async (postId: number) => {
        try {
            await forumRepository.deletePost(postId);
            setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
            showToast(i18n.t('forum:post.deleteSuccess'), "success");
            return true;
        } catch (error) {
            showToast(i18n.t('forum:post.deleteFailed'), "error");
            return false;
        }
    };

    const updatePost = async (postId: number, data: UpdatePostDTO) => {
        try {
            const updatedPost = await forumRepository.updatePost(postId, data);
            setPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p.id === postId ? updatedPost : p
                )
            );
            showToast(i18n.t('forum:post.updateSuccess'), "success");
            return updatedPost;
        } catch (error) {
            showToast(i18n.t('forum:post.updateFailed'), "error");
            return null;
        }
    };

    return {
        posts,
        categories,
        loading,
        activeCategory,
        searchQuery,
        sort,
        totalItems,
        currentPage,
        setCurrentPage,
        setCategory: handleCategoryChange,
        setSearch: handleSearchChange,
        setSort: handleSortChange,
        refresh: () => fetchPosts(true),
        createPost,
        toggleLikePost,
        updatePostInList,
        deletePost,
        updatePost,
    };
};
