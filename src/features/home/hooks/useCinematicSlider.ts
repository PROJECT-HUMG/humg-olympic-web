import { useState, useRef, useEffect, useCallback } from "react";

interface CinematicSliderConfig {
  count: number;
  duration?: number;
}

export const useCinematicSlider = ({
  count,
  duration = 15000,
}: CinematicSliderConfig) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const startTime = useRef<number | null>(null);
  const rafId = useRef(0);

  const tick = useCallback((time: number) => {
    if (count === 0) return;

    if (startTime.current === null) {
      startTime.current = time;
    }

    const elapsed = time - startTime.current;
    const rawProgress = Math.min(elapsed / duration, 1);

    setProgress(rawProgress);

    if (elapsed >= duration) {
      setCurrentIndex((prev) => (prev + 1) % count);
      startTime.current = time;
      setProgress(0);
    }

    rafId.current = requestAnimationFrame(tick);
  }, [count, duration]);

  useEffect(() => {
    if (count === 0) return;
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [count, tick]);

  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
    startTime.current = null;
  }, [count]);

  return { currentIndex, progress };
};
