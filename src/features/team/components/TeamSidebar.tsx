import { useState, useMemo, type UIEvent } from 'react';
import { Search, Plus, Inbox, Loader2, BookOpen, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Team } from '@/features/team/types/team.types';
import i18n from '@/i18n';


interface TeamSidebarProps {
    teams: Team[];
    activeTeamId: number | null;
    onSelect: (id: number) => void;
    onCreate?: () => void;
    canCreate: boolean;
    isLoading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'ACTIVE': return { label: i18n.t('features:team.sidebar.statusActive'), color: 'bg-emerald-500', text: 'text-emerald-600', icon: CheckCircle2 };
        case 'FINISHED': return { label: i18n.t('features:team.sidebar.statusFinished'), color: 'bg-slate-400', text: 'text-slate-500', icon: Clock };
        case 'PENDING': default: return { label: i18n.t('features:team.sidebar.statusPending'), color: 'bg-amber-500', text: 'text-amber-600', icon: AlertCircle };
    }
};

export const TeamSidebar = ({
    teams, activeTeamId, onSelect, onCreate, canCreate, isLoading = false, onLoadMore, hasMore = false
}: TeamSidebarProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoading && !searchTerm) {
            onLoadMore?.();
        }
    };

    const filteredTeams = useMemo(() => {
        return teams.filter(t =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [teams, searchTerm]);

    return (
        <div className="flex flex-col h-full w-full">
            {/* --- SEARCH HEADER --- */}
            <div className="p-5 pb-2 shrink-0 relative z-20">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 bg-slate-100 dark:bg-slate-900/50 border-none rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 transition-colors font-medium"
                        placeholder={i18n.t('features:team.sidebar.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {canCreate && (
                        <div className="absolute inset-y-0 right-1.5 flex items-center md:hidden">
                            <button onClick={onCreate} className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30">
                                <Plus size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- TEAM LIST --- */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar" onScroll={handleScroll}>
                {isLoading && teams.length === 0 ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 p-4 rounded-[20px] bg-slate-50 dark:bg-slate-800/50 animate-pulse">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                            </div>
                        </div>
                    ))
                ) : filteredTeams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                            <Inbox size={32} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">{i18n.t('features:team.sidebar.notFound')}</p>
                        {canCreate && !searchTerm && (
                            <button onClick={onCreate} className="mt-4 px-5 py-2 bg-indigo-500/10 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-500/20 transition-colors">
                                {i18n.t('features:team.sidebar.createNow')}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2 pt-2 relative">
                        {filteredTeams.map((team) => {
                            const config = getStatusConfig(team.status);
                            const isActive = activeTeamId === team.id;

                            return (
                                <div
                                    key={team.id}
                                    onClick={() => onSelect(team.id)}
                                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 border z-10 ${isActive
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-[0_2px_10px_rgba(59,130,246,0.1)]'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-transparent">
                                            <img
                                                src={team.avatarUrl || '/assets/logo.png'}
                                                alt={team.name}
                                                className={`w-full h-full ${team.avatarUrl ? 'object-cover' : 'object-contain w-6 h-6 opacity-70'}`}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-bold text-sm truncate ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-slate-800 dark:text-slate-100'}`}>
                                                {team.name}
                                            </h3>

                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${isActive
                                                    ? 'bg-blue-100/50 dark:bg-blue-800/50 text-blue-700 dark:text-blue-200'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                    {team.subject}
                                                </span>
                                                <div className={`h-1.5 w-1.5 rounded-full ${config.color}`} title={config.label} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {isLoading && teams.length > 0 && (
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    </div>
                )}
            </div>
        </div>
    );
};