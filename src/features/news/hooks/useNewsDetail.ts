import { useState, useEffect, useCallback } from "react";
import { newsRepository } from "@/features/news/api";
import { NewsItem } from "@/features/news/types/news.types";
import i18n from '@/i18n';

export const useNewsDetail = (identifier: string | null) => {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingFeatured, setIsSettingFeatured] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!identifier) return;
    setLoading(true);
    setError(null);
    try {
      const data = await newsRepository.getNewsBySlug(identifier);
      if (data) setNews(data);
      else setError(i18n.t('news:notFound'));
    } catch {
      setError(i18n.t('news:loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    if (!identifier) {
      setLoading(false);
      return;
    }
    fetchDetail();
  }, [identifier, fetchDetail]);

  const setFeatured = useCallback(async (id: number, featured: boolean) => {
    setIsSettingFeatured(true);
    try {
      const updated = await newsRepository.setFeatured(id, featured);
      if (news?.id === id) setNews(updated);
      return updated;
    } finally {
      setIsSettingFeatured(false);
    }
  }, [news?.id]);

  const deleteNews = useCallback(async (id: number) => {
    setIsDeleting(true);
    try {
      await newsRepository.deleteNews(id);
      setNews(null);
      return true;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const refreshNews = useCallback(() => {
    if (identifier) fetchDetail();
  }, [identifier, fetchDetail]);

  return { news, loading, error, setFeatured, isSettingFeatured, deleteNews, isDeleting, refreshNews };
};
