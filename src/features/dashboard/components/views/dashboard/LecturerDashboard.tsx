import { useState, useMemo, useEffect, useCallback, useTransition, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Users, FilePlus, Calendar, Newspaper, Trophy,
    CheckCircle2, AlertCircle, Clock, MapPin, Plus,
    TrendingUp, Target, BarChart3, UserCheck,
    LayoutGrid, ListTodo, Search, FileText
} from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
const UploadResourceModal = lazy(() => import('@/features/dashboard/components/UploadResourceModal').then(m => ({ default: m.UploadResourceModal })));
const PostNewsModal = lazy(() => import('@/features/dashboard/components/PostNewsModal').then(m => ({ default: m.PostNewsModal })));
const CreateCompetitionModal = lazy(() => import('@/features/dashboard/components/CreateCompetitionModal').then(m => ({ default: m.CreateCompetitionModal })));
const CreateEventModal = lazy(() => import('@/features/dashboard/components/CreateEventModal').then(m => ({ default: m.CreateEventModal })));
const EditEventModal = lazy(() => import('@/features/dashboard/components/EditEventModal').then(m => ({ default: m.EditEventModal })));
import { useDashboardActions } from '@/features/dashboard/hooks/useDashboardActions';
import { BentoCard, SectionHeader, EmptyState } from '@/features/dashboard/components/DashboardLayout';
import { TeamCard } from '@/features/dashboard/components/TeamCard';
import { TopPerformerCard } from '@/features/dashboard/components/TopPerformerCard';
import { LecturerScheduleTab } from './tabs/LecturerScheduleTab';
import { useAuth } from '@/contexts/AuthContext';
import { teamRepository } from '@/features/team/api';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { CreateTeamModal } from '@/features/team/components/CreateTeamModal';
import {
    StatusBadge,
    GlowCard,
    TeamCardSkeleton,
    TaskCardSkeleton,
    DashboardStatCard,
    DashboardTabBar,
    DashboardQuickAction,
    DashboardTaskCard,
    AnimatedCounter,
} from '@/features/dashboard/components/DashboardComponents';
import type { DashboardTab } from '@/features/dashboard/components/DashboardComponents';
import type { DashboardData, DashboardEvent, DashboardTeamSummary } from '@/features/dashboard/types/dashboard.types';
import type { TeamMember, Team } from '@/features/team/types/team.types';
import { QuizBuilderTab } from '@/features/exams/components/QuizBuilderTab';

interface LecturerDashboardProps {
    data: DashboardData;
}

type TabKey = 'overview' | 'teams' | 'tasks' | 'schedule' | 'exams';


