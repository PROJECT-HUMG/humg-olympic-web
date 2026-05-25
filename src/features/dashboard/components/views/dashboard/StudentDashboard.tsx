import { useMemo, useState, memo, type ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, Bell, Search, Trophy, BookOpen,
    Clock, MapPin, ChevronRight, TrendingUp, Compass
} from 'lucide-react';
import { BentoCard, SectionHeader, EmptyState } from '@/features/dashboard/components/DashboardLayout';
import { TeamCard } from '@/features/dashboard/components/TeamCard';
import {
    StatusBadge,
    GlowCard,
    TeamCardSkeleton,
    EventCardSkeleton,
    DashboardStatCard,
} from '@/features/dashboard/components/DashboardComponents';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardData } from '@/features/dashboard/types/dashboard.types';
import i18n from '@/i18n';

interface StudentDashboardProps {
    data: DashboardData;
    isLoading?: boolean;
}



// Memoized Quick Action Card
const QuickActionCard = memo<{
    icon: ElementType;
    label: string;
    description: string;
    onClick: () => void;
    color?: string;
}>(({ icon: Icon, label, description, onClick, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50',
        green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50',
    };

    return (
        <button
            onClick={onClick}
            className="flex flex-col items-start p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 text-left group"
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                <Icon size={20} />
            </div>
            <span className="font-medium text-slate-900 dark:text-white text-sm">
                {label}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
            </span>
        </button>
    );
});

QuickActionCard.displayName = 'QuickActionCard';

