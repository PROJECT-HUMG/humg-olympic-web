import { useState, useMemo, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import {
    User, Award, Clock,
    Settings, History,
} from 'lucide-react';
import { AnimatedTabContent, startTabTransition } from '@/components/ui/AnimatedTabContent';

import { useAuth } from '../../../contexts/AuthContext';
import { authRepository } from '@/features/auth/api';
import { showToast } from '../../../components/ui/Toast';
import i18n from '@/i18n';
import { BadgeRequestModal } from '../../badges/components/BadgeRequestModal';
import { MyBadgeRequestsTab } from '../components/MyBadgeRequestsTab';
import { useBadgeRequests } from '@/features/badges/hooks/useBadgeRequests';
import { SettingsTab } from '../../settings/components/SettingsTab';
import type { BadgeItem, UserProfileResponse } from '@/features/auth/types/auth.types';
import { ExamHistoryTab, ExamHistorySkeleton } from '../components/ExamHistoryTab';
import { ProfileSkeleton, OverviewSkeleton, BadgesSkeleton, RequestsSkeleton, SettingsSkeleton } from '../components/ProfileSkeletons';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileOverviewTab } from '../components/ProfileOverviewTab';
import { ProfileBadgesTab } from '../components/ProfileBadgesTab';


export const ProfilePage = () => {
    const { id: paramId } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'overview' | 'badges' | 'exam-history' | 'my-requests' | 'settings') || 'overview';

    // CSS tab indicator
    const tabContainerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    const updateIndicator = useCallback(() => {
        const container = tabContainerRef.current;
        const activeBtn = tabRefs.current[activeTab];
        if (container && activeBtn) {
            const containerRect = container.getBoundingClientRect();
            const btnRect = activeBtn.getBoundingClientRect();
            setIndicatorStyle({
                left: btnRect.left - containerRect.left + container.scrollLeft,
                width: btnRect.width,
            });
        }
    }, [activeTab]);

    useLayoutEffect(() => {
        updateIndicator();
    }, [updateIndicator]);

    useEffect(() => {
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [updateIndicator]);

    const handleTabChange = (tabId: string) => {
        if (activeTab === tabId) return;
        startTabTransition(() => {
            setSearchParams(prev => { prev.set('tab', tabId); return prev; }, { replace: true, preventScrollReset: true });
        });
    };

    const { user, refreshUserProfile } = useAuth();
    const targetUserId = paramId ? Number(paramId) : user?.id;
    const isOwnProfile = user?.id === targetUserId;

    const [profileUser, setProfileUser] = useState<UserProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [badges, setBadges] = useState<BadgeItem[]>([]);
    const [isBadgeRequestModalOpen, setIsBadgeRequestModalOpen] = useState(false);

    // Badge requests hook
    const { requestBadge, isSubmitting: isBadgeSubmitting } = useBadgeRequests();

    // Badges that user doesn't have yet (for request modal)
    const availableBadgesForRequest = useMemo(() =>
        badges.filter(b => !b.isEarned),
        [badges]
    );


    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        bio: ''
    });

    const fetchedUserIdRef = useRef<number | null>(null);

    // Background state (kept here since it's loaded from API)
    const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);


    useEffect(() => {
        const loadData = async () => {
            if (!targetUserId) return;
            if (fetchedUserIdRef.current === targetUserId) return;

            fetchedUserIdRef.current = targetUserId;
            setIsLoading(true);

            try {
                const profileData = await authRepository.getProfile(targetUserId);
                let allBadges: BadgeItem[] = [];

                if (isOwnProfile) {
                    const allSystemBadges = await authRepository.getAllBadges();
                    const earnedBadgeMap = new Map(profileData.badges.map(b => [b.id, b]));
                    allBadges = allSystemBadges.map(sysBadge => {
                        const earned = earnedBadgeMap.get(sysBadge.id);
                        return earned ? earned : { ...sysBadge, isEarned: false, isSelected: false };
                    });
                } else {
                    allBadges = profileData.badges;
                }

                setProfileUser(profileData);
                setFormData({
                    fullName: profileData.fullName || '',
                    phone: profileData.phone || '',
                    bio: profileData.bio || '',
                });
                setBackgroundUrl(profileData.backgroundUrl || null);

                allBadges.sort((a, b) => {
                    if (a.isEarned !== b.isEarned) return a.isEarned ? -1 : 1;
                    return b.level - a.level;
                });

                setBadges(allBadges);

            } catch (error) {
                showToast(i18n.t('features:profile.loadFailed'), 'error');
                fetchedUserIdRef.current = null;
            } finally {
                setTimeout(() => setIsLoading(false), 300);
            }
        };
        loadData();
        return () => { if (targetUserId !== fetchedUserIdRef.current) fetchedUserIdRef.current = null; };
    }, [targetUserId, isOwnProfile]);

    const currentUser = profileUser;

    const isStudent = currentUser?.role.startsWith('STUDENT');
    const isInternalStudent = currentUser?.role === 'STUDENT_INTERNAL';
    const isLecturerOrAdmin = currentUser?.role === 'LECTURER' || currentUser?.role === 'ADMIN';



    const handleSaveProfile = async () => {
        if (!isOwnProfile) return;
        if (!isEditing) { setIsEditing(true); return; }

        // Validate
        if (!formData.fullName.trim()) {
            showToast(i18n.t('features:profile.nameRequired'), 'error');
            return;
        }
        if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
            showToast(i18n.t('features:profile.invalidPhone'), 'error');
            return;
        }

        try {
            setIsSaving(true);
            setProfileUser((prev) => prev ? { ...prev, ...formData } : prev);
            await authRepository.updateProfile(formData);

            // Sync fullName to auth context
            if (refreshUserProfile) {
                await refreshUserProfile();
            }

            setIsEditing(false);
            showToast(i18n.t('features:profile.saveSuccess'), 'success');
        } catch {
            showToast(i18n.t('features:profile.saveFailed'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            fullName: profileUser?.fullName || '',
            phone: profileUser?.phone || '',
            bio: profileUser?.bio || '',
        });
    };

    const handleToggleBadge = async (id: number) => {
        if (!isOwnProfile) return;
        const newBadges = badges.map(b => b.id === id ? { ...b, isSelected: !b.isSelected } : b);
        const target = newBadges.find(b => b.id === id);
        if (!target?.isEarned) return;
        if (newBadges.filter(b => b.isSelected).length > 3 && target.isSelected) {
            showToast(i18n.t('features:profile.maxBadges'), 'error');
            return;
        }
        setBadges(newBadges);
        try {
            await authRepository.toggleBadge(id);

            // Update user context and localStorage for Header sync
            if (refreshUserProfile) {
                await refreshUserProfile();
            }
        }
        catch { setBadges(badges); showToast(i18n.t('features:profile.connectionError'), 'error'); }
    };

    const selectedBadges = useMemo(() => badges.filter(b => b.isSelected && b.isEarned), [badges]);

    const joinedDate = useMemo(() => {
        const d = new Date(currentUser?.joinedAt || currentUser?.createdAt || Date.now());
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }, [currentUser]);

    const getRoleConfig = (role?: string) => {
        if (role === 'ADMIN') return { bg: 'bg-rose-100 text-rose-700', label: i18n.t('features:profile.roles.admin') };
        if (role === 'LECTURER') return { bg: 'bg-blue-100 text-blue-700', label: i18n.t('features:profile.roles.lecturer') };
        return { bg: 'bg-slate-100 text-slate-500', label: i18n.t('features:profile.roles.student') };
    };
    const roleConf = getRoleConfig(currentUser?.role);




    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">
            {isLoading ? <ProfileSkeleton /> : (
                <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
                    <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                        {/* --- HEADER --- */}
                        <ProfileHeader
                            currentUser={currentUser}
                            isOwnProfile={isOwnProfile}
                            isStudent={!!isStudent}
                            badges={badges}
                            backgroundUrl={backgroundUrl}
                            roleConf={roleConf}
                            joinedDate={joinedDate}
                            refreshUserProfile={refreshUserProfile}
                            onProfileUserUpdate={setProfileUser}
                            onBackgroundUrlChange={setBackgroundUrl}
                        />

                        {/* --- TABS --- */}
                        <div ref={tabContainerRef} className="relative flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-4 sm:gap-8 px-2 overflow-x-auto scrollbar-hide">
                            <span
                                className="absolute bottom-0 h-0.5 bg-humg-blue rounded-full transition-all duration-300 ease-out"
                                style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
                            />
                            <button ref={el => { tabRefs.current['overview'] = el; }} onClick={() => handleTabChange('overview')} className={`relative pb-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'text-humg-blue' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                                <span className="flex items-center gap-2"><User size={18} /> {i18n.t('features:profile.tabs.overview')}</span>
                            </button>

                            {(isStudent || user?.role === 'ADMIN') && (
                                <button ref={el => { tabRefs.current['badges'] = el; }} onClick={() => handleTabChange('badges')} className={`relative pb-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'badges' ? 'text-humg-blue' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                                    <span className="flex items-center gap-2"><Award size={18} /> <span className="hidden sm:inline">{i18n.t('features:profile.tabs.badgesFull')}</span><span className="sm:hidden">{i18n.t('features:profile.tabs.badges')}</span></span>
                                </button>
                            )}

                            {(isOwnProfile || profileUser?.privacySettings?.showExamHistory !== false) && (
                                <button ref={el => { tabRefs.current['exam-history'] = el; }} onClick={() => handleTabChange('exam-history')} className={`relative pb-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'exam-history' ? 'text-humg-blue' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                                    <span className="flex items-center gap-2"><History size={18} /> <span className="hidden sm:inline">{i18n.t('features:profile.tabs.examHistory')}</span><span className="sm:hidden">{i18n.t('features:profile.tabs.examHistoryShort')}</span></span>
                                </button>
                            )}

                            {isStudent && isOwnProfile && (
                                <button ref={el => { tabRefs.current['my-requests'] = el; }} onClick={() => handleTabChange('my-requests')} className={`relative pb-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'my-requests' ? 'text-humg-blue' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                                    <span className="flex items-center gap-2"><Clock size={18} /> <span className="hidden sm:inline">{i18n.t('features:profile.tabs.myRequests')}</span><span className="sm:hidden">{i18n.t('features:profile.tabs.myRequestsShort')}</span></span>
                                </button>
                            )}

                            {isOwnProfile && (
                                <button ref={el => { tabRefs.current['settings'] = el; }} onClick={() => handleTabChange('settings')} className={`relative pb-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'text-humg-blue' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                                    <span className="flex items-center gap-2"><Settings size={18} /> {i18n.t('features:profile.tabs.settings')}</span>
                                </button>
                            )}
                        </div>

                        {/* --- CONTENT --- */}
                        <div className="min-h-[500px]">
                            {isLoading ? (
                                <div className="animate-in fade-in duration-200">
                                    {activeTab === 'overview' && <OverviewSkeleton />}
                                    {activeTab === 'badges' && <BadgesSkeleton />}
                                    {activeTab === 'my-requests' && <RequestsSkeleton />}
                                    {activeTab === 'settings' && <SettingsSkeleton />}
                                    {activeTab === 'exam-history' && <ExamHistorySkeleton />}
                                </div>
                            ) : (
                                <AnimatedTabContent activeKey={activeTab}>
                                    {activeTab === 'overview' && (
                                        <ProfileOverviewTab
                                            currentUser={currentUser}
                                            formData={formData}
                                            isEditing={isEditing}
                                            isSaving={isSaving}
                                            isOwnProfile={isOwnProfile}
                                            isStudent={!!isStudent}
                                            isInternalStudent={!!isInternalStudent}
                                            isLecturerOrAdmin={!!isLecturerOrAdmin}
                                            joinedDate={joinedDate}
                                            onFormDataChange={setFormData}
                                            onSaveProfile={handleSaveProfile}
                                            onCancelEdit={handleCancelEdit}
                                        />
                                    )}

                                    {activeTab === 'badges' && (isStudent || user?.role === 'ADMIN') && (
                                        <ProfileBadgesTab
                                            badges={badges}
                                            selectedBadges={selectedBadges}
                                            isOwnProfile={isOwnProfile}
                                            availableBadgesForRequest={availableBadgesForRequest}
                                            onToggleBadge={handleToggleBadge}
                                            onOpenRequestModal={() => setIsBadgeRequestModalOpen(true)}
                                        />
                                    )}

                                    {activeTab === 'my-requests' && isStudent && isOwnProfile && (
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <MyBadgeRequestsTab />
                                        </div>
                                    )}

                                    {activeTab === 'exam-history' && targetUserId && (
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <ExamHistoryTab userId={targetUserId} />
                                        </div>
                                    )}

                                    {activeTab === 'settings' && isOwnProfile && (
                                        <SettingsTab />
                                    )}
                                </AnimatedTabContent>
                            )}
                        </div>
                    </div>

                    {/* Badge Request Modal */}
                    <BadgeRequestModal
                        isOpen={isBadgeRequestModalOpen}
                        onClose={() => setIsBadgeRequestModalOpen(false)}
                        availableBadges={availableBadgesForRequest}
                        onSubmit={async (badgeId, proofImage) => {
                            const result = await requestBadge(badgeId, proofImage);
                            return !!result;
                        }}
                        isSubmitting={isBadgeSubmitting}
                    />
                </div>
            )}
        </div>
    );
};