import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { showToast } from '../../../components/ui/Toast';
import i18n from '@/i18n';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();
    const hasShownToast = useRef(false);

    // #6 fix: reset toast tracker when location changes
    useEffect(() => {
        hasShownToast.current = false;
    }, [location.pathname]);


    useEffect(() => {
        if (!isLoading && !isAuthenticated && !hasShownToast.current) {
            hasShownToast.current = true;
            showToast(i18n.t('auth:loginRequired'), 'error');
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-white dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-humg-blue"></div>
            </div>
        );
    }


    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }


    if (allowedRoles && user && !allowedRoles.includes(user.role)) {

        if (!hasShownToast.current) {
            showToast(i18n.t('auth:noPermission'), 'error');
            hasShownToast.current = true;
        }
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};