export const LecturerDashboard = ({ data }: LecturerDashboardProps) => {
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
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [isCompetitionModalOpen, setIsCompetitionModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<DashboardEvent | null>(null);
    const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
    const [teamSearch, setTeamSearch] = useState('');
    const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
    const [isCreatingTeam, startCreateTeamTransition] = useTransition();
    const [isDeletingEvent, startDeleteEventTransition] = useTransition();

    // Real teams from API
    const [realTeams, setRealTeams] = useState<Team[]>([]);
    const [teamsLoading, startTeamsLoadTransition] = useTransition();
    const [topStudentsPage, setTopStudentsPage] = useState(1);
    const TOP_STUDENTS_PER_PAGE = 5;

    // Use realTeams as fallback if dashboard data is incomplete
    const teams: DashboardTeamSummary[] = (data.teams && data.teams.length > 0)
        ? data.teams
        : realTeams.map(t => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
            subject: t.subject,
            academicYear: t.academicYear,
            description: t.description,
            status: t.status,
            roadmapId: t.roadmapId,
            members: t.members || [],
            createdAt: t.createdAt
        }));

    // Local events state for optimistic updates
    const [localEvents, setLocalEvents] = useState<DashboardEvent[]>(data.events ?? []);

    // Sync local events when data changes from refresh
    useEffect(() => {
        if (data.events) {
            setLocalEvents(data.events);
        }
    }, [data.events]);

    const events = localEvents;
    const pendingTasks = data.lecturer?.pendingTasks ?? [];
    const { updatePendingTaskStatus, isSubmitting, deleteEvent } = useDashboardActions();

    // Handle event creation - add to local state
    const handleEventCreated = useCallback((newEvent: DashboardEvent) => {
        setLocalEvents(prev => [newEvent, ...prev].sort((a, b) => {
            // Sort by date: compare dateLabel + day
            return 0; // Keep new event at top for now
        }));
    }, []);

    // Handle event update - update local state
    const handleEventUpdated = useCallback((updatedEvent: DashboardEvent) => {
        setLocalEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    }, []);

    // Handle event deletion - remove from local state without page refresh
    const handleDeleteEvent = () => {
        if (!deletingEventId) return;
        startDeleteEventTransition(async () => {
            try {
                await deleteEvent(deletingEventId);
                setLocalEvents(prev => prev.filter(e => e.id !== deletingEventId));
                showToast(i18n.t('dashboard:event.deleteSuccess'), 'success');
                setDeletingEventId(null);
            } catch {
                showToast(i18n.t('dashboard:event.deleteFailed'), 'error');
            }
        });
    };

    // Fetch real teams from API
    const loadTeams = useCallback(() => {
        if (!user?.id) return;
        startTeamsLoadTransition(async () => {
            try {
                const response = await teamRepository.getTeams({
                    page: 0,
                    size: 10,
                    userId: user.id
                });
                setRealTeams(response.data || []);
            } catch {
                // silently fail
            }
        });
    }, [user?.id]);

    useEffect(() => {
        // Only load teams from API if dashboard data doesn't have teams
        if (user?.id && (!data.teams || data.teams.length === 0)) {
            loadTeams();
        }
    }, [loadTeams, user?.id, data.teams]);

    // Calculate metrics
    const activeTeams = useMemo(() => teams.filter(t => t.status === 'ACTIVE').length, [teams]);
    // Only count unique students (MEMBER and CAPTAIN roles) by userId
    const totalStudents = useMemo(() => {
        const studentRoles = ['MEMBER', 'CAPTAIN'];
        const uniqueStudentIds = new Set<number>();
        teams.forEach(t => {
            t.members?.filter(m => studentRoles.includes(m.role)).forEach(m => {
                uniqueStudentIds.add(m.userId);
            });
        });
        return uniqueStudentIds.size;
    }, [teams]);
    const highPriorityTasks = useMemo(() => pendingTasks.filter(t => t.priority === 'high').length, [pendingTasks]);

    // Sort pending tasks by priority
    const sortedPendingTasks = useMemo(() => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return [...pendingTasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }, [pendingTasks]);

    // Filter teams by search
    const filteredTeams = useMemo(() => {
        if (!teamSearch.trim()) return teams;
        const q = teamSearch.toLowerCase();
        return teams.filter(t => t.name.toLowerCase().includes(q));
    }, [teams, teamSearch]);

    // Extract top performers - filter for unique students by userId
    const allStudents = useMemo(() => {
        const membersMap = new Map<number, TeamMember & { teamName: string }>();

        teams.forEach(team => {
            team.members?.forEach(member => {
                // Filter for "Member" (Thành viên) or "Captain" (Đội trưởng) as requested
                if (['MEMBER', 'CAPTAIN'].includes(member.role)) {
                    // Only add if not already present or if new score is higher (optional logic, simplest is just unique by ID)
                    // Here we just keep the first one found, or could update logic to keep highest score
                    if (!membersMap.has(member.userId)) {
                        membersMap.set(member.userId, { ...member, teamName: team.name });
                    } else {
                        // Optional: if student is in multiple teams, keep the one with higher score
                        const existing = membersMap.get(member.userId);
                        if ((member.score || 0) > (existing?.score || 0)) {
                            membersMap.set(member.userId, { ...member, teamName: team.name });
                        }
                    }
                }
            });
        });

        return Array.from(membersMap.values()).sort((a, b) => (b.score || 0) - (a.score || 0));
    }, [teams]);

    const topStudentsTotalPages = Math.max(1, Math.ceil(allStudents.length / TOP_STUDENTS_PER_PAGE));
    const paginatedTopStudents = useMemo(() => {
        const start = (topStudentsPage - 1) * TOP_STUDENTS_PER_PAGE;
        return allStudents.slice(start, start + TOP_STUDENTS_PER_PAGE);
    }, [allStudents, topStudentsPage]);

    const quickActions = useMemo(() => [
        { icon: Users, label: i18n.t('dashboard:views.actionCreateTeam'), onClick: () => setIsCreateTeamModalOpen(true), color: 'cyan' as const },
        { icon: Trophy, label: i18n.t('dashboard:views.actionCreateCompetition'), onClick: () => setIsCompetitionModalOpen(true), color: 'purple' as const },
        { icon: FilePlus, label: i18n.t('dashboard:views.actionUploadResource'), onClick: () => setIsUploadModalOpen(true), color: 'green' as const },
        { icon: Newspaper, label: i18n.t('dashboard:views.actionPostNews'), onClick: () => setIsNewsModalOpen(true), color: 'blue' as const },
        { icon: Calendar, label: i18n.t('dashboard:views.actionAddSchedule'), onClick: () => setIsEventModalOpen(true), color: 'amber' as const },
    ], []);

    const tabs: DashboardTab<TabKey>[] = useMemo(() => [
        { key: 'overview', label: i18n.t('dashboard:views.tabOverview'), icon: LayoutGrid },
        { key: 'teams', label: i18n.t('dashboard:views.tabTeams'), icon: Users, badge: teams.length },
        { key: 'exams', label: i18n.t('dashboard:views.tabExams'), icon: FileText },
        { key: 'tasks', label: i18n.t('dashboard:views.tabTasks'), icon: ListTodo, badge: pendingTasks.length > 0 ? pendingTasks.length : undefined, urgent: highPriorityTasks > 0 },
        { key: 'schedule', label: i18n.t('dashboard:views.tabSchedule'), icon: Calendar, badge: events.length },
    ], [teams.length, pendingTasks.length, events.length, highPriorityTasks]);

    // Welcome subtitle based on data
    const welcomeSubtitle = useMemo(() => {
        if (highPriorityTasks > 0) return i18n.t('dashboard:views.welcomeUrgentLecturer', { count: highPriorityTasks });
        if (teams.length > 0) return i18n.t('dashboard:views.welcomeTeamsLecturer', { teams: teams.length, students: totalStudents });
        return i18n.t('dashboard:views.welcomeStartLecturer');
    }, [highPriorityTasks, teams.length, totalStudents]);

    const handleCompleteTask = useCallback(async (taskId: number) => {
        await updatePendingTaskStatus(taskId, 'DONE');
        showToast(i18n.t('dashboard:done'), 'success');
        window.dispatchEvent(new CustomEvent('dashboard:refresh'));
    }, [updatePendingTaskStatus]);

    // Handle tab change - URL-based routing
    const handleTabChange = useCallback((newTab: TabKey) => {
        if (newTab === activeTab) return;
        setSearchParams(prev => { prev.set('tab', newTab); return prev; });
        // Scroll to top for better UX when switching tabs
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab, setSearchParams]);

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Modals */}
                <Suspense fallback={null}>
                    {isUploadModalOpen && <UploadResourceModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />}
                    {isNewsModalOpen && <PostNewsModal isOpen={isNewsModalOpen} onClose={() => setIsNewsModalOpen(false)} />}
                    {isCompetitionModalOpen && <CreateCompetitionModal isOpen={isCompetitionModalOpen} onClose={() => setIsCompetitionModalOpen(false)} />}
                    {isEventModalOpen && (
                        <CreateEventModal
                            isOpen={isEventModalOpen}
                            onClose={() => setIsEventModalOpen(false)}
                            onSuccess={handleEventCreated}
                        />
                    )}
                    {editingEvent && (
                        <EditEventModal
                            isOpen={!!editingEvent}
                            onClose={() => setEditingEvent(null)}
                            event={editingEvent}
                            onSuccess={handleEventUpdated}
                        />
                    )}
                </Suspense>
                <CreateTeamModal
                    isOpen={isCreateTeamModalOpen}
                    onClose={() => setIsCreateTeamModalOpen(false)}
                    isLoading={isCreatingTeam}
                    onSubmit={async (payload) => {
                        startCreateTeamTransition(async () => {
                            try {
                                await teamRepository.createTeam(payload);
                                showToast(i18n.t('dashboard:team.createSuccess'), 'success');
                                loadTeams();
                                setIsCreateTeamModalOpen(false);
                            } catch {
                                showToast(i18n.t('dashboard:team.createFailed'), 'error');
                            }
                        });
                    }}
                />
                <ConfirmModal
                    isOpen={!!deletingEventId}
                    onClose={() => !isDeletingEvent && setDeletingEventId(null)}
                    onConfirm={handleDeleteEvent}
                    isLoading={isDeletingEvent}
                    title={i18n.t('dashboard:views.deleteEventTitle')}
                    message={i18n.t('dashboard:views.deleteEventMsg')}
                    confirmText={i18n.t('dashboard:views.deleteEventBtn')}
                    variant="danger"
                />

                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                    {/* Compact greeting */}
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{i18n.t('dashboard:views.greeting', { name: user?.fullName || i18n.t('dashboard:views.greetingFallbackLecturer') })}</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{welcomeSubtitle}</p>
                        </div>
                        <button
                            onClick={() => navigate('/teams/create')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            {i18n.t('dashboard:views.createTeam')}
                        </button>
                    </div>

                    {/* Tabs */}
                    <DashboardTabBar tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                <DashboardStatCard label={i18n.t('dashboard:views.statTeams')} value={teams.length} icon={Users} color="blue" />
                                <DashboardStatCard label={i18n.t('dashboard:views.statActive')} value={activeTeams} icon={TrendingUp} color="green" />
                                <DashboardStatCard label={i18n.t('dashboard:views.statTotalStudents')} value={totalStudents} icon={UserCheck} color="purple" />
                                <DashboardStatCard label={i18n.t('dashboard:views.statPending')} value={pendingTasks.length} icon={AlertCircle} color={highPriorityTasks > 0 ? 'red' : 'amber'} />
                                <DashboardStatCard label={i18n.t('dashboard:views.statEvents')} value={events.length} icon={Calendar} color="blue" />
                            </div>

                            {/* Main Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Quick Actions */}
                                <GlowCard glowColor="blue" intensity="soft" className="lg:col-span-3 p-5">
                                    <SectionHeader title={i18n.t('dashboard:views.quickActions')} />
                                    <div className="grid grid-cols-2 gap-2">
                                        {quickActions.map((action) => (
                                            <DashboardQuickAction
                                                key={action.label}
                                                icon={action.icon}
                                                label={action.label}
                                                onClick={action.onClick}
                                                color={action.color}
                                            />
                                        ))}
                                    </div>
                                </GlowCard>

                                {/* Team Stats */}
                                <BentoCard className="lg:col-span-4 p-5">
                                    <SectionHeader title={i18n.t('dashboard:views.teamStats')} subtitle={i18n.t('dashboard:views.teamStatsSubtitle')} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                                            <BarChart3 size={18} className="text-emerald-600 dark:text-emerald-400 mb-1" />
                                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                                <AnimatedCounter value={activeTeams} duration={600} />
                                            </p>
                                            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">{i18n.t('dashboard:views.activeTeams')}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                            <Target size={18} className="text-blue-600 dark:text-blue-400 mb-1" />
                                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                <AnimatedCounter value={events.length} duration={600} />
                                            </p>
                                            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">{i18n.t('dashboard:views.upcomingEvents')}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                                            <Users size={18} className="text-purple-600 dark:text-purple-400 mb-1" />
                                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                                <AnimatedCounter value={totalStudents} duration={600} />
                                            </p>
                                            <p className="text-xs text-purple-600/70 dark:text-purple-400/70">{i18n.t('dashboard:views.statTotalStudents')}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                                            <Trophy size={18} className="text-amber-600 dark:text-amber-400 mb-1" />
                                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                                <AnimatedCounter value={allStudents.filter(s => s.score && s.score > 80).length} duration={600} />
                                            </p>
                                            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">{i18n.t('dashboard:views.excellent')}</p>
                                        </div>
                                    </div>
                                </BentoCard>

                                {/* Top Performers */}
                                <BentoCard className="lg:col-span-5 p-5">
                                    <SectionHeader
                                        title={i18n.t('dashboard:views.topPerformers')}
                                        subtitle={allStudents.length > 0 ? i18n.t('dashboard:views.topPerformersCount', { count: allStudents.length }) : undefined}
                                        onViewAll={() => navigate('/teams')}
                                    />
                                    {teamsLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => <TaskCardSkeleton key={i} />)}
                                        </div>
                                    ) : paginatedTopStudents.length === 0 ? (
                                        <EmptyState
                                            icon={Users}
                                            title={i18n.t('dashboard:views.emptyTopPerformers')}
                                            description={i18n.t('dashboard:views.emptyTopPerformersDesc')}
                                        />
                                    ) : (
                                        <>
                                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                                {paginatedTopStudents.map((student, index) => (
                                                    <TopPerformerCard
                                                        key={student.userId}
                                                        student={student}
                                                        rank={(topStudentsPage - 1) * TOP_STUDENTS_PER_PAGE + index}
                                                    />
                                                ))}
                                            </div>
                                            {topStudentsTotalPages > 1 && (
                                                <div className="mt-4">
                                                    <PaginationControls
                                                        current={topStudentsPage}
                                                        total={topStudentsTotalPages}
                                                        onChange={setTopStudentsPage}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </BentoCard>

                                {/* Recent Tasks - Priority Sorted */}
                                <BentoCard className="lg:col-span-6 p-5">
                                    <SectionHeader
                                        title={i18n.t('dashboard:views.recentTasks')}
                                        onViewAll={() => handleTabChange('tasks')}
                                        action={highPriorityTasks > 0 ? (
                                            <StatusBadge priority="high" label={i18n.t('dashboard:views.urgentCount', { count: highPriorityTasks })} size="sm" pulse />
                                        ) : undefined}
                                    />
                                    {sortedPendingTasks.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                                                <CheckCircle2 size={24} className="text-emerald-500" />
                                            </div>
                                            <p className="font-medium text-slate-900 dark:text-white">{i18n.t('dashboard:views.allDone')}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{i18n.t('dashboard:views.noTasksPending')}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {sortedPendingTasks.slice(0, 3).map((task) => (
                                                <DashboardTaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onComplete={() => handleCompleteTask(task.id)}
                                                    isSubmitting={isSubmitting}
                                                    compact
                                                />
                                            ))}
                                        </div>
                                    )}
                                </BentoCard>

                                {/* Upcoming Events */}
                                <BentoCard className="lg:col-span-6 p-5">
                                    <SectionHeader title={i18n.t('dashboard:views.upcomingSchedule')} onViewAll={() => handleTabChange('schedule')} />
                                    {events.length === 0 ? (
                                        <EmptyState icon={Calendar} title={i18n.t('dashboard:views.emptySchedule')} description={i18n.t('dashboard:views.emptyScheduleDesc')} action={{ label: i18n.t('dashboard:views.addEvent'), onClick: () => setIsEventModalOpen(true) }} />
                                    ) : (
                                        <div className="space-y-3">
                                            {events.slice(0, 3).map((event, index) => (
                                                <div key={event.id} className="flex gap-3 group">
                                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${index === 0
                                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25'
                                                        : 'bg-slate-100 dark:bg-slate-800'
                                                        }`}>
                                                        <span className={`text-[10px] font-semibold uppercase ${index === 0 ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{event.dateLabel}</span>
                                                        <span className={`text-lg font-bold ${index === 0 ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{event.day}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 py-0.5">
                                                        <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate flex items-center gap-2">
                                                            {event.title}
                                                            {index === 0 && <StatusBadge status="info" label={i18n.t('dashboard:views.nextBadge')} size="sm" />}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                                                            <span className="flex items-center gap-1"><Clock size={11} />{event.time}</span>
                                                            <span className="flex items-center gap-1"><MapPin size={11} />{event.location}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </BentoCard>
                            </div>
                        </div>
                    )}

                    {activeTab === 'teams' && (
                        <div className="space-y-6">
                            {/* Search Bar */}
                            <div className="relative max-w-md">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={i18n.t('dashboard:views.searchTeams')}
                                    value={teamSearch}
                                    onChange={(e) => setTeamSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-shadow"
                                />
                            </div>

                            {/* Teams Grid */}
                            {teamsLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map(i => <TeamCardSkeleton key={i} />)}
                                </div>
                            ) : filteredTeams.length === 0 ? (
                                <BentoCard className="p-12">
                                    <EmptyState
                                        icon={Users}
                                        title={teamSearch ? i18n.t('dashboard:views.noTeamsFound') : i18n.t('dashboard:views.noTeamsYet')}
                                        description={teamSearch ? i18n.t('dashboard:views.tryOtherKeyword') : i18n.t('dashboard:views.noTeamsManaged')}
                                        action={!teamSearch ? { label: i18n.t('dashboard:views.createTeamAction'), onClick: () => navigate('/teams/create') } : undefined}
                                    />
                                </BentoCard>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredTeams.map((team) => (
                                        <TeamCard key={team.id} team={team} variant="card" />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'exams' && <QuizBuilderTab />}

                    {activeTab === 'tasks' && (
                        <div className="space-y-4">
                            {/* Priority filter info */}
                            {highPriorityTasks > 0 && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                    <AlertCircle size={20} className="text-red-500" />
                                    <p className="text-sm text-red-700 dark:text-red-400">
                                        {i18n.t('dashboard:views.urgentTasksAlert', { count: highPriorityTasks }).split('<1>').map((part, i) =>
                                            i === 0 ? part : <><strong>{part.split('</1>')[0]}</strong>{part.split('</1>')[1]}</>)}
                                    </p>
                                </div>
                            )}

                            {sortedPendingTasks.length === 0 ? (
                                <BentoCard className="p-12">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 size={32} className="text-emerald-500" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{i18n.t('dashboard:views.allDone')}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{i18n.t('dashboard:views.noTasksDesc')}</p>
                                    </div>
                                </BentoCard>
                            ) : (
                                sortedPendingTasks.map((task) => (
                                    <GlowCard
                                        key={task.id}
                                        glowColor={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'none'}
                                        intensity="soft"
                                        className="p-5"
                                    >
                                        <DashboardTaskCard
                                            task={task}
                                            onComplete={() => handleCompleteTask(task.id)}
                                            isSubmitting={isSubmitting}
                                        />
                                    </GlowCard>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <LecturerScheduleTab
                            events={events}
                            onAddEvent={() => setIsEventModalOpen(true)}
                            onEditEvent={setEditingEvent}
                            onDeleteEvent={setDeletingEventId}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
