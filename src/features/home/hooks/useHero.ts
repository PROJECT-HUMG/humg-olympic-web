import { useState, useEffect, useRef } from "react";
import { heroRepository } from "@/features/hero/api";
import { HeroSlideResponse } from "@/features/hero/types/hero.types";

export const useHero = () => {
  const [slides, setSlides] = useState<HeroSlideResponse[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [slidesData, videoData] = await Promise.all([
          heroRepository.getHeroSlides(),
          heroRepository.getVideoIntroduction(),
        ]);

        setSlides(slidesData);
        setVideoUrl(videoData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { slides, videoUrl, loading };
};