// Event Card with improved styling
const EventCard = memo<{
    event: {
        id: number;
        dateLabel: string;
        day: string;
        title: string;
        time: string;
        location: string;
    };
    isUpcoming?: boolean;
}>(({ event, isUpcoming }) => (
    <div
        className={`
            flex gap-4 py-4 first:pt-0 last:pb-0 
            hover:bg-slate-50 dark:hover:bg-slate-800/50 
            -mx-6 px-6 transition-colors cursor-pointer rounded-lg
            ${isUpcoming ? 'relative' : ''}
        `}
    >
        {isUpcoming && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
        )}
        <div className={`
            flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center
            ${isUpcoming
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25'
                : 'bg-slate-100 dark:bg-slate-800'
            }
        `}>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${isUpcoming ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {event.dateLabel}
            </span>
            <span className={`text-xl font-bold ${isUpcoming ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {event.day}
            </span>
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                {event.title}
                {isUpcoming && (
                    <StatusBadge status="info" label={i18n.t('dashboard:views.upcomingBadge')} size="sm" />
                )}
            </h4>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {event.time}
                </span>
                <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {event.location}
                </span>
            </div>
        </div>
    </div>
));

EventCard.displayName = 'EventCard';

// Activity Item with type-based styling
const ActivityItem = memo<{
    activity: {
        id: string;
        text: string;
        time: string;
        type: 'info' | 'success' | 'warning';
    };
}>(({ activity }) => {
    const typeColors = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500'
    };

    return (
        <div className="flex gap-4 relative group">
            <div
                className={`
                    w-3 h-3 rounded-full mt-1 flex-shrink-0 z-10 
                    ring-4 ring-white dark:ring-neutral-900
                    ${typeColors[activity.type]}
                    group-hover:scale-125 transition-transform duration-200
                `}
            />
            <div className="flex-1 min-w-0 pb-1">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activity.text}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                    {activity.time}
                </p>
            </div>
        </div>
    );
});

ActivityItem.displayName = 'ActivityItem';

export const StudentDashboard = ({ data, isLoading = false }: StudentDashboardProps) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const teams = data.teams ?? [];
    const events = data.events ?? [];
    const activities = data.activities ?? [];

    // Check if user is internal student (only internal students see team sections)
    const isInternalStudent = user?.role === 'STUDENT_INTERNAL';

    const filteredTeams = useMemo(() => {
        if (!searchQuery.trim()) return teams;
        const query = searchQuery.toLowerCase();
        return teams.filter(
            (team) =>
                team.name.toLowerCase().includes(query) ||
                team.subject.toLowerCase().includes(query)
        );
    }, [teams, searchQuery]);

    // Calculate stats
    const activeTeams = useMemo(() => teams.filter(t => t.status === 'ACTIVE').length, [teams]);
    const upcomingEvents = events.length;

    const quickActions = useMemo(() => {
        const actions = [
            {
                icon: Trophy,
                label: i18n.t('dashboard:views.actionCompetitions'),
                description: i18n.t('dashboard:views.actionCompetitionsDesc'),
                href: '/competitions',
                color: 'purple'
            },
            {
                icon: BookOpen,
                label: i18n.t('dashboard:views.actionResources'),
                description: i18n.t('dashboard:views.actionResourcesDesc'),
                href: '/resources',
                color: 'green'
            },
            {
                icon: Users,
                label: i18n.t('dashboard:views.actionTeams'),
                description: i18n.t('dashboard:views.actionTeamsDesc'),
                href: '/teams',
                color: 'blue',
                internalOnly: true
            },
            {
                icon: Calendar,
                label: i18n.t('dashboard:views.actionRoadmap'),
                description: i18n.t('dashboard:views.actionRoadmapDesc'),
                href: '/roadmap/public',
                color: 'amber'
            },
        ];
        // Filter out internal-only actions for external students
        return isInternalStudent ? actions : actions.filter(a => !a.internalOnly);
    }, [isInternalStudent]);

    // Welcome subtitle based on data and role
    const welcomeSubtitle = useMemo(() => {
        if (!isInternalStudent) return i18n.t('dashboard:views.studentSubtitleExternal');
        if (teams.length === 0) return i18n.t('dashboard:views.studentSubtitleNoTeam');
        if (activeTeams > 0) return i18n.t('dashboard:views.studentSubtitleActive', { count: activeTeams });
        return i18n.t('dashboard:views.studentSubtitleTeams', { count: teams.length });
    }, [teams.length, activeTeams, isInternalStudent]);

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                    {/* Welcome Header */}
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{i18n.t('dashboard:views.greeting', { name: user?.fullName || i18n.t('dashboard:views.studentGreetingFallback') })}</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{welcomeSubtitle}</p>
                        </div>
                        <button
                            onClick={() => navigate('/competitions')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                        >
                            <Compass size={16} />
                            {i18n.t('dashboard:views.exploreBtn')}
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {isInternalStudent && (
                            <>
                                <DashboardStatCard
                                    label={i18n.t('dashboard:views.statTeams')}
                                    value={teams.length}
                                    icon={Users}
                                    color="blue"
                                    onClick={() => navigate('/teams')}
                                />
                                <DashboardStatCard
                                    label={i18n.t('dashboard:views.statActive')}
                                    value={activeTeams}
                                    icon={TrendingUp}
                                    color="green"
                                />
                            </>
                        )}
                        <DashboardStatCard
                            label={i18n.t('dashboard:views.statUpcomingEvents')}
                            value={upcomingEvents}
                            icon={Calendar}
                            color="purple"
                            onClick={() => navigate('/roadmap/public')}
                        />
                        <DashboardStatCard
                            label={i18n.t('dashboard:views.statNotifications')}
                            value={activities.length}
                            icon={Bell}
                            color="amber"
                        />
                    </div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Quick Actions - Span 1 column */}
                        <GlowCard glowColor="blue" intensity="soft" className="p-6">
                            <SectionHeader title={i18n.t('dashboard:views.quickAccess')} />
                            <div className="grid grid-cols-2 gap-3">
                                {quickActions.map((action) => (
                                    <QuickActionCard
                                        key={action.label}
                                        icon={action.icon}
                                        label={action.label}
                                        description={action.description}
                                        onClick={() => navigate(action.href)}
                                        color={action.color}
                                    />
                                ))}
                            </div>
                        </GlowCard>

                        {/* Teams Section - Only for internal students, spans 2 columns */}
                        {isInternalStudent && (
                            <BentoCard className="lg:col-span-2 overflow-hidden">
                                <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <SectionHeader
                                            title={i18n.t('dashboard:views.myTeams')}
                                            subtitle={i18n.t('dashboard:views.myTeamsCount', { count: teams.length })}
                                        />
                                        <div className="relative w-full sm:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder={i18n.t('dashboard:tabs.searchPlaceholder')}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 transition-shadow"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {isLoading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[1, 2, 3, 4].map(i => <TeamCardSkeleton key={i} />)}
                                        </div>
                                    ) : filteredTeams.length === 0 ? (
                                        <EmptyState
                                            icon={Users}
                                            title={searchQuery ? i18n.t('dashboard:views.noTeamsFound') : i18n.t('dashboard:views.noTeamsYet')}
                                            description={searchQuery ? i18n.t('dashboard:views.tryOtherKeyword') : i18n.t('dashboard:views.studentNoTeams')}
                                            action={!searchQuery ? {
                                                label: i18n.t('dashboard:views.exploreTeams'),
                                                onClick: () => navigate('/teams')
                                            } : undefined}
                                        />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredTeams.slice(0, 4).map((team) => (
                                                <TeamCard key={team.id} team={team} variant="card" />
                                            ))}
                                        </div>
                                    )}
                                    {filteredTeams.length > 4 && (
                                        <button
                                            onClick={() => navigate('/teams')}
                                            className="w-full mt-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                                        >
                                            {i18n.t('dashboard:views.viewAllTeams', { count: filteredTeams.length })}
                                            <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </BentoCard>
                        )}

                        {/* Events Section */}
                        <BentoCard className="lg:col-span-2 overflow-hidden">
                            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <SectionHeader
                                    title={i18n.t('dashboard:views.upcomingSchedule')}
                                    subtitle={i18n.t('dashboard:views.eventsCount', { count: events.length })}
                                    onViewAll={() => navigate('/roadmap/public')}
                                />
                            </div>

                            <div className="p-6">
                                {isLoading ? (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {[1, 2, 3].map(i => <EventCardSkeleton key={i} />)}
                                    </div>
                                ) : events.length === 0 ? (
                                    <EmptyState
                                        icon={Calendar}
                                        title={i18n.t('dashboard:views.emptySchedule')}
                                        description={i18n.t('dashboard:views.emptyScheduleDesc')}
                                    />
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {events.slice(0, 4).map((event, index) => (
                                            <EventCard
                                                key={event.id}
                                                event={event}
                                                isUpcoming={index === 0}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </BentoCard>

                        {/* Activities Timeline */}
                        <BentoCard className="overflow-hidden">
                            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <SectionHeader
                                    title={i18n.t('dashboard:views.tabActivity')}
                                    subtitle={i18n.t('dashboard:views.activitiesCount', { count: activities.length })}
                                />
                            </div>

                            <div className="p-6">
                                {activities.length === 0 ? (
                                    <EmptyState
                                        icon={Bell}
                                        title={i18n.t('dashboard:views.noActivities')}
                                        description={i18n.t('dashboard:views.noActivitiesDesc')}
                                    />
                                ) : (
                                    <div className="relative">
                                        {/* Timeline line */}
                                        <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-slate-200 dark:via-slate-700 to-transparent" />

                                        <div className="space-y-4">
                                            {activities.slice(0, 6).map((activity) => (
                                                <ActivityItem key={activity.id} activity={activity} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </BentoCard>
                    </div>
                </div>
            </div>
        </div>
    );
};