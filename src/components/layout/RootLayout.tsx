
import { useEffect } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { NavigationProgress } from '../ui/NavigationProgress';
import { usePageTracking } from '@/hooks/usePageTracking';

export const RootLayout = () => {
    // Clean up chunk-reload flag on successful mount
    useEffect(() => {
        sessionStorage.removeItem('chunk_reload');
    }, []);

    // Google Analytics: track SPA page views
    usePageTracking();

    return (
        <>
            <ScrollRestoration />
            <NavigationProgress />
            <Outlet />
        </>
    );
};
