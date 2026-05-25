import { useMemo } from 'react';
import { X, TrendingUp, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TeamMember } from '@/features/team/types/team.types';
import i18n from '@/i18n';

interface RoadmapStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamName: string;
    members: TeamMember[];
}

export const RoadmapStatsModal = ({ isOpen, onClose, teamName, members }: RoadmapStatsModalProps) => {
    if (!isOpen) return null;


    const stats = useMemo(() => {
        const total = members.length;
        if (total === 0) return null;



        const avgScore = Math.round(members.reduce((acc, m) => acc + (m.score || 0), 0) / total);

        const excellent = members.filter(m => (m.score || 0) >= 80).length;
        const warning = members.filter(m => (m.score || 0) < 30).length;
        const good = total - excellent - warning;

        return { total, avgScore, excellent, warning, good };
    }, [members]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="stats-modal-title">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true"></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-[24px] w-full max-w-2xl shadow-2xl animate-fade-in-up border border-slate-100 dark:border-gray-700 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center bg-slate-50/50 dark:bg-gray-800/30 rounded-t-[24px]">
                    <div>
                        <h2 id="stats-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">{i18n.t('roadmap:stats.title')}</h2>
                        <p className="text-sm text-slate-500">{teamName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-500 transition-colors" aria-label={i18n.t('roadmap:stats.close')}>
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {!stats ? (
                        <p className="text-center text-slate-500">{i18n.t('roadmap:stats.noData')}</p>
                    ) : (
                        <div className="space-y-8">

                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-center">
                                    <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 mb-2">
                                        <TrendingUp size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.avgScore}</p>
                                    <p className="text-xs text-slate-500">{i18n.t('roadmap:stats.avgScore')}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-700/50 border border-slate-100 dark:border-gray-700 text-center">
                                    <div className="w-10 h-10 mx-auto bg-slate-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 mb-2">
                                        <Users size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
                                    <p className="text-xs text-slate-500">{i18n.t('roadmap:stats.members')}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-center">
                                    <div className="w-10 h-10 mx-auto bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center text-red-600 dark:text-red-300 mb-2">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.warning}</p>
                                    <p className="text-xs text-slate-500">{i18n.t('roadmap:stats.needReminder')}</p>
                                </div>
                            </div>

                            {/* Distribution Chart (Simple CSS Bar) */}
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4">{i18n.t('roadmap:stats.scoreDistribution')}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                                                <CheckCircle2 size={16} /> {i18n.t('roadmap:stats.excellent')}
                                            </span>
                                            <span className="text-slate-600 dark:text-slate-400">{stats.excellent} SV</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full transition-colors duration-1000" style={{ width: `${(stats.excellent / stats.total) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                                                <TrendingUp size={16} /> {i18n.t('roadmap:stats.stable')}
                                            </span>
                                            <span className="text-slate-600 dark:text-slate-400">{stats.good} SV</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full transition-colors duration-1000" style={{ width: `${(stats.good / stats.total) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="flex items-center gap-2 text-red-500 font-medium">
                                                <AlertTriangle size={16} /> {i18n.t('roadmap:stats.weak')}
                                            </span>
                                            <span className="text-slate-600 dark:text-slate-400">{stats.warning} SV</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full transition-colors duration-1000" style={{ width: `${(stats.warning / stats.total) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-gray-700 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors" aria-label={i18n.t('roadmap:stats.closeWindow')}>
                        {i18n.t('roadmap:stats.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};