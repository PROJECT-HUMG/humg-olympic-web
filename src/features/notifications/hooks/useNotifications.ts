import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { notificationRepository } from "@/features/notifications/api";
import { Notification } from "@/features/notifications/types/notification.types";
import { showToast, toast } from "@/components/ui/Toast";
import i18n from '@/i18n';
import { useAuth } from "@/contexts/AuthContext";

const THROTTLE_MS = 5_000; // minimum 5s between unread-count calls

export const useNotifications = (limit: number = 10) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const lastPollTimeRef = useRef(0);
  const prevUnreadCountRef = useRef(0);
  const isFirstPollRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setPage(0);
    try {
      const response = await notificationRepository.getNotifications({
        filter,
        limit,
        page: 0,
      });
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
      setHasMore(response.data.length < response.total);
      setHasFetchedOnce(true);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filter, limit, isAuthenticated]);

  const loadMore = useCallback(async () => {
    if (!isAuthenticated || loadingMore || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const response = await notificationRepository.getNotifications({
        filter,
        limit,
        page: nextPage,
      });
      setNotifications(prev => [...prev, ...response.data]);
      setPage(nextPage);
      setHasMore(notifications.length + response.data.length < response.total);
      setUnreadCount(response.unreadCount);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }, [isAuthenticated, loadingMore, hasMore, page, filter, limit, notifications.length]);

  // Throttled poll — prevents duplicate calls within THROTTLE_MS
  const throttledPollUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    const now = Date.now();
    if (now - lastPollTimeRef.current < THROTTLE_MS) return;
    lastPollTimeRef.current = now;

    try {
      const count = await notificationRepository.getUnreadCount();
      setUnreadCount(count);
    } catch {
    }
  }, [isAuthenticated]);

  // Detect new notifications and show toast
  useEffect(() => {
    if (isFirstPollRef.current) {
      prevUnreadCountRef.current = unreadCount;
      isFirstPollRef.current = false;
      return;
    }

    const diff = unreadCount - prevUnreadCountRef.current;
    if (diff > 0) {
      toast.info(i18n.t('features:notifications.newNotifications', { count: diff }), {
        description: i18n.t('features:notifications.bellDescription'),
        duration: 5000,
      });
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);


  // Poll on route change (throttled — won't fire if <5s since last poll)
  useEffect(() => {
    if (!isAuthenticated) return;
    throttledPollUnreadCount();
  }, [location.pathname, isAuthenticated, throttledPollUnreadCount]);

  // Poll on tab focus (reuses throttle — won't fire if <5s since last poll)
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') throttledPollUnreadCount();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isAuthenticated, throttledPollUnreadCount]);

  // Poll when other features dispatch 'notification:poll' (e.g. forum data fetches)
  useEffect(() => {
    if (!isAuthenticated) return;
    const handlePollEvent = () => throttledPollUnreadCount();
    window.addEventListener('notification:poll', handlePollEvent);
    return () => window.removeEventListener('notification:poll', handlePollEvent);
  }, [isAuthenticated, throttledPollUnreadCount]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setHasFetchedOnce(false);
      isFirstPollRef.current = true;
      prevUnreadCountRef.current = 0;
      setPage(0);
      setHasMore(true);
    }
  }, [isAuthenticated]);

  // Reset and refetch when filter changes
  useEffect(() => {
    if (isAuthenticated && hasFetchedOnce) {
      fetchNotifications();
    }
  }, [filter]);

  const markAsRead = async (id: number) => {
    if (!isAuthenticated) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationRepository.markAsRead(id);
    } catch {
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    showToast(i18n.t('features:notifications.markedAllRead'), "success");

    try {
      await notificationRepository.markAllAsRead();
    } catch {
    }
  };

  const deleteNotification = async (id: number) => {
    if (!isAuthenticated) return;

    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    showToast(i18n.t('features:notifications.deleteSuccess'), "success");

    try {
      await notificationRepository.deleteNotification(id);
    } catch {
      showToast(i18n.t('features:notifications.deleteFailed'), "error");
      fetchNotifications();
    }
  };

  return {
    notifications,
    loading,
    loadingMore,
    hasMore,
    unreadCount,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    loadMore,
    refresh: fetchNotifications,
  };
};
