import {
    User, Mail, Phone, Edit3, Save, X,
    GraduationCap, BookOpen, Award,
    Users, Loader2,
} from 'lucide-react';
import { InfoField } from './InfoField';
import { ProfileStatsCard } from './ProfileStatsCard';
import type { UserProfileResponse } from '@/features/auth/types/auth.types';
import i18n from '@/i18n';

interface ProfileOverviewTabProps {
    currentUser: UserProfileResponse | null;
    formData: { fullName: string; phone: string; bio: string };
    isEditing: boolean;
    isSaving: boolean;
    isOwnProfile: boolean;
    isStudent: boolean;
    isInternalStudent: boolean;
    isLecturerOrAdmin: boolean;
    joinedDate: string;
    onFormDataChange: (data: { fullName: string; phone: string; bio: string }) => void;
    onSaveProfile: () => void;
    onCancelEdit: () => void;
}

export const ProfileOverviewTab = ({
    currentUser, formData, isEditing, isSaving,
    isOwnProfile, isInternalStudent, isLecturerOrAdmin,
    joinedDate, onFormDataChange, onSaveProfile, onCancelEdit,
}: ProfileOverviewTabProps) => (
    <div className="space-y-8">
        {currentUser && <ProfileStatsCard user={currentUser} joinedDate={joinedDate} />}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <User size={20} className="text-humg-blue" /> {i18n.t('features:profile.overview.detailInfo')}
                </h3>

                {isOwnProfile && (
                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <button
                                onClick={onCancelEdit}
                                className="px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition shadow-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                                <X size={14} /> {i18n.t('features:profile.overview.cancelEdit')}
                            </button>
                        )}
                        <button
                            onClick={onSaveProfile}
                            className="px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition shadow-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                            {isSaving ? i18n.t('features:profile.overview.saving') : isEditing ? i18n.t('features:profile.overview.saveChanges') : i18n.t('features:profile.overview.editProfile')}
                        </button>
                    </div>
                )}
            </div>

            {/* Editable full name */}
            {isOwnProfile && isEditing && (
                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">{i18n.t('features:profile.overview.fullName')}</label>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => onFormDataChange({ ...formData, fullName: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-humg-blue outline-none transition-colors text-slate-900 dark:text-white"
                        placeholder={i18n.t('features:profile.overview.fullNamePlaceholder')}
                    />
                </div>
            )}

            {/* Bio Section */}
            <div className="mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">{i18n.t('features:profile.overview.bio')}</label>
                {isEditing ? (
                    <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-humg-blue outline-none resize-none h-32 transition-colors cursor-text text-slate-700 dark:text-slate-200"
                        value={formData.bio} onChange={(e) => onFormDataChange({ ...formData, bio: e.target.value })}
                        placeholder={i18n.t('features:profile.overview.bioPlaceholder')}
                        autoFocus
                    />
                ) : (
                    <div className={`bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl text-sm italic min-h-[80px] leading-relaxed flex items-center
                        ${!formData.bio ? 'text-slate-400 justify-center' : 'text-slate-600 dark:text-slate-300'}`}>
                        {formData.bio || (isOwnProfile ? i18n.t('features:profile.overview.bioEmptyOwn') : i18n.t('features:profile.overview.bioEmptyOther'))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {(currentUser?.role !== 'ADMIN' || currentUser?.universityName) && (
                    <InfoField icon={GraduationCap} label={i18n.t('features:profile.overview.university')} value={currentUser?.universityName || i18n.t('features:profile.overview.notUpdated')} isEditing={false} />
                )}

                {(isInternalStudent || (currentUser?.role === 'ADMIN' && (currentUser?.facultyName || currentUser?.faculty))) && (
                    <InfoField icon={BookOpen} label={i18n.t('features:profile.overview.faculty')} value={currentUser?.facultyName || currentUser?.faculty || i18n.t('features:profile.overview.notUpdated')} isEditing={false} />
                )}

                {(isInternalStudent || (currentUser?.role === 'ADMIN' && currentUser?.className)) && (
                    <InfoField icon={Users} label={i18n.t('features:profile.overview.class')} value={currentUser?.className || i18n.t('features:profile.overview.notUpdated')} isEditing={false} />
                )}

                {(currentUser?.role === 'LECTURER' || (currentUser?.role === 'ADMIN' && currentUser?.degree)) && (
                    <InfoField icon={Award} label={i18n.t('features:profile.overview.degree')} value={currentUser?.degree ? currentUser.degree : i18n.t('features:profile.overview.notUpdated')} isEditing={false} />
                )}

                {(isOwnProfile || isLecturerOrAdmin) && (
                    <>
                        {(currentUser?.role !== 'ADMIN' || currentUser?.email) && (
                            <InfoField icon={Mail} label="Email" value={currentUser?.email || ""} isEditing={false} />
                        )}
                        {(currentUser?.role !== 'ADMIN' || formData.phone) && (
                            <InfoField icon={Phone} label={i18n.t('features:profile.overview.phone')} value={formData.phone} isEditing={isEditing} onChange={(v) => onFormDataChange({ ...formData, phone: v })} />
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
);
