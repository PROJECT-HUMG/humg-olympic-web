import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import { VerifiedBadge, StudentBadges } from '@/features/badges/components/VerifiedBadge';
import { useUserPreview } from '@/hooks/useUserPreview';
import type { Author } from '@/features/forum/types/forum.types';
import type { TeamMember } from '@/features/team/types/team.types';

type TopPerformerStudent = TeamMember & { teamName: string };

const rankStyles: Record<number, string> = {
    0: 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 ring-2 ring-amber-300 dark:ring-amber-700',
    1: 'bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-neutral-800 ring-2 ring-slate-300 dark:ring-slate-600',
    2: 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 ring-2 ring-orange-300 dark:ring-orange-700',
};

export const TopPerformerCard = memo<{
    student: TopPerformerStudent;
    rank: number;
}>(({ student, rank }) => {
    const {
        isVisible,
        position,
        previewItem,
        handleHoverStart,
        handleHoverEnd,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave,
    } = useUserPreview<Author>({ showDelay: 500 });

    const [, setHoverState] = useState(false);

    const author: Author = {
        id: student.userId,
        name: student.name,
        avatar: student.avatar || '',
        role: student.role,
        badges: student.badges,
    };

    const triggerHover = (e: React.MouseEvent) => {
        setHoverState(true);
        handleHoverStart(author, e);
    };

    const triggerLeave = () => {
        setHoverState(false);
        handleHoverEnd();
    };

    return (
        <>
            <div className={`
                flex items-center gap-3 p-3 rounded-xl transition-colors duration-200
                ${rank < 3 ? rankStyles[rank] : 'bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700'}
            `}>
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${rank === 0 ? 'bg-amber-500 text-white' :
                        rank === 1 ? 'bg-slate-400 text-white' :
                            rank === 2 ? 'bg-orange-500 text-white' :
                                'bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-slate-400'}
                `}>
                    {rank + 1}
                </div>

                <Link to={`/profile/${student.userId}`} className="shrink-0 relative group"
                    onMouseEnter={triggerHover}
                    onMouseLeave={triggerLeave}
                >
                    {student.avatar ? (
                        <img src={student.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-neutral-700" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white dark:border-neutral-700 text-xs font-bold text-slate-500">
                            {student.name.charAt(0)}
                        </div>
                    )}
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Link
                            to={`/profile/${student.userId}`}
                            className="font-medium text-slate-900 dark:text-white text-sm truncate hover:text-blue-600 transition-colors"
                            onMouseEnter={triggerHover}
                            onMouseLeave={triggerLeave}
                        >
                            {student.name}
                        </Link>
                        <div className="flex items-center gap-1">
                            <VerifiedBadge role={student.role} size={14} />
                            {student.badges && <StudentBadges badges={student.badges} maxDisplay={1} size="xs" />}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{student.teamName}</p>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 px-2 py-1 rounded-lg">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{student.score || 0}</span>
                </div>
            </div>

            {previewItem && (
                <UserPreviewCard
                    author={previewItem}
                    isVisible={isVisible}
                    position={position}
                    onMouseEnter={handlePreviewMouseEnter}
                    onMouseLeave={handlePreviewMouseLeave}
                />
            )}
        </>
    );
});

TopPerformerCard.displayName = 'TopPerformerCard';
