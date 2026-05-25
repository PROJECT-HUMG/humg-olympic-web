import { lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardSkeleton } from '../components/DashboardSkeleton';

const AdminDashboard = lazy(() => import('../components/views/dashboard/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const LecturerDashboard = lazy(() => import('../components/views/dashboard/LecturerDashboard').then(m => ({ default: m.LecturerDashboard })));
const StudentDashboard = lazy(() => import('../components/views/dashboard/StudentDashboard').then(m => ({ default: m.StudentDashboard })));

export const DashboardPage = () => {
    const { user } = useAuth();
    const { data, loading, userRole } = useDashboard();

    const skeleton = <DashboardSkeleton role={userRole as 'STUDENT' | 'LECTURER' | 'ADMIN'} isInternalStudent={user?.role === 'STUDENT_INTERNAL'} />;

    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">

            <div className="container mx-auto px-4 md:px-6">

                {/* Content based on Role */}
                {loading || !data ? skeleton : (
                    <Suspense fallback={skeleton}>
                        {userRole === 'ADMIN' ? (
                            <AdminDashboard data={data} />
                        ) : userRole === 'LECTURER' ? (
                            <LecturerDashboard data={data} />
                        ) : (
                            <StudentDashboard data={data} />
                        )}
                    </Suspense>
                )}

            </div>
        </div>
    );
};