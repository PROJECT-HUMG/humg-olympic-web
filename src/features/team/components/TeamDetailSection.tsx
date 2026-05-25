import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Map, Settings, Loader2, CheckCircle, LayoutDashboard,
    Users, FileText, Calendar, Share2, Activity, ChevronRight, ArrowRight, Award,
    type LucideIcon
} from 'lucide-react';
import { TeamMemberList } from '@/features/team/components/TeamMemberList';
import { Team } from '@/features/team/types/team.types';

import { AnimatedTabContent } from '@/components/ui/AnimatedTabContent';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { MagneticWrapper } from '@/components/ui/MagneticWrapper';

interface TeamDetailProps {
    activeTeam: Team;
    user: { id: number } | null;
    canManageActiveTeam: boolean;
    onExport: () => void;
    onOpenSettings: () => void;
    onAddLecturer: () => void;
    onAddStudent: () => void;
    isExporting?: boolean;
    onRemoveMember?: (userId: number) => void;
    onApprove?: () => void;
    isApproving?: boolean;
    isManager?: boolean;
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: LucideIcon;
    label: string;
}

const TabButton = ({ active, onClick, icon: Icon, label, btnRef }: TabButtonProps & { btnRef?: (el: HTMLButtonElement | null) => void }) => (
    <button
        ref={btnRef}
        onClick={onClick}
        className={`relative px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors duration-300 cursor-pointer ${active
            ? 'text-white'
            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/10'
            }`}
    >
        <span className="relative z-10 flex items-center gap-2">
            <Icon size={16} strokeWidth={2.5} />
            {label}
        </span>
    </button>
);

const STATUS_MAP: Record<string, { label: string; class: string; dotClass: string }> = {
    PENDING: {
        label: i18n.t('features:team.detail.statusPending'),
        class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        dotClass: 'bg-amber-500'
    },
    ACTIVE: {
        label: i18n.t('features:team.detail.statusActive'),
        class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        dotClass: 'bg-emerald-500'
    },
    FINISHED: {
        label: i18n.t('features:team.detail.statusFinished'),
        class: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
        dotClass: 'bg-zinc-500'
    },
};

