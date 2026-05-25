import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Inverse of ProtectedRoute — blocks already-authenticated users
 * from accessing public auth pages (login, register, etc.).
 * Redirects them to the homepage instead.
 */
export const GuestRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
