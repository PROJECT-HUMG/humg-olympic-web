
import { Suspense, lazy } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GlobalSpinner } from '../components/ui/GlobalSpinner';

const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const GuestHomeView = lazy(() => import('../features/home/components/GuestHomeView').then(m => ({ default: m.GuestHomeView })));

export const HomeRouteWrapper = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <GlobalSpinner />;

    return (
        <Suspense fallback={<GlobalSpinner />}>
            {isAuthenticated ? <DashboardPage /> : <GuestHomeView />}
        </Suspense>
    );
};
