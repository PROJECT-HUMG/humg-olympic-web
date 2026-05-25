
import { useEffect } from 'react';
import { RouteObject, Outlet, useRouteError } from 'react-router-dom';
import { lazyPage } from '../lib/routerUtils';
import i18n from '@/i18n';
import { RootLayout } from '../components/layout/RootLayout';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { GuestRoute } from '../features/auth/components/GuestRoute';
import { NotFoundView } from '../components/ui/NotFoundView';
import { HomeRouteWrapper } from './HomeRouteWrapper';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

const FullScreenLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
);
const ChunkErrorBoundary = () => {
    const error = useRouteError() as Error | null;
    const isChunkError = error?.message?.includes('Failed to fetch dynamically imported module')
        || error?.message?.includes('Importing a module script failed');

    useEffect(() => {
        if (isChunkError) {
            const reloaded = sessionStorage.getItem('chunk_reload');
            if (!reloaded) {
                sessionStorage.setItem('chunk_reload', '1');
                window.location.reload();
            }
        }
    }, [isChunkError]);

    if (isChunkError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-6">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-spin" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{i18n.t('common:chunkError.updating')}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                        {i18n.t('common:chunkError.newVersionDeployed')}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
                    >
                        {i18n.t('common:chunkError.reloadNow')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-6">
            <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{i18n.t('common:chunkError.errorOccurred')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    {error?.message || i18n.t('common:chunkError.unknownError')}
                </p>
                <button
                    onClick={() => window.history.back()}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                    {i18n.t('common:back')}
                </button>
            </div>
        </div>
    );
};

export const appRoutes: RouteObject[] = [
    {
        element: <RootLayout />,
        HydrateFallback: FullScreenLoader,
        errorElement: <ChunkErrorBoundary />,
        children: [
            {
                element: <GuestRoute />,
                children: [
                    {
                        path: '/login',
                        lazy: lazyPage(() => import('../features/auth/components/AuthPage'), 'AuthPage', { initialView: 'login' }),
                    },
                    {
                        path: '/register',
                        lazy: lazyPage(() => import('../features/auth/components/AuthPage'), 'AuthPage', { initialView: 'register' }),
                    },
                    {
                        path: '/forgot-password',
                        lazy: lazyPage(() => import('../features/auth/components/AuthPage'), 'AuthPage', { initialView: 'forgot_password' }),
                    },
                    {
                        path: '/check-email',
                        lazy: lazyPage(() => import('../features/auth/components/AuthPage'), 'AuthPage', { initialView: 'check_email' }),
                    },
                    {
                        path: '/auth/reset-password',
                        lazy: lazyPage(() => import('../features/auth/components/ResetPasswordPage'), 'ResetPasswordPage'),
                    },
                    {
                        path: '/auth/google/complete',
                        lazy: lazyPage(() => import('../features/auth/components/AuthPage'), 'AuthPage', { initialView: 'google_complete' }),
                    },
                    {
                        path: '/auth/edu-verify',
                        lazy: lazyPage(() => import('../features/auth/components/AuthPage'), 'AuthPage', { initialView: 'google_edu' }),
                    },
                ],
            },
            {
                path: '/auth/email/verify',
                lazy: lazyPage(() => import('../features/auth/components/VerifyEmailPage'), 'VerifyEmailPage'),
            },
            {
                path: '/auth/google/university-email/verify',
                lazy: lazyPage(() => import('../features/auth/components/VerifyEduPage'), 'VerifyEduPage'),
            },
            {
                path: '/auth/google/callback',
                lazy: lazyPage(() => import('../features/auth/components/AuthPage'), 'AuthPage', { initialView: 'google_callback' }),
            },
            {
                path: '/',
                element: <MainLayout />,
                errorElement: <NotFoundView pageName="Error" onHomeClick={() => window.location.href = '/'} />,
                children: [
                    {
                        children: [
                            { index: true, element: <HomeRouteWrapper /> },
                            {
                                path: 'news',
                                lazy: lazyPage(() => import('../features/news/pages/NewsPage'), 'NewsPage')
                            },
                            {
                                path: 'news/:slug',
                                lazy: lazyPage(() => import('../features/news/pages/NewsDetailPage'), 'NewsDetailPage')
                            },
                            {
                                path: 'competitions',
                                lazy: lazyPage(() => import('../features/competitions/pages/CompetitionsPage'), 'CompetitionsPage')
                            },
                            {
                                path: 'competitions/:slug',
                                lazy: lazyPage(() => import('../features/competitions/pages/CompetitionDetailPage'), 'CompetitionDetailPage')
                            },
                            {
                                path: 'resources',
                                lazy: lazyPage(() => import('../features/resources/pages/ResourcesPage'), 'ResourcesPage')
                            },
                            {
                                path: 'rankings',
                                lazy: lazyPage(() => import('../features/ranking/pages/RankingPage'), 'RankingPage')
                            },
                            {
                                path: 'about-us',
                                lazy: lazyPage(() => import('../features/home/pages/AboutUsPage'), 'AboutUsPage')
                            },
                            {
                                path: 'privacy',
                                lazy: lazyPage(() => import('../features/home/pages/PrivacyPolicyPage'), 'PrivacyPolicyPage')
                            },
                            {
                                path: 'terms',
                                lazy: lazyPage(() => import('../features/home/pages/TermsOfServicePage'), 'TermsOfServicePage')
                            },
                            {
                                path: 'forum',
                                lazy: lazyPage(() => import('../features/forum/pages/ForumPage'), 'ForumPage')
                            },
                            {
                                path: 'exams',
                                lazy: lazyPage(() => import('../features/exams/pages/ExamsPage'), 'ExamsPage')
                            },
                            {
                                element: <ProtectedRoute><Outlet /></ProtectedRoute>,
                                children: [
                                    {
                                        path: 'profile',
                                        lazy: lazyPage(() => import('../features/profile/pages/ProfilePage'), 'ProfilePage')
                                    },
                                    {
                                        path: 'profile/:id',
                                        lazy: lazyPage(() => import('../features/profile/pages/ProfilePage'), 'ProfilePage')
                                    },
                                    {
                                        path: 'notifications',
                                        lazy: lazyPage(() => import('../features/notifications/pages/NotificationsPage'), 'NotificationsPage')
                                    },

                                    {
                                        path: 'exams/create',
                                        lazy: lazyPage(() => import('../features/exams/pages/CreateExamPage'), 'CreateExamPage')
                                    },
                                    {
                                        path: 'exams/:id/edit',
                                        lazy: lazyPage(() => import('../features/exams/pages/CreateExamPage'), 'CreateExamPage')
                                    },
                                    {
                                        path: 'exams/:id/preview',
                                        lazy: lazyPage(() => import('../features/exams/pages/ExamPreviewPage'), 'ExamPreviewPage')
                                    },
                                    {
                                        path: 'exams/:id/submissions',
                                        lazy: lazyPage(() => import('../features/exams/pages/SubmissionsDashboardPage'), 'SubmissionsDashboardPage')
                                    },
                                    {
                                        path: 'exams/attempts/:attemptId/grade',
                                        lazy: lazyPage(() => import('../features/exams/pages/GradingDetailPage'), 'GradingDetailPage')
                                    },
                                    {
                                        path: 'exams/:slug',
                                        lazy: lazyPage(() => import('../features/exams/pages/ExamStartPage'), 'ExamStartPage')
                                    },
                                    {
                                        path: 'exams/:slug/take/:attemptId',
                                        lazy: lazyPage(() => import('../features/exams/pages/ExamTakingPage'), 'ExamTakingPage')
                                    },
                                    {
                                        path: 'exams/:slug/submitted/:attemptId',
                                        lazy: lazyPage(() => import('../features/exams/pages/ExamSubmittedPage'), 'ExamSubmittedPage')
                                    },
                                    {
                                        path: 'exams/:slug/result/:attemptId',
                                        lazy: lazyPage(() => import('../features/exams/pages/ExamResultPage'), 'ExamResultPage')
                                    },
                                    /* Notification link redirects — backend sends /exams/slug/:slug/... */
                                    {
                                        path: 'exams/slug/:slug',
                                        lazy: async () => {
                                            const { Navigate, useParams } = await import('react-router-dom');
                                            return { Component: () => { const { slug } = useParams(); return <Navigate to={`/exams/${slug}`} replace />; } };
                                        },
                                    },
                                    {
                                        path: 'exams/slug/:slug/attempts/:attemptId',
                                        lazy: async () => {
                                            const { Navigate, useParams } = await import('react-router-dom');
                                            return { Component: () => { const { slug, attemptId } = useParams(); return <Navigate to={`/exams/${slug}/result/${attemptId}`} replace />; } };
                                        },
                                    },
                                    {
                                        path: 'roadmap',
                                        children: [
                                            {
                                                index: true,
                                                lazy: async () => {
                                                    const { Navigate } = await import('react-router-dom');
                                                    return { Component: () => <Navigate to="/roadmap/public" replace /> };
                                                },
                                            },
                                            {
                                                path: 'public',
                                                lazy: lazyPage(() => import('../features/roadmap/pages/RoadmapPage'), 'RoadmapPage')
                                            },
                                            {
                                                path: 'public/:slug/:chapterId?',
                                                lazy: lazyPage(() => import('../features/roadmap/pages/RoadmapPage'), 'RoadmapPage')
                                            },
                                            {
                                                path: 'teams',
                                                lazy: lazyPage(() => import('../features/roadmap/pages/RoadmapPage'), 'RoadmapPage')
                                            },
                                            {
                                                path: 'teams/:slug/:chapterId?',
                                                lazy: lazyPage(() => import('../features/roadmap/pages/RoadmapPage'), 'RoadmapPage')
                                            },
                                            {
                                                path: 'create',
                                                lazy: lazyPage(() => import('../features/roadmap/components/RoadmapEditorPage'), 'RoadmapEditorPage')
                                            },
                                            {
                                                path: 'edit/:slug',
                                                lazy: lazyPage(() => import('../features/roadmap/components/RoadmapEditorPage'), 'RoadmapEditorPage')
                                            },
                                        ]
                                    }
                                ],
                            },
                            {
                                element: (
                                    <ProtectedRoute allowedRoles={['STUDENT_INTERNAL', 'LECTURER', 'ADMIN']}>
                                        <Outlet />
                                    </ProtectedRoute>
                                ),
                                children: [
                                    {
                                        path: 'teams',
                                        lazy: lazyPage(() => import('../features/team/pages/TeamManagementPage'), 'TeamManagementPage')
                                    },
                                    {
                                        path: 'teams/:slug',
                                        lazy: lazyPage(() => import('../features/team/pages/TeamManagementPage'), 'TeamManagementPage')
                                    },
                                ],
                            },
                            {
                                path: '*',
                                element: <NotFoundView pageName="404 Not Found" onHomeClick={() => { }} />
                            },
                        ]
                    }
                ],
            },
        ]
    }
];
