import { useCallback, useEffect, useMemo, useState, useTransition, type ElementType } from 'react';
import type { ReportStatus } from '@/features/admin/types/admin.types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    BookOpen, FileText, Trophy, Users,
    Database, Image, FolderOpen, MessageSquare, Award,
    Building2, GraduationCap, Plus, LayoutGrid, Activity,
    UserPlus, FileSpreadsheet, Megaphone
} from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { useDashboardActions } from '@/features/dashboard/hooks/useDashboardActions';
import { ResourceCategory } from '@/features/resources/types/resources.types';
import { Subject } from '@/features/competitions/types/competition.types';
import { Category as ForumCategory } from '@/features/forum/types/forum.types';
import { HeroSlideResponse } from '@/features/hero/types/hero.types';
import { University, FacultyResponse } from '@/features/university/types/university.types';
import { AdminUserResponse } from '@/features/admin/types/admin.types';
import type { AdminReport } from '@/features/admin/types/admin.types';
import { DashboardTabBar } from '@/features/dashboard/components/DashboardComponents';
import type { DashboardTab } from '@/features/dashboard/components/DashboardComponents';
import type { Author } from '@/features/forum/types/forum.types';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreview } from '@/hooks/useUserPreview';
import { usePendingBadgeRequests, useBadgeMutations } from '@/features/badges/hooks/useBadgeRequests';
import type { DashboardData } from '@/features/dashboard/types/dashboard.types';
import type { BadgeItem } from '@/features/auth/types/auth.types';
import type { PagedResponse } from '@/features/team/types/team.types';
import { QuizBuilderTab } from '@/features/exams/components/QuizBuilderTab';

// Extracted sub-components
import { AdminDashboardModals } from './AdminDashboardModals';
import { AdminOverviewTab } from './tabs/AdminOverviewTab';
import { AdminDataTab } from './tabs/AdminDataTab';
import { AdminActivityTab } from './tabs/AdminActivityTab';
import { AdminBadgeRequestsTab } from './tabs/AdminBadgeRequestsTab';

// Union of all data entity types used in the data management tab
export type DataItem = BadgeItem | University | FacultyResponse | AdminUserResponse | ResourceCategory | Subject | ForumCategory | HeroSlideResponse;

interface AdminDashboardProps {
    data: DashboardData;
}

type TabKey = 'overview' | 'data' | 'badge-requests' | 'activity' | 'exams';

