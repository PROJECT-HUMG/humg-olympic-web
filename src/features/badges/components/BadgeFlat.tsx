import { useState } from 'react';
import {
    Lock, CheckCircle2,
    Calculator, Atom, FlaskConical, Languages, Terminal, Palette,
    Award, Star
} from 'lucide-react';
import { BadgeItem } from '@/features/auth/types/auth.types';

interface BadgeFlatProps {
    badge: BadgeItem;
    onClick: () => void;
    size?: 'sm' | 'md' | 'lg';
}

export const BadgeFlat = ({ badge, onClick, size = 'md' }: BadgeFlatProps) => {

    const [imgError, setImgError] = useState(false);

    const getSubjectConfig = () => {
        switch (badge.subject) {
            case 'ALGEBRA':
            case 'CALCULUS':
            case 'MATH':
                return {
                    icon: Calculator,
                    style: 'bg-blue-50 border-blue-200 text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
                };
            case 'PHYSICS':
                return {
                    icon: Atom,
                    style: 'bg-purple-50 border-purple-200 text-purple-400 dark:bg-purple-900/20 dark:border-purple-800'
                };
            case 'CHEMISTRY':
                return {
                    icon: FlaskConical,
                    style: 'bg-emerald-50 border-emerald-200 text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800'
                };
            case 'ENGLISH':
                return {
                    icon: Languages,
                    style: 'bg-rose-50 border-rose-200 text-rose-400 dark:bg-rose-900/20 dark:border-rose-800'
                };
            case 'IT':
                return {
                    icon: Terminal,
                    style: 'bg-indigo-50 border-indigo-200 text-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-800'
                };
            default:
                return {
                    icon: Palette,
                    style: 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                };
        }
    };

    const { icon: SubjectIcon, style: subjectStyle } = getSubjectConfig();

    const getRankColor = () => {
        if (!badge.isEarned) return 'text-slate-300 dark:text-slate-600 grayscale';

        switch (badge.level) {
            case 4: return 'text-yellow-500 dark:text-yellow-400 drop-shadow-sm';
            case 3: return 'text-slate-400 dark:text-slate-300';
            case 2: return 'text-orange-600 dark:text-orange-500';
            default: return 'text-stone-500 dark:text-stone-400';
        }
    };

    const rankColor = getRankColor();

    const sizeConfig = {
        sm: { box: 'w-12 h-12', icon: 18, fontSize: '14px', stars: 10 },
        md: { box: 'w-16 h-16', icon: 28, fontSize: '24px', stars: 14 },
        lg: { box: 'w-24 h-24', icon: 40, fontSize: '36px', stars: 20 }
    }[size];

    return (
        <div
            onClick={() => badge.isEarned && onClick()}
            className={`
                group relative flex flex-col items-center gap-2 select-none
                ${badge.isEarned ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}
            `}
        >

            <div className={`
                relative ${sizeConfig.box} rounded-2xl flex items-center justify-center
                border-2 ${badge.isEarned ? subjectStyle : 'bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800'} 
                transition-colors duration-300 shadow-sm
                ${badge.isSelected ? 'ring-4 ring-humg-blue/30 scale-110 shadow-md' : 'hover:scale-105 hover:shadow'}
            `}>


                {badge.isSelected && (
                    <div className="absolute -top-2 -right-2 bg-humg-blue text-white rounded-full p-0.5 shadow-md z-20 border-2 border-white dark:border-slate-900">
                        <CheckCircle2 size={12} strokeWidth={4} />
                    </div>
                )}


                {!badge.isEarned && (
                    <div className="absolute inset-0 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80 flex items-center justify-center z-10 backdrop-blur-[1px]">
                        <Lock size={22} className="text-slate-500 dark:text-slate-400 drop-shadow-sm" />
                    </div>
                )}


                <div className={`${rankColor} transition-colors duration-300 flex flex-col items-center justify-center`}>
                    {badge.iconUrl && !imgError ? (
                        <img
                            src={badge.iconUrl}
                            alt={badge.name}
                            className="object-cover rounded-sm"
                            style={{ width: sizeConfig.icon, height: sizeConfig.icon }}
                            onError={() => setImgError(true)}
                        />
                    ) : badge.type === 'NATIONAL' ? (
                        <div className="relative flex items-center justify-center">

                            {badge.isEarned && (
                                <div
                                    className="absolute inset-[-6px] rounded-full blur-lg animate-glow-pulse"
                                    style={{
                                        backgroundColor:
                                            badge.level === 4 ? '#facc15'   // gold
                                                : badge.level === 3 ? '#cbd5e1' // silver
                                                    : badge.level === 2 ? '#fb923c' // bronze
                                                        : '#94a3b8',                     // slate
                                    }}
                                />
                            )}

                            <Award size={sizeConfig.icon} strokeWidth={2} className="fill-current opacity-20 absolute" />
                            <Award size={sizeConfig.icon} strokeWidth={2.5} className="relative z-10 drop-shadow-lg" />
                        </div>
                    ) : badge.type === 'SCHOOL' ? (
                        <div className="flex flex-col items-center justify-center gap-0.5">
                            <span className={`font-black tracking-tighter drop-shadow-sm ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl'
                                }`}>
                                {badge.level === 4 ? '1' : badge.level === 3 ? '2' : badge.level === 2 ? '3' : '4'}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-0.5">
                            <Star
                                size={sizeConfig.icon * 1.5}
                                strokeWidth={2.5}
                                className="fill-current drop-shadow-sm"
                            />
                        </div>
                    )}
                </div>
            </div>


            {size !== 'sm' && (
                <span className={`
                    text-[11px] font-bold text-center leading-tight mt-1 px-1
                    ${badge.isEarned ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}
                `}>
                    {badge.name}
                </span>
            )}
        </div>
    );
};