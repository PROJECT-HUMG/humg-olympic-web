
import { Bell } from 'lucide-react';
import i18n from '@/i18n';

export const EmptyState = () => (
    <div className="col-span-full py-24 text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-[32px] border border-dashed border-slate-300 dark:border-slate-700 animate-fade-in-up">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Bell className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            {i18n.t('news:empty.title')}
        </h3>
        <p className="text-slate-500 dark:text-slate-400">{i18n.t('news:empty.description')}</p>
    </div>
);