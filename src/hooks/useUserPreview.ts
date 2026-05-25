import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

interface UseUserPreviewOptions {
  showDelay?: number;
  hideDelay?: number;
  offset?: number;
}

const DEFAULT_OPTIONS: Required<UseUserPreviewOptions> = {
  showDelay: 400,
  hideDelay: 200,
  offset: 12,
};

export const useUserPreview = <T>(options?: UseUserPreviewOptions) => {
  const { showDelay, hideDelay, offset } = { ...DEFAULT_OPTIONS, ...options };

  const [isVisible, setIsVisible] = useState(false);
  const [previewItem, setPreviewItem] = useState<T | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveringTargetRef = useRef(false);
  const isHoveringPreviewRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveringTargetRef.current && !isHoveringPreviewRef.current) {
        setIsVisible(false);
        setPreviewItem(null);
      }
    }, hideDelay);
  }, [hideDelay]);

  const handleHoverStart = useCallback(
    (item: T, e: MouseEvent) => {
      isHoveringTargetRef.current = true;

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX;
      const y = rect.bottom + offset;
      const targetRect = { x, y, width: rect.width, height: rect.height };

      if (isVisible) {
        setPreviewItem(item);
        setPosition(targetRect);
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      } else {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
          setPreviewItem(item);
          setPosition(targetRect);
          setIsVisible(true);
        }, showDelay);
      }
    },
    [offset, showDelay, isVisible],
  );

  const handleHoverEnd = useCallback(() => {
    isHoveringTargetRef.current = false;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    scheduleHide();
  }, [scheduleHide]);

  const handlePreviewMouseEnter = useCallback(() => {
    isHoveringPreviewRef.current = true;
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handlePreviewMouseLeave = useCallback(() => {
    isHoveringPreviewRef.current = false;
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    isVisible,
    position,
    previewItem,
    handleHoverStart,
    handleHoverEnd,
    handlePreviewMouseEnter,
    handlePreviewMouseLeave,
  };
};
