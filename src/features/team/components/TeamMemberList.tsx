import { useCallback, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { TeamMember, TeamStatus } from '@/features/team/types/team.types';
import { getRoleBadge, sortMembersByAward } from '@/utils/teamHelpers';
import { UserPlus, Trash2, GraduationCap, Shield, Users, Award } from 'lucide-react';
import { VerifiedBadge, StudentBadges } from '@/features/badges/components/VerifiedBadge';
import { getUserNameColor } from '@/utils/rankingHelpers';
import { useUserPreview } from '@/hooks/useUserPreview';
import i18n from '@/i18n';

import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';

interface TeamMemberListProps {
    members: TeamMember[];
    currentUserId: number;
    teamStatus: TeamStatus;
    canManage: boolean;
    onAddLecturer?: () => void;
    onAddStudent?: () => void;
    onRemoveMember?: (userId: number) => void;
}

interface MemberCardProps {
    member: TeamMember;
    isMe: boolean;
    canManage: boolean;
    onRemove?: (userId: number) => void;
    onHoverStart: (member: TeamMember, e: MouseEvent) => void;
    onHoverEnd: () => void;
}

const LecturerCard = ({ member, isMe, canManage, onRemove, onHoverStart, onHoverEnd }: MemberCardProps) => (
    <Link
        to={`/profile/${member.userId}`}
        className="group relative flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 block"
        onMouseEnter={(e) => onHoverStart(member, e)}
        onMouseLeave={onHoverEnd}
    >
        <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm group-hover:scale-105 transition-transform duration-300">
                {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                    <img src="/assets/logo.png" alt="HUMG Logo" className="w-8 h-8 object-contain opacity-60" />
                )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <VerifiedBadge role={member.role} size={14} />
            </div>
        </div>

        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-bold text-base group-hover:text-blue-600 transition-colors truncate ${getUserNameColor(member.xpPoints)}`}>{member.name}</h4>
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full inline-block">{getRoleBadge(member.role)}</p>
        </div>

        {canManage && !isMe && (
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove?.(member.userId); }}
                className="opacity-0 group-hover:opacity-100 p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors shrink-0 absolute right-4 top-1/2 -translate-y-1/2 shadow-sm"
                title={i18n.t('features:team.members.removeTooltip')}
            >
                <Trash2 size={16} />
            </button>
        )}
    </Link>
);

interface StudentCardProps extends MemberCardProps {
    idx: number;
    teamStatus: TeamStatus;
}

const StudentCard = ({ member, idx, isMe, canManage, teamStatus, onRemove, onHoverStart, onHoverEnd }: StudentCardProps) => (
    <div
        className={`group relative p-5 rounded-3xl border transition-colors duration-300 animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-300 ${isMe
            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
            : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50 hover:-translate-y-1'
            }`}
        onMouseEnter={(e) => onHoverStart(member, e)}
        onMouseLeave={onHoverEnd}
    >
        {/* Delete button */}
        {canManage && !isMe && (
            <button
                onClick={(e) => { e.stopPropagation(); onRemove?.(member.userId); }}
                className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 p-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-zinc-400 hover:text-red-500 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700 transition-colors hover:scale-110"
            >
                <Trash2 size={14} />
            </button>
        )}

        {/* Avatar */}
        <div className="flex justify-center mb-4 relative">
            <div className={`w-20 h-20 rounded-full p-1 bg-white dark:bg-zinc-900 shadow-md ring-1 ring-zinc-100 dark:ring-zinc-800 group-hover:scale-105 transition-transform duration-300 ${member.role === 'CAPTAIN' ? 'ring-2 ring-orange-400/50 dark:ring-orange-500/30' : ''}`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                        <img src="/assets/logo.png" alt="HUMG Logo" className="w-10 h-10 object-contain opacity-60" />
                    )}
                </div>
            </div>

            {teamStatus === 'FINISHED' && idx < 3 && (
                <div className={`absolute -top-2 right-1/2 translate-x-8 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white dark:border-zinc-900 z-10 ${idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500' : idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' : 'bg-gradient-to-br from-orange-300 to-orange-500'
                    }`}>
                    {idx === 0 ? <Award size={14} /> : `#${idx + 1}`}
                </div>
            )}

            {member.role === 'CAPTAIN' && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800 shadow-sm whitespace-nowrap z-10">
                    {i18n.t('features:team.members.captain')}
                </div>
            )}
        </div>

        {/* Info */}
        <div className="text-center">
            <Link to={`/profile/${member.userId}`} className={`block font-bold text-lg mb-1 hover:text-blue-600 transition-colors truncate px-2 ${getUserNameColor(member.xpPoints)}`}>
                {member.name}
            </Link>

            <div className="flex justify-center mb-3 min-h-[20px]">
                <StudentBadges badges={member.badges} maxDisplay={3} />
            </div>

            {/* Score footer */}
            {teamStatus === 'FINISHED' && (
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                    <span className="text-zinc-400 uppercase tracking-wider font-semibold">{i18n.t('features:team.members.score')}</span>
                    <span className="font-mono font-bold text-lg text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">{member.score}</span>
                </div>
            )}
        </div>
    </div>
);


