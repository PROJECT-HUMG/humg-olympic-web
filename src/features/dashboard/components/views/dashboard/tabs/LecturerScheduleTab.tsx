import { memo } from 'react';
import { Calendar, Clock, MapPin, Plus, Edit3, Trash2 } from 'lucide-react';
import { BentoCard, EmptyState } from '@/features/dashboard/components/DashboardLayout';
import { StatusBadge } from '@/features/dashboard/components/DashboardComponents';
import type { DashboardEvent } from '@/features/dashboard/types/dashboard.types';
import i18n from '@/i18n';

interface LecturerScheduleTabProps {
    events: DashboardEvent[];
    onAddEvent: () => void;
    onEditEvent: (event: DashboardEvent) => void;
    onDeleteEvent: (eventId: number) => void;
}

export const LecturerScheduleTab = memo(({
    events, onAddEvent, onEditEvent, onDeleteEvent,
}: LecturerScheduleTabProps) => (
    <div className="space-y-6">
        {/* Add Event Button */}
        <div className="flex justify-end">
            <button
                onClick={onAddEvent}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
                <Plus size={18} />
                {i18n.t('dashboard:views.addEvent')}
            </button>
        </div>

        {events.length === 0 ? (
            <BentoCard className="p-12">
                <EmptyState
                    icon={Calendar}
                    title={i18n.t('dashboard:tabs.emptySchedule')}
                    description={i18n.t('dashboard:views.emptyScheduleDesc')}
                    action={{ label: i18n.t('dashboard:views.addEvent'), onClick: onAddEvent }}
                />
            </BentoCard>
        ) : (
            <div className="relative">
                {/* Timeline */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-slate-200 dark:via-neutral-700 to-transparent" />
                <div className="space-y-4">
                    {events.map((event, index) => (
                        <div key={event.id} className="flex gap-4 relative group">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center z-10 ${index === 0
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                : 'bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800'
                                }`}>
                                <span className={`text-[10px] font-semibold uppercase ${index === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{event.dateLabel}</span>
                                <span className={`text-lg font-bold ${index === 0 ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{event.day}</span>
                            </div>
                            <BentoCard className="flex-1 p-4 hover:border-slate-300 dark:hover:border-neutral-600 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                            {event.title}
                                            {index === 0 && <StatusBadge status="info" label={i18n.t('dashboard:views.nextBadge')} size="sm" />}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1"><Clock size={14} />{event.time}</span>
                                            <span className="flex items-center gap-1"><MapPin size={14} />{event.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEditEvent(event)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title={i18n.t('dashboard:tabs.editTooltip')}
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteEvent(event.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title={i18n.t('dashboard:tabs.deleteTooltip')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </BentoCard>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
));

LecturerScheduleTab.displayName = 'LecturerScheduleTab';
