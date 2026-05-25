import React, { useState, useEffect, useTransition } from 'react';
import { X, CalendarCheck, Clock, MapPin, Tag, Calendar } from 'lucide-react';
import { useDashboardActions } from '@/features/dashboard/hooks/useDashboardActions';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { CreateEventDTO, DashboardEvent } from '../types/dashboard.types';

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: DashboardEvent | null;
    onSuccess?: (event: DashboardEvent) => void;
}

export const EditEventModal = ({ isOpen, onClose, event, onSuccess }: EditEventModalProps) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Meeting');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, startSubmitTransition] = useTransition();
    const { updateEvent } = useDashboardActions();

    useEffect(() => {
        if (event && isOpen) {
            setTitle(event.title);
            setTime(event.time);
            setLocation(event.location);
            const currentYear = new Date().getFullYear();
            const monthMap: Record<string, string> = {
                'Thg 1': '01', 'Thg 2': '02', 'Thg 3': '03', 'Thg 4': '04',
                'Thg 5': '05', 'Thg 6': '06', 'Thg 7': '07', 'Thg 8': '08',
                'Thg 9': '09', 'Thg 10': '10', 'Thg 11': '11', 'Thg 12': '12',
            };
            const month = monthMap[event.dateLabel] || '01';
            const day = event.day.padStart(2, '0');
            setDate(`${currentYear}-${month}-${day}`);
        }
    }, [event, isOpen]);

    if (!isOpen || !event) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date || !time) {
            showToast(i18n.t('dashboard:fillAllFields'), 'error');
            return;
        }

        startSubmitTransition(async () => {
            try {
                const dto: CreateEventDTO = {
                    title, type, date, time, location
                };

                await updateEvent(event.id, dto);

                const dateObj = new Date(date);
                const monthLabels = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
                const updatedEvent: DashboardEvent = {
                    id: event.id,
                    dateLabel: monthLabels[dateObj.getMonth()],
                    day: String(dateObj.getDate()),
                    title,
                    time,
                    location: location || i18n.t('dashboard:eventModal.locationFallback')
                };

                showToast(i18n.t('dashboard:event.updateSuccess'), 'success');
                onSuccess?.(updatedEvent);
                onClose();
            } catch {
                showToast(i18n.t('dashboard:event.updateFailed'), 'error');
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative bg-white dark:bg-humg-dark-surface rounded-[24px] w-full max-w-md shadow-2xl animate-fade-in-up border border-slate-100 dark:border-slate-700 flex flex-col">

                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 rounded-t-[24px]">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarCheck className="text-humg-amber" size={24} />
                        {i18n.t('dashboard:eventModal.editTitle')}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{i18n.t('dashboard:eventModal.eventTitleLabel')}</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-humg-blue/50 outline-none text-slate-800 dark:text-white transition-colors"
                            placeholder={i18n.t('dashboard:modals.eventTitle')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Tag size={16} /> {i18n.t('dashboard:eventModal.eventTypeLabel')}</label>
                        <select
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-humg-blue/50 outline-none text-slate-800 dark:text-white cursor-pointer"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="Meeting">{i18n.t('dashboard:eventModal.typeMeeting')}</option>
                            <option value="Class">{i18n.t('dashboard:eventModal.typeClass')}</option>
                            <option value="Exam">{i18n.t('features:competitions.filterStatus.exam')}</option>
                            <option value="Deadline">{i18n.t('dashboard:eventModal.typeDeadline')}</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Calendar size={16} /> {i18n.t('dashboard:eventModal.dateLabel')}</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-humg-blue/50 outline-none text-slate-800 dark:text-white transition-colors [color-scheme:light]"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Clock size={16} /> {i18n.t('dashboard:eventModal.timeLabel')}</label>
                            <input
                                type="time"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-humg-blue/50 outline-none text-slate-800 dark:text-white transition-colors [color-scheme:light]"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><MapPin size={16} /> {i18n.t('dashboard:eventModal.locationLabel')}</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-humg-blue/50 outline-none text-slate-800 dark:text-white"
                            placeholder={i18n.t('dashboard:modals.eventLocation')}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? i18n.t('dashboard:eventModal.saving') : i18n.t('dashboard:eventModal.updateBtn')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
