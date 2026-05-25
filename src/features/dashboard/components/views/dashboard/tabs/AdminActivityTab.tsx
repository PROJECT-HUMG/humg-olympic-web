import { Bell } from 'lucide-react';
import { BentoCard, SectionHeader, EmptyState } from '@/features/dashboard/components/DashboardLayout';
import i18n from '@/i18n';

interface ActivityItem {
    id: number | string;
    text: string;
    time: string;
    type: string;
}

interface AdminActivityTabProps {
    activities: ActivityItem[];
}

export const AdminActivityTab = ({ activities }: AdminActivityTabProps) => (
    <div className="space-y-6">
        {activities.length === 0 ? (
            <BentoCard className="p-12">
                <EmptyState icon={Bell} title={i18n.t('dashboard:tabs.noActivity')} description={i18n.t('dashboard:tabs.noActivityDesc')} />
            </BentoCard>
        ) : (
            <BentoCard className="p-6">
                <SectionHeader title={i18n.t('dashboard:tabs.recentActivity')} subtitle={i18n.t('dashboard:tabs.activityCount', { count: activities.length })} />
                <div className="relative mt-4">
                    <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-slate-200 dark:via-slate-700 to-transparent" />
                    <div className="space-y-6">
                        {activities.map((act) => (
                            <div key={act.id} className="flex gap-4 relative group">
                                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 z-10 ring-4 ring-white dark:ring-neutral-900 group-hover:scale-125 transition-transform ${act.type === 'success' ? 'bg-emerald-500' :
                                    act.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`} />
                                <div className="flex-1 min-w-0 pb-2">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{act.text}</p>
                                    <p className="text-xs text-slate-400 mt-1">{act.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </BentoCard>
        )}
    </div>
);
