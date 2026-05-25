import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TeamSidebar } from '@/features/team/components/TeamSidebar';
import { TeamDetailSection } from '@/features/team/components/TeamDetailSection';
import { TeamDetailSkeleton } from '@/features/team/components/TeamDetailSkeleton';
import { EmptyTeamState } from '@/features/team/components/EmptyTeamState';
import { CreateTeamModal } from '@/features/team/components/CreateTeamModal';
import { AddMemberModal } from '@/features/team/components/AddMemberModal';
import { TeamSettingsModal } from '@/features/team/components/TeamSettingsModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Users, Plus, ChevronLeft } from 'lucide-react';
import i18n from '@/i18n';
import { useTeamPageLogic } from '@/features/team/hooks/useTeamPageLogic';



export const TeamManagementPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const {
        teams, activeTeam, activeTeamId, setActiveTeamId,
        loadMoreTeams, hasMore, isListLoading, isDetailLoading, isManager,
        user, modals, toggleModal, loadingState, canManageActiveTeam, handlers
    } = useTeamPageLogic();

    const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

    useEffect(() => {
        if (slug) {
            // Resolve slug to team from the loaded list
            const found = teams.find(t => t.slug === slug);
            if (found && found.id !== activeTeamId) {
                setActiveTeamId(found.id);
                setMobileView('detail');
            }
        }
    }, [slug, teams]);

    useEffect(() => {
        if (!slug && activeTeam) {
            navigate(`/teams/${activeTeam.slug}`, { replace: true });
        }
    }, [activeTeam, slug, navigate]);

    const handleSelectTeam = (id: number) => {
        const team = teams.find(t => t.id === id);
        setActiveTeamId(id);
        setMobileView('detail');
        if (team) navigate(`/teams/${team.slug}`);
    };

    const handleBackToList = () => {
        setMobileView('list');
        navigate('/teams'); // Clear ID when going back
    };

    const renderMainContent = () => {
        if (isDetailLoading) return <TeamDetailSkeleton />;
        if (!activeTeam) {
            return (
                <EmptyTeamState
                    onCreate={isManager ? () => toggleModal('create', true) : undefined}
                    message={teams.length === 0
                        ? i18n.t('features:team.page.noTeam')
                        : i18n.t('features:team.page.selectTeam')
                    }
                />
            );
        }
        return (
            <TeamDetailSection
                activeTeam={activeTeam}
                user={user}
                canManageActiveTeam={canManageActiveTeam}
                onOpenSettings={() => toggleModal('settings', true)}
                onAddLecturer={() => toggleModal('addMember', 'LECTURER')}
                onAddStudent={() => toggleModal('addMember', 'STUDENT')}
                onExport={handlers.handleExport}
                onApprove={handlers.handleApprove}
                onRemoveMember={(id) => toggleModal('confirmDeleteMember', id)}
                isExporting={loadingState.isExporting}
                isApproving={loadingState.isApproving}
                isManager={isManager}
            />
        );
    };

    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">


            <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl max-w-full">
                    {/* HEADER */}
                    <header className="py-4 md:py-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Mobile Back Button */}
                            {mobileView === 'detail' && activeTeam && (
                                <button onClick={handleBackToList} className="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                        <Users className="text-blue-600 dark:text-blue-500" size={24} />
                                    </div>
                                    <span className="hidden sm:inline">{i18n.t('features:team.page.workspace')}</span>
                                    <span className="sm:hidden">{i18n.t('features:team.page.teamLabel')}</span>
                                </h1>
                                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base hidden sm:block">
                                    {i18n.t('features:team.page.subtitle')}
                                </p>
                            </div>
                        </div>

                        {isManager && (
                            <button
                                onClick={() => toggleModal('create', true)}
                                className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl md:rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl active:scale-95 text-sm md:text-base"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">{i18n.t('features:team.page.createTeam')}</span>
                            </button>
                        )}
                    </header>

                    {/* MAIN LAYOUT */}
                    <main className="mt-4 md:mt-6">
                        {/* Desktop: Split View */}
                        <div className="hidden lg:grid lg:grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
                            {/* Sidebar - 4 cols */}
                            <div className="lg:col-span-4">
                                <div className="sticky top-[90px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden max-h-[calc(100vh-120px)]">
                                    <TeamSidebar
                                        teams={teams}
                                        activeTeamId={activeTeamId}
                                        onSelect={handleSelectTeam}
                                        canCreate={isManager}
                                        onCreate={() => toggleModal('create', true)}
                                        isLoading={isListLoading}
                                        onLoadMore={loadMoreTeams}
                                        hasMore={hasMore}
                                    />
                                </div>
                            </div>

                            {/* Content - 8 cols */}
                            <div className="lg:col-span-8">
                                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-xl p-6 md:p-8">
                                    {renderMainContent()}
                                </div>
                            </div>
                        </div>

                        {/* Mobile: Full Width Views */}
                        <div className="lg:hidden">
                            {mobileView === 'list' && (
                                <div key="list" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[20px] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200">
                                    <TeamSidebar
                                        teams={teams}
                                        activeTeamId={activeTeamId}
                                        onSelect={handleSelectTeam}
                                        canCreate={isManager}
                                        onCreate={() => toggleModal('create', true)}
                                        isLoading={isListLoading}
                                        onLoadMore={loadMoreTeams}
                                        hasMore={hasMore}
                                    />
                                </div>
                            )}
                            {mobileView === 'detail' && (
                                <div key="detail" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[20px] border border-slate-100 dark:border-slate-700 shadow-xl p-4 md:p-6 animate-in fade-in slide-in-from-right-4 duration-200">
                                    {renderMainContent()}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* --- MODALS --- */}
            <CreateTeamModal
                isOpen={modals.create}
                onClose={() => toggleModal('create', false)}
                onSubmit={handlers.handleCreateTeam}
                isLoading={loadingState.isCreating}
            />

            {modals.addMember && (
                <AddMemberModal
                    isOpen={!!modals.addMember}
                    onClose={() => toggleModal('addMember', null)}
                    type={modals.addMember}
                    onSubmit={handlers.handleAddMember}
                    isLoading={loadingState.isAddingMember}
                />
            )}

            {modals.settings && activeTeam && (
                <TeamSettingsModal
                    isOpen={modals.settings}
                    onClose={() => toggleModal('settings', false)}
                    team={activeTeam}
                    onUpdate={handlers.handleUpdateTeam}
                    isLoading={loadingState.isUpdating}
                    onDelete={handlers.onRequestDeleteTeam}
                />
            )}

            <ConfirmModal
                isOpen={!!modals.confirmDeleteMember}
                onClose={() => toggleModal('confirmDeleteMember', null)}
                onConfirm={handlers.handleRemoveMemberConfirm}
                isLoading={loadingState.isDeletingMember}
                title={i18n.t('features:team.page.removeMemberTitle')}
                message={i18n.t('features:team.page.removeMemberMsg')}
                confirmText={i18n.t('features:team.page.removeNow')}
                variant="danger"
            />

            <ConfirmModal
                isOpen={modals.confirmDeleteTeam}
                onClose={() => toggleModal('confirmDeleteTeam', false)}
                onConfirm={handlers.handleDeleteTeamConfirm}
                isLoading={loadingState.isDeletingTeam}
                title={i18n.t('features:team.page.disbandTitle')}
                message={i18n.t('features:team.page.disbandMsg', { name: activeTeam?.name })}
                confirmText={i18n.t('features:team.page.disbandConfirm')}
                cancelText={i18n.t('features:team.page.keepTeam')}
                variant="danger"
            />
        </div>
    );
};