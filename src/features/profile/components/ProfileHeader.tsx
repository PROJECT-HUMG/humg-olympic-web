import { useRef, useState, useEffect, type ChangeEvent, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import {
    Camera, Save, Loader2, ImagePlus, X, ZoomIn,
    Calendar, School,
} from 'lucide-react';
import { VerifiedBadge, StudentBadges } from '@/features/badges/components/VerifiedBadge';
import { RankedUsername } from '@/utils/rankingHelpers';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';
import { authRepository } from '@/features/auth/api';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import type { BadgeItem, UserProfileResponse } from '@/features/auth/types/auth.types';

interface ProfileHeaderProps {
    currentUser: UserProfileResponse | null;
    isOwnProfile: boolean;
    isStudent: boolean;
    badges: BadgeItem[];
    backgroundUrl: string | null;
    roleConf: { bg: string; label: string };
    joinedDate: string;
    refreshUserProfile?: () => Promise<void>;
    onProfileUserUpdate: (updater: (prev: UserProfileResponse | null) => UserProfileResponse | null) => void;
    onBackgroundUrlChange: (url: string) => void;
}

export const ProfileHeader = ({
    currentUser, isOwnProfile, isStudent, badges,
    backgroundUrl, roleConf, joinedDate,
    refreshUserProfile, onProfileUserUpdate, onBackgroundUrlChange,
}: ProfileHeaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);
    const avatarActionsRef = useRef<HTMLDivElement>(null);

    const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
    const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isAvatarLightboxOpen, setIsAvatarLightboxOpen] = useState(false);
    const [showAvatarActions, setShowAvatarActions] = useState(false);

    const [pendingBgFile, setPendingBgFile] = useState<File | null>(null);
    const [pendingBgPreview, setPendingBgPreview] = useState<string | null>(null);
    const [isUploadingBg, setIsUploadingBg] = useState(false);

    // Close avatar actions on click outside
    useEffect(() => {
        if (!showAvatarActions) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (avatarActionsRef.current && !avatarActionsRef.current.contains(e.target as Node)) {
                setShowAvatarActions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAvatarActions]);

    const handleAvatarClick = () => {
        if (isOwnProfile) fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!isOwnProfile) return;
        const file = event.target.files?.[0];
        if (!file) return;
        setPendingAvatarFile(file);
        setPendingAvatarPreview(URL.createObjectURL(file));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const confirmAvatarUpload = async () => {
        if (!pendingAvatarFile || !isOwnProfile) return;
        try {
            setIsUploadingAvatar(true);
            showToast(i18n.t('features:profile.uploadingAvatar'), 'info');
            const newUrl = await authRepository.updateAvatar(pendingAvatarFile);
            onProfileUserUpdate(prev => prev ? { ...prev, avatarUrl: newUrl } : prev);
            if (refreshUserProfile) await refreshUserProfile();
            showToast(i18n.t('features:profile.avatarSuccess'), 'success');
        } catch {
            showToast(i18n.t('features:profile.avatarFailed'), 'error');
        } finally {
            setIsUploadingAvatar(false);
            cancelAvatarUpload();
        }
    };

    const cancelAvatarUpload = () => {
        if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
        setPendingAvatarFile(null);
        setPendingAvatarPreview(null);
    };

    const handleBgFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!isOwnProfile) return;
        const file = event.target.files?.[0];
        if (!file) return;
        setPendingBgFile(file);
        setPendingBgPreview(URL.createObjectURL(file));
        if (bgInputRef.current) bgInputRef.current.value = '';
    };

    const confirmBgUpload = async () => {
        if (!pendingBgFile || !isOwnProfile) return;
        try {
            setIsUploadingBg(true);
            showToast(i18n.t('features:profile.uploadingCover'), 'info');
            const newUrl = await authRepository.updateBackground(pendingBgFile);
            onBackgroundUrlChange(newUrl);
            showToast(i18n.t('features:profile.coverSuccess'), 'success');
        } catch {
            showToast(i18n.t('features:profile.coverFailed'), 'error');
        } finally {
            setIsUploadingBg(false);
            cancelBgUpload();
        }
    };

    const cancelBgUpload = () => {
        if (pendingBgPreview) URL.revokeObjectURL(pendingBgPreview);
        setPendingBgFile(null);
        setPendingBgPreview(null);
    };

    return (
        <>
            {isOwnProfile && <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />}
            {isOwnProfile && <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={handleBgFileChange} />}

            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
                <div className="relative h-40 md:h-52 w-full bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
                    {(pendingBgPreview || backgroundUrl) && (
                        <img src={pendingBgPreview || backgroundUrl!} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    {!(pendingBgPreview || backgroundUrl) && (
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
                    )}

                    {isOwnProfile && !pendingBgPreview && (
                        <button
                            onClick={() => bgInputRef.current?.click()}
                            className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white text-xs font-medium hover:bg-black/60 transition-colors opacity-0 hover:opacity-100"
                        >
                            <ImagePlus size={14} /> {i18n.t('features:profile.header.changeCover')}
                        </button>
                    )}
                    {pendingBgPreview && (
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
                            <button onClick={confirmBgUpload} disabled={isUploadingBg}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg hover:bg-emerald-600 transition-colors disabled:opacity-50">
                                {isUploadingBg ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                {i18n.t('features:profile.header.saveCover')}
                            </button>
                            <button onClick={cancelBgUpload} disabled={isUploadingBg}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-slate-700 text-xs font-semibold rounded-lg shadow-lg hover:bg-white transition-colors disabled:opacity-50">
                                <X size={12} /> {i18n.t('features:profile.header.cancel')}
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-4 sm:px-6 md:px-8 pb-6 md:pb-8">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        {/* Avatar */}
                        <div className="-mt-12 sm:-mt-16 relative mx-auto md:mx-0 group" ref={avatarActionsRef}>
                            <div
                                className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 sm:border-[6px] border-white dark:border-slate-900 shadow-md bg-white overflow-hidden relative cursor-pointer"
                                onClick={() => { if (pendingAvatarPreview) return; setShowAvatarActions(prev => !prev); }}
                            >
                                <img src={pendingAvatarPreview || getAvatarUrl(currentUser?.avatarUrl, currentUser?.fullName || 'User')} className="w-full h-full object-cover" alt="Avatar" onError={(e) => handleAvatarError(e, currentUser?.fullName || 'User')} />
                                {!pendingAvatarPreview && (
                                    <div className={`absolute inset-0 rounded-full bg-black/50 flex items-center justify-center gap-3 transition-opacity duration-200
                                        ${showAvatarActions ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'}
                                    `}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowAvatarActions(false); setIsAvatarLightboxOpen(true); }}
                                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 active:scale-90 transition-colors"
                                            title={i18n.t('features:profile.header.viewPhoto')}
                                        >
                                            <ZoomIn size={18} />
                                        </button>
                                        {isOwnProfile && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowAvatarActions(false); handleAvatarClick(); }}
                                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 active:scale-90 transition-colors"
                                                title={i18n.t('features:profile.header.changePhoto')}
                                            >
                                                <Camera size={18} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {pendingAvatarPreview && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                                    <button onClick={(e) => { e.stopPropagation(); confirmAvatarUpload(); }} disabled={isUploadingAvatar}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg hover:bg-emerald-600 transition-colors disabled:opacity-50">
                                        {isUploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                        {i18n.t('features:profile.header.save')}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); cancelAvatarUpload(); }} disabled={isUploadingAvatar}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                                        {i18n.t('features:profile.header.cancel')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 pt-1 md:pt-2 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                                <div className="w-full md:w-auto">
                                    <div className="flex items-center justify-center md:justify-start gap-1.5 sm:gap-2 flex-wrap mb-1.5 sm:mb-2">
                                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                                            {(isStudent || (currentUser?.role === 'ADMIN' && currentUser.xpPoints)) ? (
                                                <RankedUsername name={currentUser?.fullName || i18n.t('features:profile.header.defaultUser')} points={currentUser?.xpPoints || 0} className="leading-tight" />
                                            ) : (
                                                <span className="text-slate-900 dark:text-white">{currentUser?.fullName}</span>
                                            )}
                                        </h1>
                                        <VerifiedBadge role={currentUser?.role || ''} size={18} />
                                        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-300 dark:border-slate-700">
                                            <StudentBadges badges={badges} size="md" />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-slate-500 mb-4 sm:mb-6">
                                        <span className={`px-2 py-0.5 rounded border ${roleConf.bg} border-transparent dark:bg-opacity-20`}>{roleConf.label}</span>
                                        {currentUser?.universityName && (
                                            <span className="flex items-center gap-1"><School size={14} /> {currentUser.universityName}</span>
                                        )}
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {joinedDate}</span>
                                    </div>
                                </div>
                            </div>

                            {isStudent && (
                                <div className="flex justify-center md:justify-start gap-6 sm:gap-8 md:gap-12 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="text-center md:text-left">
                                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{currentUser?.xpPoints || 0}</p>
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">{i18n.t('features:profile.header.xpPoints')}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{badges.filter(b => b.isEarned).length}</p>
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">{i18n.t('features:profile.header.badges')}</p>
                                    </div>
                                    <Link to="/rankings" className="text-center md:text-left group cursor-pointer">
                                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-humg-blue dark:group-hover:text-blue-400 transition-colors">#{currentUser?.ranking || '--'}</p>
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide group-hover:text-humg-blue/70 transition-colors">{i18n.t('features:profile.header.ranking')}</p>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Avatar Lightbox */}
            {isAvatarLightboxOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up"
                    style={{ animationDuration: '0.2s' }}
                    onClick={() => setIsAvatarLightboxOpen(false)}
                    onKeyDown={(e) => e.key === 'Escape' && setIsAvatarLightboxOpen(false)}
                    tabIndex={0}
                    role="dialog"
                >
                    <button onClick={() => setIsAvatarLightboxOpen(false)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
                        <X size={20} />
                    </button>
                    <img
                        src={getAvatarUrl(currentUser?.avatarUrl, currentUser?.fullName || 'Avatar')}
                        alt={currentUser?.fullName || 'Avatar'}
                        className="max-w-[90vw] max-h-[85vh] sm:max-w-[600px] sm:max-h-[600px] rounded-3xl object-contain shadow-2xl animate-fade-in-up"
                        style={{ animationDuration: '0.25s', animationDelay: '0.05s' }}
                        onClick={(e) => e.stopPropagation()}
                        onError={(e) => handleAvatarError(e, currentUser?.fullName || 'Avatar')}
                    />
                </div>
            )}
        </>
    );
};