export const TeamDetailSection = ({
    activeTeam, user, canManageActiveTeam, onExport, onOpenSettings,
    onAddLecturer, onAddStudent, isExporting = false, onRemoveMember,
    onApprove, isApproving = false, isManager = false
}: TeamDetailProps) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'members'>('overview');
    const tabContainerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });

    useEffect(() => { setActiveTab('overview'); }, [activeTeam.id]);

    useLayoutEffect(() => {
        const btn = tabRefs.current[activeTab];
        const container = tabContainerRef.current;
        if (btn && container) {
            const cRect = container.getBoundingClientRect();
            const bRect = btn.getBoundingClientRect();
            setTabIndicator({ left: bRect.left - cRect.left, width: bRect.width });
        }
    }, [activeTab]);

    const status = STATUS_MAP[activeTeam.status] || STATUS_MAP.ACTIVE;

    const copyLink = () => {
        const url = `${window.location.origin}/teams/${activeTeam.slug}`;
        navigator.clipboard.writeText(url);
        showToast(i18n.t('features:team.linkCopied'));
    };

    const renderOverview = () => (
        <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
            {/* === STATS GRID === */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: i18n.t('features:team.detail.statMembers'), value: activeTeam.members.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: i18n.t('features:team.detail.statYear'), value: activeTeam.academicYear || '2025-2026', icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                    {
                        label: i18n.t('features:team.detail.statStatus'),
                        value: status.label,
                        icon: Activity,
                        isBadge: true,
                        customClass: status.class
                    }
                ].map((stat, i) => (
                    <MagneticWrapper key={i} strength={8}>
                        <div className="group relative overflow-hidden bg-white dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 p-6 rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 block w-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="flex flex-col gap-4 relative z-10">
                                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                                    <stat.icon size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className="text-zinc-500 dark:text-zinc-400 font-bold text-xs mb-1.5 tracking-wider uppercase">{stat.label}</div>
                                    {stat.isBadge ? (
                                        <div className="pt-0.5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${stat.customClass}`}>
                                                <div className={`w-2 h-2 rounded-full animate-pulse ${status.dotClass}`} />
                                                {stat.value}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{stat.value}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </MagneticWrapper>
                ))}
            </div>

            {/* === SIMPLIFIED ROADMAP BANNER === */}
            <div className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-1">
                    <div className="flex items-center gap-4 p-4 pl-5 w-full sm:w-auto">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <Map size={24} strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">{i18n.t('features:team.detail.roadmapTitle')}</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{i18n.t('features:team.detail.roadmapSubtitle')}</p>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto px-4 pb-4 sm:pb-0 sm:pr-4 flex justify-end">
                        {activeTeam.roadmapId ? (
                            <button
                                onClick={() => navigate(`/roadmap/teams/${activeTeam.id}`)}
                                className="group/btn flex items-center gap-2 px-5 py-2.5 bg-zinc-50 hover:bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl font-semibold transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 hover:shadow-sm text-sm"
                            >
                                <span>{i18n.t('features:team.detail.roadmapDetail')}</span>
                                <ChevronRight size={16} className="text-zinc-400 group-hover/btn:text-blue-500 transition-colors" />
                            </button>
                        ) : canManageActiveTeam ? (
                            <button
                                onClick={() => navigate('/roadmap/create')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-colors active:scale-95 text-sm"
                            >
                                {i18n.t('features:team.detail.createRoadmap')} <ArrowRight size={16} />
                            </button>
                        ) : (
                            <span className="px-4 py-2 text-zinc-400 text-sm font-medium bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">{i18n.t('features:team.detail.noRoadmap')}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* === DESCRIPTION === */}
            <div className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                <div className="p-6">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <div className="p-1 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-600">
                            <FileText size={16} />
                        </div>
                        {i18n.t('features:team.detail.aboutTitle')}
                    </h3>
                    <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm pl-2 border-l-2 border-zinc-100 dark:border-zinc-800">
                        {activeTeam.description ? (
                            <p>{activeTeam.description}</p>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-zinc-400 gap-1.5">
                                <span className="italic text-sm">{i18n.t('features:team.detail.noDescription')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* --- HERO BANNER HEADER --- */}
            <div className="relative overflow-hidden rounded-[2rem] bg-amber-50/30 dark:bg-zinc-900 border border-amber-100 dark:border-zinc-800 p-6 md:p-8">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-20 w-40 h-40 bg-orange-500/5 rounded-full blur-[60px] -mb-10 pointer-events-none" />


                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
                    {/* Header Left: Avatar & Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1">
                        {/* Avatar */}
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-[2rem] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden group">
                            <img
                                src={activeTeam.avatarUrl || '/assets/logo.png'}
                                alt={activeTeam.name}
                                className={`w-full h-full relative z-10 transition-transform duration-700 group-hover:scale-105 ${activeTeam.avatarUrl ? 'object-cover' : 'object-contain p-5 opacity-80'}`}
                            />
                        </div>

                        {/* Info */}
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/50 dark:bg-zinc-800 border border-amber-200/50 dark:border-zinc-700 text-amber-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-widest shadow-sm">
                                <Award size={14} className="text-amber-500 dark:text-zinc-400" />
                                {i18n.t('features:team.detail.teamSubject', { subject: activeTeam.subject })}
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                                {activeTeam.name}
                            </h1>
                            <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                                <span className="flex items-center gap-1.5 bg-white/50 dark:bg-zinc-800/50 px-3 py-1 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
                                    <Calendar size={14} className="text-zinc-400" />
                                    {i18n.t('features:team.detail.yearLabel')} <span className="text-zinc-900 dark:text-white">{activeTeam.academicYear || '2025-2026'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {activeTeam.status === 'PENDING' && isManager && (
                            <MagneticWrapper strength={15}>
                                <button
                                    onClick={onApprove}
                                    disabled={isApproving}
                                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white hover:bg-amber-600 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isApproving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />}
                                    {i18n.t('features:team.detail.approveNow')}
                                </button>
                            </MagneticWrapper>
                        )}

                        <div className="flex items-center p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-sm">
                            <MagneticWrapper strength={10}>
                                <button
                                    onClick={copyLink}
                                    className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-300 text-sm font-medium"
                                    title={i18n.t('features:team.detail.copyLink')}
                                >
                                    <Share2 size={16} /> <span className="hidden sm:inline">{i18n.t('features:team.detail.share')}</span>
                                </button>
                            </MagneticWrapper>
                            {canManageActiveTeam && (
                                <>
                                    <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                                    <MagneticWrapper strength={10}>
                                        <button
                                            onClick={onOpenSettings}
                                            className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-300 text-sm font-medium group"
                                            title={i18n.t('features:team.detail.settingsTitle')}
                                        >
                                            <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" /> <span className="hidden sm:inline">{i18n.t('features:team.detail.settings')}</span>
                                        </button>
                                    </MagneticWrapper>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TABS --- */}
            <div className="w-full border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 bg-white/80 dark:bg-black/20 backdrop-blur-xl -mx-4 px-4">
                <div ref={tabContainerRef} className="relative flex justify-start pt-1 pb-3">
                    <span
                        className="absolute top-1 bg-blue-600 rounded-full shadow-md shadow-blue-600/20 transition-all duration-300 ease-out"
                        style={{ left: tabIndicator.left, width: tabIndicator.width, height: 'calc(100% - 1rem)' }}
                    />
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label={i18n.t('features:team.detail.tabOverview')} btnRef={el => { tabRefs.current['overview'] = el; }} />
                    <TabButton active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={Users} label={i18n.t('features:team.detail.tabMembers')} btnRef={el => { tabRefs.current['members'] = el; }} />
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="min-h-[500px]">
                <AnimatedTabContent activeKey={activeTab}>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'members' && (
                        <TeamMemberList
                            members={activeTeam.members}
                            currentUserId={user?.id || 0}
                            teamStatus={activeTeam.status}
                            canManage={!!canManageActiveTeam}
                            onAddLecturer={onAddLecturer}
                            onAddStudent={onAddStudent}
                            onRemoveMember={onRemoveMember}
                        />
                    )}
                </AnimatedTabContent>
            </div>
        </div>
    );
};