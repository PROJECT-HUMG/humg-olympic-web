
import { Users, Plus, Sparkles } from 'lucide-react';
import i18n from '@/i18n';

interface EmptyTeamStateProps {
    onCreate?: () => void;
    message: string;
}

export const EmptyTeamState = ({ onCreate, message }: EmptyTeamStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            {/* Illustration */}
            <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-700" />
                <div className="relative w-40 h-40 bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl flex items-center justify-center border-4 border-slate-50 dark:border-slate-700 transform rotate-3 group-hover:rotate-6 transition-transform">
                    <Users size={64} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center border-2 border-slate-50 dark:border-slate-700 transform -rotate-6 group-hover:-rotate-3 transition-transform delay-75">
                    <Sparkles size={28} className="text-amber-400" />
                </div>
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
                {i18n.t('features:team.empty.title')}
            </h3>

            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-10 leading-relaxed text-lg">
                {message}
            </p>

            {onCreate && (
                <button
                    onClick={onCreate}
                    className="relative group px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-[transform,box-shadow]"
                >
                    <span className="flex items-center gap-3">
                        <Plus size={20} />
                        {i18n.t('features:team.empty.createTeam')}
                    </span>
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-slate-900/10 scale-105 opacity-0 group-hover:opacity-100 transition-[transform,box-shadow]" />
                </button>
            )}
        </div>
    );
};