export const AdminDashboard = ({ data }: AdminDashboardProps) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const activeTab = (searchParams.get('tab') as TabKey) || 'overview';

    // Set default tab in URL if not present
    useEffect(() => {
        if (!searchParams.get('tab')) {
            setSearchParams(prev => { prev.set('tab', 'overview'); return prev; }, { replace: true });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const approvals = data.admin?.approvals ?? [];
    const alerts = data.admin?.alerts ?? [];
    const activities = data.activities ?? [];

    // Badge pending requests
    const { pendingRequests: badgePending } = usePendingBadgeRequests({ page: 1, limit: 5 });
    const { reviewRequest: reviewBadgeMutation, isSubmitting: isBadgeSubmitting } = useBadgeMutations();

    // Merge approvals + badge requests for overview
    const badgeApprovalItems = useMemo(() => {
        if (!badgePending?.data?.length) return [];
        return badgePending.data.map(req => ({
            id: req.id,
            title: i18n.t('dashboard:tabs.requestBadge', { user: req.userName, badge: req.badgeName }),
            createdAt: new Date(req.requestedAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            priority: 'medium' as const,
            _isBadge: true as const,
        }));
    }, [badgePending]);

    const allApprovals = useMemo(() => [
        ...approvals.map(a => ({ ...a, _isBadge: false as const })),
        ...badgeApprovalItems,
    ], [approvals, badgeApprovalItems]);

    const [activeModal, setActiveModal] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- editingItem stores heterogeneous entity types across modals
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const selectedDataType = searchParams.get('dtype') || 'badge';
    const dataSearch = searchParams.get('dsearch') || '';
    const dataPage = Math.max(1, Number(searchParams.get('dpage')) || 1);

    const updateDataParams = useCallback((updates: Record<string, string | null>) => {
        setSearchParams(prev => {
            for (const [key, value] of Object.entries(updates)) {
                if (value === null || value === '' || (key === 'dpage' && value === '1') || (key === 'dtype' && value === 'badge')) {
                    prev.delete(key);
                } else {
                    prev.set(key, value);
                }
            }
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const setDataPage = useCallback((p: number) => {
        updateDataParams({ dpage: String(p) });
    }, [updateDataParams]);

    const setDataSearch = useCallback((q: string) => {
        updateDataParams({ dsearch: q, dpage: null });
    }, [updateDataParams]);
    const [dataTotal, setDataTotal] = useState(0);
    const [isLoadingData, startLoadDataTransition] = useTransition();
    const ITEMS_PER_PAGE = 10;

    // Store total counts — seeded from backend entityCounts, refined when data tab loads
    const backendCounts = data.admin?.entityCounts;
    const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>(() => ({
        badge: backendCounts?.badges ?? 0,
        university: backendCounts?.universities ?? 0,
        faculty: backendCounts?.faculties ?? 0,
        user: backendCounts?.users ?? 0,
        resourceCategory: backendCounts?.resourceCategories ?? 0,
        subject: backendCounts?.subjects ?? 0,
        forumCategory: backendCounts?.forumCategories ?? 0,
        heroSlide: backendCounts?.heroSlides ?? 0,
    }));

    const [badges, setBadges] = useState<BadgeItem[]>([]);
    const [universities, setUniversities] = useState<University[]>([]);
    const [faculties, setFaculties] = useState<FacultyResponse[]>([]);
    const [users, setUsers] = useState<AdminUserResponse[]>([]);
    const [resourceCategories, setResourceCategories] = useState<ResourceCategory[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [forumCategories, setForumCategories] = useState<ForumCategory[]>([]);
    const [heroSlides, setHeroSlides] = useState<HeroSlideResponse[]>([]);

    const [confirmDelete, setConfirmDelete] = useState<{ type: string; ids: Array<number | string> } | null>(null);

    // User Preview (using shared hook)
    const {
        isVisible: isPreviewVisible,
        position: previewPos,
        previewItem: previewUser,
        handleHoverStart: handleUserHoverStart,
        handleHoverEnd: handleUserLeave,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave,
    } = useUserPreview<Author>();

    const handleUserHover = (userItem: AdminUserResponse, e: React.MouseEvent) => {
        const author: Author = {
            id: userItem.id,
            name: userItem.fullName || userItem.displayName,
            avatar: userItem.avatarUrl || `https://i.pravatar.cc/150?u=${userItem.id}`,
            role: userItem.role,
            badges: userItem.badges,
        };
        handleUserHoverStart(author, e);
    };

    const {
        isSubmitting,
        createBadge, updateBadge, deleteBadge, getBadges,
        createUniversity, updateUniversity, deleteUniversity, getUniversities,
        createFaculty, updateFaculty, deleteFaculty, getFaculties,
        createUser, updateUser, deleteUser, getUsers,
        createResourceCategory, updateResourceCategory, deleteResourceCategory, getResourceCategories,
        createSubject, updateSubject, deleteSubject, getSubjects,
        createForumCategory, updateForumCategory, deleteForumCategory, getForumCategories,
        createHeroSlide, updateHeroSlide, deleteHeroSlide, getHeroSlides,
        updateApprovalStatus,
        getReports,
        resolveReport,
    } = useDashboardActions();

    // Reports state — fetched via dedicated API
    const [reports, setReports] = useState<AdminReport[]>([]);
    useEffect(() => {
        let cancelled = false;
        getReports({ page: 1, limit: 10, status: 'PENDING' }).then(res => {
            if (!cancelled && res) setReports(res.data);
        });
        return () => { cancelled = true; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleResolveReport = useCallback(async (
        reportId: number,
        status: ReportStatus,
        action: 'DELETE_POST' | 'WARN_USER' | 'NONE',
    ) => {
        await resolveReport(reportId, { status, action });
        setReports(prev => prev.filter(r => r.id !== reportId));
    }, [resolveReport]);

    // Load data for the selected type with pagination and search
    const loadSelectedData = useCallback((type: string, page: number, search?: string) => {
        startLoadDataTransition(async () => {
            const params = { page, limit: ITEMS_PER_PAGE, search: search?.trim() || undefined };
            let total: number | undefined;

            try {
                switch (type) {
                    case 'badge': { const res = await getBadges(params); if (res) { setBadges(res.data); total = res.total; } break; }
                    case 'university': { const res = await getUniversities(params); if (res) { setUniversities(res.data); total = res.total; } break; }
                    case 'faculty': { const res = await getFaculties(params); if (res) { setFaculties(res.data); total = res.total; } break; }
                    case 'user': { const res = await getUsers(params); if (res) { setUsers(res.data); total = res.total; } break; }
                    case 'resourceCategory': { const res = await getResourceCategories(params); if (res) { setResourceCategories(res.data); total = res.total; } break; }
                    case 'subject': { const res = await getSubjects(params); if (res) { setSubjects(res.data); total = res.total; } break; }
                    case 'forumCategory': { const res = await getForumCategories(params); if (res) { setForumCategories(res.data); total = res.total; } break; }
                    case 'heroSlide': { const res = await getHeroSlides(params); if (res) { setHeroSlides(res.data); total = res.total; } break; }
                }

                if (total !== undefined) {
                    setDataTotal(total);
                    setCategoryTotals(prev => ({ ...prev, [type]: total! }));
                }
            } catch {
                // silently fail
            }
        });
    }, [getBadges, getFaculties, getForumCategories, getHeroSlides, getResourceCategories, getSubjects, getUniversities, getUsers]);

    // Initialize: fetch totals only when data tab is active AND backend didn't provide entityCounts
    useEffect(() => {
        if (activeTab !== 'data') return;
        if (backendCounts) return; // Backend already provided counts — skip 8 API calls

        let cancelled = false;
        const initialize = async () => {
            try {
                const fetchTotal = async (fn: (p: { page: number; limit: number }) => Promise<PagedResponse<unknown> | undefined>) => {
                    try { return (await fn({ page: 1, limit: 1 }))?.total ?? 0; }
                    catch { return 0; }
                };

                const [badge, university, faculty, userTotal, resourceCategory, subject, forumCategory, heroSlide] = await Promise.all([
                    fetchTotal(getBadges), fetchTotal(getUniversities), fetchTotal(getFaculties), fetchTotal(getUsers),
                    fetchTotal(getResourceCategories), fetchTotal(getSubjects), fetchTotal(getForumCategories), fetchTotal(getHeroSlides),
                ]);
                if (cancelled) return;
                setCategoryTotals({ badge, university, faculty, user: userTotal, resourceCategory, subject, forumCategory, heroSlide });
            } catch { /* silently fail */ }
        };
        initialize();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Async load functions for universities and faculties with pagination
    const loadUniversitiesAsync = useCallback(async (search: string, page: number, limit: number) => {
        try {
            const response = await getUniversities({ page, limit, search: search || undefined });
            return { data: response?.data.map(u => ({ id: u.id, name: u.name })) || [], total: response?.total || 0 };
        } catch { return { data: [], total: 0 }; }
    }, [getUniversities]);

    const loadFacultiesAsync = useCallback(async (search: string, page: number, limit: number) => {
        try {
            const response = await getFaculties({ page, limit, search: search || undefined });
            return { data: response?.data.map(f => ({ id: f.id, name: f.name })) || [], total: response?.total || 0 };
        } catch { return { data: [], total: 0 }; }
    }, [getFaculties]);

    // Reload when type, page or search changes — only when data tab is active
    useEffect(() => {
        if (activeTab !== 'data') return;
        const timer = setTimeout(() => {
            loadSelectedData(selectedDataType, dataPage, dataSearch);
        }, dataSearch ? 300 : 0);
        return () => clearTimeout(timer);
    }, [activeTab, selectedDataType, dataPage, dataSearch, loadSelectedData]);

    useEffect(() => {
        const handleRefresh = () => { loadSelectedData(selectedDataType, dataPage, dataSearch); };
        window.addEventListener('dashboard:refresh', handleRefresh);
        return () => window.removeEventListener('dashboard:refresh', handleRefresh);
    }, [loadSelectedData, selectedDataType, dataPage, dataSearch]);

    // Handle tab change - URL-based routing
    const handleTabChange = useCallback((newTab: string) => {
        if (newTab === activeTab) return;
        setSearchParams(prev => {
            prev.set('tab', newTab);
            // Clear data-tab params when switching away
            prev.delete('dtype'); prev.delete('dpage'); prev.delete('dsearch');
            return prev;
        });
    }, [activeTab, setSearchParams]);

    // Handle data category change
    const handleCategoryChange = useCallback((categoryId: string) => {
        if (categoryId === selectedDataType) return;
        updateDataParams({ dtype: categoryId, dpage: null, dsearch: null });
    }, [selectedDataType, updateDataParams]);

    const refreshReferenceData = useCallback(async () => { return; }, []);

    const refreshData = useCallback(() => {
        loadSelectedData(selectedDataType, dataPage, dataSearch);
        if (selectedDataType === 'university' || selectedDataType === 'faculty') {
            refreshReferenceData();
        }
    }, [loadSelectedData, selectedDataType, dataPage, dataSearch, refreshReferenceData]);

    const dataCategories = [
        { id: 'badge', label: i18n.t('dashboard:views.dataBadge'), icon: Award, data: badges },
        { id: 'university', label: i18n.t('dashboard:views.dataUniversity'), icon: Building2, data: universities },
        { id: 'faculty', label: i18n.t('dashboard:views.dataFaculty'), icon: GraduationCap, data: faculties },
        { id: 'user', label: i18n.t('dashboard:views.dataUser'), icon: Users, data: users },
        { id: 'resourceCategory', label: i18n.t('dashboard:views.dataResourceCategory'), icon: FolderOpen, data: resourceCategories },
        { id: 'subject', label: i18n.t('dashboard:views.dataSubject'), icon: BookOpen, data: subjects },
        { id: 'forumCategory', label: i18n.t('dashboard:views.dataForumCategory'), icon: MessageSquare, data: forumCategories },
        { id: 'heroSlide', label: i18n.t('dashboard:views.dataHeroSlide'), icon: Image, data: heroSlides },
    ];

    const handleDelete = async (type: string, ids: Array<number | string>) => {
        const numericDelete = (fn: (id: number) => Promise<unknown>) => (id: number | string) => fn(typeof id === 'string' ? Number(id) : id);
        const handlers: Record<string, (id: number | string) => Promise<unknown>> = {
            badge: numericDelete(deleteBadge), university: numericDelete(deleteUniversity), faculty: numericDelete(deleteFaculty), user: deleteUser,
            resourceCategory: numericDelete(deleteResourceCategory), subject: numericDelete(deleteSubject), forumCategory: numericDelete(deleteForumCategory), heroSlide: deleteHeroSlide
        };
        await Promise.all(ids.map((id) => handlers[type]?.(id)));
        showToast(i18n.t('dashboard:deleteSuccess'), 'success');
        refreshData();
    };

    const selectedCategory = dataCategories.find(c => c.id === selectedDataType);
    const selectedData = selectedCategory?.data ?? [];
    const totalPages = Math.max(1, Math.ceil(dataTotal / ITEMS_PER_PAGE));

    const getName = (type: string, item: DataItem): string => {
        switch (type) {
            case 'badge': case 'university': case 'faculty': case 'subject': case 'forumCategory': return String((item as { name?: string }).name ?? '');
            case 'user': return String((item as AdminUserResponse).fullName ?? '');
            case 'resourceCategory': return String((item as ResourceCategory).label ?? '');
            case 'heroSlide': return String((item as HeroSlideResponse).title ?? '');
            default: return '';
        }
    };

    const getSubtitle = (type: string, item: DataItem): string => {
        switch (type) {
            case 'badge': {
                const b = item as BadgeItem;
                const typeMap: Record<string, string> = { 'NATIONAL': i18n.t('dashboard:views.badgeTypeNational'), 'SCHOOL': i18n.t('dashboard:views.badgeTypeSchool'), 'STREAK': i18n.t('dashboard:views.badgeTypeStreak'), 'LEARNING': i18n.t('dashboard:views.badgeTypeLearning'), 'TEAM': i18n.t('dashboard:views.badgeTypeTeam'), 'OTHER': i18n.t('dashboard:views.badgeTypeOther') };
                return `${typeMap[b.type] || b.type} • ${i18n.t('dashboard:views.badgePoints', { level: b.level })}`;
            }
            case 'user': return String((item as AdminUserResponse).email ?? '');
            case 'resourceCategory': return String((item as ResourceCategory).label ?? '');
            case 'subject': return String((item as Subject).code ?? '');
            case 'forumCategory': return `Icon: ${(item as ForumCategory).icon}`;
            case 'heroSlide': return String((item as HeroSlideResponse).label ?? '');
            default: return '';
        }
    };

    const tabs: DashboardTab<TabKey>[] = [
        { key: 'overview', label: i18n.t('dashboard:views.tabOverview'), icon: LayoutGrid, badge: allApprovals.length > 0 ? allApprovals.length : undefined },
        { key: 'badge-requests', label: i18n.t('dashboard:views.tabBadgeRequests'), icon: Award },
        { key: 'exams', label: i18n.t('dashboard:views.tabExams'), icon: FileText },
        { key: 'data', label: i18n.t('dashboard:views.tabData'), icon: Database },
        { key: 'activity', label: i18n.t('dashboard:views.tabActivity'), icon: Activity, badge: activities.length > 0 ? activities.length : undefined },
    ];

    const welcomeSubtitle = allApprovals.length > 0
        ? i18n.t('dashboard:views.welcomePendingAdmin', { count: allApprovals.length, users: categoryTotals.user })
        : i18n.t('dashboard:views.welcomeManagingAdmin', { users: categoryTotals.user });

    const quickLinks = [
        { icon: Users, label: i18n.t('dashboard:views.linkUsers'), path: '/teams' },
        { icon: Trophy, label: i18n.t('dashboard:views.linkCompetitions'), path: '/competitions' },
        { icon: FileText, label: i18n.t('dashboard:views.linkNews'), path: '/news' },
        { icon: BookOpen, label: i18n.t('dashboard:views.linkRoadmap'), path: '/roadmap/public' },
    ];

    const quickActions: { icon: ElementType; label: string; onClick: () => void; color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'cyan' }[] = [
        { icon: UserPlus, label: i18n.t('dashboard:views.actionAddUser'), onClick: () => { setActiveModal('user-create'); }, color: 'blue' },
        { icon: Award, label: i18n.t('dashboard:views.actionAddBadge'), onClick: () => setActiveModal('badge-create'), color: 'purple' },
        { icon: FileSpreadsheet, label: 'Upload Excel', onClick: () => setActiveModal('badge-excel-upload'), color: 'green' },
        { icon: Award, label: i18n.t('dashboard:views.actionGrantBadge'), onClick: () => setActiveModal('badge-grant'), color: 'amber' },
        { icon: Megaphone, label: i18n.t('dashboard:views.actionSendNotification'), onClick: () => setActiveModal('broadcast'), color: 'cyan' },
    ];

    return (
        <>
            {/* Modals */}
            <AdminDashboardModals
                activeModal={activeModal}
                editingItem={editingItem}
                isSubmitting={isSubmitting}
                confirmDelete={confirmDelete}
                loadUniversitiesAsync={loadUniversitiesAsync}
                loadFacultiesAsync={loadFacultiesAsync}
                onCloseModal={() => setActiveModal(null)}
                onCloseEditModal={() => { setActiveModal(null); setEditingItem(null); }}
                onCloseConfirmDelete={() => setConfirmDelete(null)}
                onRefreshData={refreshData}
                onDelete={handleDelete}
                createBadge={createBadge} updateBadge={updateBadge}
                createUniversity={createUniversity} updateUniversity={updateUniversity}
                createFaculty={createFaculty} updateFaculty={updateFaculty}
                createUser={createUser} updateUser={updateUser}
                createResourceCategory={createResourceCategory} updateResourceCategory={updateResourceCategory}
                createSubject={createSubject} updateSubject={updateSubject}
                createForumCategory={createForumCategory} updateForumCategory={updateForumCategory}
                createHeroSlide={createHeroSlide} updateHeroSlide={updateHeroSlide}
            />

            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                        {/* Compact greeting */}
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{i18n.t('dashboard:views.greeting', { name: user?.fullName || i18n.t('dashboard:views.greetingFallbackAdmin') })}</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{welcomeSubtitle}</p>
                            </div>
                            <button
                                onClick={() => { setActiveModal('user-create'); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                            >
                                <Plus size={16} />
                                {i18n.t('dashboard:admin.addUser')}
                            </button>
                        </div>

                        {/* Tabs */}
                        <DashboardTabBar tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

                        {/* Tab Content */}
                        {activeTab === 'overview' && (
                            <AdminOverviewTab
                                allApprovals={allApprovals}
                                alerts={alerts}
                                reports={reports}
                                quickActions={quickActions}
                                quickLinks={quickLinks}
                                categoryTotals={categoryTotals}
                                dataCategories={dataCategories}
                                isSubmitting={isSubmitting}
                                isBadgeSubmitting={isBadgeSubmitting}
                                onReviewBadgeRequest={(id, approved) => reviewBadgeMutation.mutateAsync({ id, approved })}
                                onUpdateApprovalStatus={updateApprovalStatus}
                                onResolveReport={handleResolveReport}
                                onRefreshData={refreshData}
                                onTabChange={handleTabChange}
                                onCategoryChange={handleCategoryChange}
                                onNavigate={(path) => navigate(path)}
                            />
                        )}

                        {activeTab === 'data' && (
                            <AdminDataTab
                                dataCategories={dataCategories}
                                selectedDataType={selectedDataType}
                                selectedCategory={selectedCategory}
                                selectedData={selectedData}
                                dataSearch={dataSearch}
                                dataPage={dataPage}
                                totalPages={totalPages}
                                isLoadingData={isLoadingData}
                                categoryTotals={categoryTotals}
                                onCategoryChange={handleCategoryChange}
                                onSearchChange={setDataSearch}
                                onPageChange={setDataPage}
                                onOpenModal={setActiveModal}
                                onEditItem={setEditingItem}
                                onConfirmDelete={(type, ids) => setConfirmDelete({ type, ids })}
                                getName={getName}
                                getSubtitle={getSubtitle}
                                handleUserHover={handleUserHover}
                                handleUserLeave={handleUserLeave}
                                previewUser={previewUser}
                                isPreviewVisible={isPreviewVisible}
                                previewPos={previewPos}
                                handlePreviewMouseEnter={handlePreviewMouseEnter}
                                handlePreviewMouseLeave={handlePreviewMouseLeave}
                            />
                        )}

                        {activeTab === 'badge-requests' && (
                            <AdminBadgeRequestsTab onOpenModal={setActiveModal} />
                        )}

                        {activeTab === 'exams' && <QuizBuilderTab />}

                        {activeTab === 'activity' && (
                            <AdminActivityTab activities={activities} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
