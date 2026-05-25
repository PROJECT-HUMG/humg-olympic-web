
import { LucideIcon, Edit2 } from 'lucide-react';
import i18n from '@/i18n';

interface InfoFieldProps {
    icon: LucideIcon;
    label: string;
    value: string;
    isEditing: boolean;
    onChange?: (val: string) => void;
}

export const InfoField = ({ icon: Icon, label, value, isEditing, onChange }: InfoFieldProps) => (
    <div className={`
        group flex items-center gap-4 p-3 rounded-2xl border border-transparent transition-colors duration-300
        ${isEditing ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
    `}>
        {/* Icon Box */}
        <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
            ${isEditing ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-humg-blue dark:group-hover:text-blue-400 group-hover:shadow-sm'}
        `}>
            <Icon size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>

            {isEditing && onChange ? (
                <div className="relative">
                    <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-humg-blue/50 focus:border-humg-blue outline-none transition-colors placeholder:text-slate-400"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={i18n.t('profile:infoField.placeholder', { label: label.toLowerCase() })}
                    />
                    <Edit2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            ) : (
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={value}>
                    {value}
                </p>
            )}
        </div>
    </div>
);