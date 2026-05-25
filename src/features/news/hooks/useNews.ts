import { useState, useEffect, useCallback, useRef } from "react";
import { newsRepository } from "@/features/news/api";
import { NewsItem } from "@/features/news/types/news.types";

interface UseNewsParams {
  itemsPerPage?: number;
  page?: number;
  category?: string;
  search?: string;
}

export const useNews = ({
  itemsPerPage = 6,
  page = 1,
  category = "all",
  search = "",
}: UseNewsParams = {}) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const featuredFetchedRef = useRef(false);
  const lastFetchParamsRef = useRef<string>("");

  useEffect(() => {
    if (featuredFetchedRef.current) return;
    featuredFetchedRef.current = true;

    const fetchFeatured = async () => {
      try {
        const data = await newsRepository.getFeaturedNews();
        setFeaturedNews(data);
      } catch (error) {
      }
    };
    fetchFeatured();
  }, []);

  const fetchNews = useCallback(
    async (force = false) => {
      const paramsKey = JSON.stringify({
        page,
        limit: itemsPerPage,
        category,
        search,
      });

      if (!force && lastFetchParamsRef.current === paramsKey) return;
      lastFetchParamsRef.current = paramsKey;

      setLoading(true);
      try {
        const response = await newsRepository.getNews({
          page,
          limit: itemsPerPage,
          category,
          search,
        });

        setNewsItems(response.data);
        setTotalItems(response.total);
      } catch (error) {
        setNewsItems([]);
        setTotalItems(0);
        lastFetchParamsRef.current = "";
      } finally {
        setLoading(false);
      }
    },
    [page, itemsPerPage, category, search],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchNews();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchNews]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    newsItems,
    featuredNews,
    loading,
    currentPage: page,
    totalPages,
    totalItems,
    activeCategory: category,
    searchQuery: search,
    refresh: () => fetchNews(true),
  };
};
