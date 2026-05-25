import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Sends a page_view event to Google Analytics on every route change.
 * We disable the automatic page_view in gtag config (send_page_view: false)
 * and fire it manually here so SPA navigations are tracked correctly.
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
      send_to: GA_ID,
    });
  }, [location.pathname, location.search]);
}
