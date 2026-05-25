
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { DashboardTeamSummary } from '@/features/dashboard/types/dashboard.types';
import i18n from '@/i18n';

interface TeamCardProps {
    team: DashboardTeamSummary;
    variant?: 'card' | 'row';
}

export const TeamCard = ({ team, variant = 'card' }: TeamCardProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/teams/${team.slug}`);
    };

    const statusConfig = {
        ACTIVE: {
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-700 dark:text-emerald-400',
            icon: CheckCircle2,
            label: i18n.t('dashboard:teamStatus.active'),
        },
        FINISHED: {
            bg: 'bg-slate-200 dark:bg-slate-700',
            text: 'text-slate-700 dark:text-slate-400',
            icon: CheckCircle2,
            label: i18n.t('dashboard:teamStatus.completed'),
        },
        PENDING: {
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            text: 'text-amber-700 dark:text-amber-400',
            icon: Clock,
            label: i18n.t('dashboard:teamStatus.pending'),
        },
    };

    const status = statusConfig[team.status] || statusConfig.PENDING;
    const StatusIcon = status.icon;

    if (variant === 'card') {
        return (
            <button
                onClick={handleClick}
                className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-colors cursor-pointer"
            >
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-bold text-lg text-blue-600 dark:text-blue-400 flex-shrink-0 overflow-hidden shadow-sm">
                        {team.avatarUrl ? (
                            <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                            team.name.charAt(0)
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                {team.name}
                            </h3>
                            <ArrowRight
                                size={18}
                                className="text-slate-400 flex-shrink-0"
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {team.subject} • {team.academicYear}
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                    <Users size={14} />
                                    {team.members?.length || 0}
                                </span>

                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.text}`}>
                                    <StatusIcon size={14} />
                                    {status.label}
                                </span>
                            </div>

                            {team.roadmapId && team.roadmapName && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/roadmap/teams/${team.id}`);
                                    }}
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    📍 {team.roadmapName}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </button>
        );
    }

    // Row variant
    return (
        <button
            onClick={handleClick}
            className="group w-full hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
        >
            <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                {/* Team Name */}
                <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform flex-shrink-0 overflow-hidden">
                        {team.avatarUrl ? (
                            <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                            team.name.charAt(0)
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {team.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {team.subject} • {team.academicYear}
                        </p>
                    </div>
                </div>

                {/* Members */}
                <div className="col-span-4 sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {team.members?.length || 0}
                </div>

                {/* Roadmap */}
                <div className="col-span-8 sm:col-span-4">
                    {team.roadmapId && team.roadmapName ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/roadmap/teams/${team.id}`);
                            }}
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                            {team.roadmapName}
                            <ArrowRight size={14} />
                        </button>
                    ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500">{i18n.t('dashboard:teamStatus.notSet')}</span>
                    )}
                </div>

                {/* Status */}
                <div className="col-span-12 sm:col-span-2 flex items-center justify-end">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                        <StatusIcon size={12} />
                        {status.label}
                    </span>
                </div>
            </div>
        </button>
    );
};