export const TeamMemberList = ({
    members, currentUserId, teamStatus, canManage, onAddLecturer, onAddStudent, onRemoveMember
}: TeamMemberListProps) => {

    const {
        isVisible: showPreview, position: previewPosition, previewItem: previewMember,
        handleHoverStart, handleHoverEnd, handlePreviewMouseEnter, handlePreviewMouseLeave
    } = useUserPreview<TeamMember>();

    const handleUserHoverStart = useCallback((member: TeamMember, e: MouseEvent) => handleHoverStart(member, e), [handleHoverStart]);
    const handleUserHoverEnd = useCallback(() => handleHoverEnd(), [handleHoverEnd]);

    const lecturers = members.filter(m => ['HEAD_COACH', 'DEPUTY_COACH', 'COACH'].includes(m.role));
    let students = members.filter(m => ['CAPTAIN', 'MEMBER'].includes(m.role));

    if (teamStatus === 'FINISHED') {
        students = sortMembersByAward(students);
    } else {
        students.sort((a, b) => (a.role === 'CAPTAIN' ? -1 : 1));
    }

    return (
        <div className="space-y-10 pb-10">
            {/* LECTURER SECTION */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end mb-5">
                    <div>
                        <h3 className="text-sm font-bold text-zinc-800 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                            <span className="p-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
                                <Shield size={16} />
                            </span>
                            {i18n.t('features:team.members.lecturers', { count: lecturers.length })}
                        </h3>
                    </div>

                    {canManage && teamStatus === 'ACTIVE' && (
                        <button onClick={onAddLecturer} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800">
                            <UserPlus size={16} /> {i18n.t('features:team.members.inviteLecturer')}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lecturers.length > 0 ? (
                        lecturers.map(m => (
                            <LecturerCard
                                key={m.userId} member={m} isMe={m.userId === currentUserId} canManage={canManage} onRemove={onRemoveMember}
                                onHoverStart={handleUserHoverStart} onHoverEnd={handleUserHoverEnd}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-10 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 text-sm">
                            {i18n.t('features:team.members.noLecturers')}
                        </div>
                    )}
                </div>
            </section>

            {/* STUDENTS SECTION */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="flex justify-between items-center mb-5">
                    <div>
                        <h3 className="text-sm font-bold text-zinc-800 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                            <span className="p-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
                                <GraduationCap size={16} />
                            </span>
                            {i18n.t('features:team.members.students', { count: students.length })}
                        </h3>
                    </div>

                    {canManage && teamStatus === 'ACTIVE' && (
                        <button onClick={onAddStudent} className="px-5 py-2.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-colors flex items-center gap-2">
                            <UserPlus size={16} /> {i18n.t('features:team.members.addStudent')}
                        </button>
                    )}
                </div>

                {students.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {students.map((m, idx) => (
                            <StudentCard
                                key={m.userId} member={m} idx={idx} isMe={m.userId === currentUserId}
                                canManage={canManage} teamStatus={teamStatus}
                                onRemove={onRemoveMember} onHoverStart={handleUserHoverStart} onHoverEnd={handleUserHoverEnd}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 group">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300 group-hover:scale-110 transition-transform duration-300">
                            <Users size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-zinc-500 font-medium text-sm mb-4">{i18n.t('features:team.members.noMembers')}</p>
                        {canManage && (
                            <button onClick={onAddStudent} className="px-6 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold hover:shadow-md transition-colors text-zinc-700 dark:text-zinc-200">
                                {i18n.t('features:team.members.addStudentNow')}
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* PREVIEW CARD */}
            {previewMember && (
                <UserPreviewCard
                    author={{ id: previewMember.userId, name: previewMember.name, avatar: previewMember.avatar || '', role: previewMember.role, badges: previewMember.badges, xpPoints: previewMember.xpPoints }}
                    isVisible={showPreview} position={previewPosition}
                    onMouseEnter={handlePreviewMouseEnter} onMouseLeave={handlePreviewMouseLeave}
                />
            )}
        </div>
    );
};
