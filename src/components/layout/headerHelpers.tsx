import { MessageSquare, Trophy, Map, Bell, Users, Award, Files, FileText, Settings } from 'lucide-react';
import { NotificationType } from '@/features/notifications/types/notification.types';
import i18n from '@/i18n';

export const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'MESSAGE': return <MessageSquare size={16} className="text-blue-500" />;
        case 'RESOURCE': return <Files size={16} className="text-blue-600" />;
        case 'COMPETITION': return <Trophy size={16} className="text-yellow-600" />;
        case 'ROADMAP': return <Map size={16} className="text-purple-600" />;
        case 'NEWS': return <Bell size={16} className="text-rose-600" />;
        case 'TEAM': return <Users size={16} className="text-orange-600" />;
        case 'BADGE': return <Award size={16} className="text-yellow-500" />;
        case 'FORUM': return <MessageSquare size={16} className="text-green-600" />;
        case 'EXAM': return <FileText size={16} className="text-emerald-500" />;
        case 'SYSTEM': return <Settings size={16} className="text-slate-500" />;
        default: return <Bell size={16} className="text-slate-500" />;
    }
};

export const getRoleLabel = (role?: string) => {
    switch (role) {
        case 'ADMIN': return i18n.t('common:userRole.admin');
        case 'LECTURER': return i18n.t('common:userRole.lecturer');
        case 'HEAD_COACH': return i18n.t('common:userRole.headCoach');
        case 'DEPUTY_COACH': return i18n.t('common:userRole.deputyCoach');
        case 'COACH': return i18n.t('common:userRole.coach');
        case 'CAPTAIN': return i18n.t('common:userRole.captain');
        case 'MEMBER': return i18n.t('common:userRole.member');
        case 'STUDENT_INTERNAL': return i18n.t('common:userRole.student');
        case 'STUDENT_EXTERNAL': return i18n.t('common:userRole.student');
        case 'STUDENT': return i18n.t('common:userRole.student');
        default: return role || i18n.t('common:userRole.default');
    }
};
