import { AwardType, MemberRole, TeamMember } from '@/features/team/types/team.types';
import { Award, Star, Shield, Trophy, User } from 'lucide-react';
import i18n from '@/i18n';

export const getRoleBadge = (role: MemberRole) => {
    switch (role) {
        case 'HEAD_COACH':
            return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">{i18n.t('common:teamRole.headCoach')}</span>;
        case 'DEPUTY_COACH':
            return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">{i18n.t('common:teamRole.deputyCoach')}</span>;
        case 'COACH':
            return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">{i18n.t('common:teamRole.coach')}</span>;
        case 'CAPTAIN':
            return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1"><Shield size={10} /> {i18n.t('common:teamRole.captain')}</span>;
        default:
            return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">{i18n.t('common:teamRole.member')}</span>;
    }
};

export const getAwardLabel = (award?: AwardType) => {
    switch (award) {
        case 'FIRST':
            return <div className="flex items-center gap-1 text-yellow-600 font-bold text-sm"><Trophy size={16} /> {i18n.t('common:award.first')}</div>;
        case 'SECOND':
            return <div className="flex items-center gap-1 text-slate-400 font-bold text-sm"><Award size={16} /> {i18n.t('common:award.second')}</div>;
        case 'THIRD':
            return <div className="flex items-center gap-1 text-orange-600 font-bold text-sm"><Award size={16} /> {i18n.t('common:award.third')}</div>;
        case 'CONSOLATION':
            return <div className="flex items-center gap-1 text-green-600 font-bold text-sm"><Star size={16} /> {i18n.t('common:award.consolation')}</div>;
        case 'PARTICIPATION':
        default:
            return <div className="text-slate-400 text-sm italic flex items-center gap-1"><User size={14} /> {i18n.t('common:award.participation')}</div>;
    }
};

export const sortMembersByAward = (members: TeamMember[]) => {
    const awardOrder: Record<string, number> = { 'FIRST': 5, 'SECOND': 4, 'THIRD': 3, 'CONSOLATION': 2, 'PARTICIPATION': 1 };
    return [...members].sort((a, b) => {
        const scoreA = awardOrder[a.award || 'PARTICIPATION'] || 0;
        const scoreB = awardOrder[b.award || 'PARTICIPATION'] || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.name.localeCompare(b.name);
    });
};