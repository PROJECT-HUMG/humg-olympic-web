
import { Link } from 'react-router-dom';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { FeatureItem } from '../../../components/layout/types/header.types';
import i18n from '@/i18n';

interface FeatureCardProps {
    item: FeatureItem;
}

export const FeatureCard = ({ item }: FeatureCardProps) => {
    const Icon = item.icon as LucideIcon;

    return (
        <Link
            to={`/${item.link}`}
            className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-[28px] p-8 border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl hover:shadow-slate-200/80 dark:hover:shadow-slate-900/50 hover:-translate-y-1 transition-[transform,box-shadow] duration-300 overflow-hidden"
        >
            {/* Hover Gradient Border (Tinh tế) */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-humg-blue/10 dark:group-hover:border-blue-500/20 rounded-[28px] transition-colors pointer-events-none"></div>

            {/* Icon Box */}
            <div className={`w-14 h-14 rounded-2xl ${item.colorClass} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                <Icon size={28} strokeWidth={1.8} />
            </div>

            {/* Content */}
            <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-humg-blue dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                    {item.description}
                </p>
            </div>

            {/* Footer Action */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-humg-blue dark:text-blue-400 font-bold text-sm">
                <span className="group-hover:underline decoration-2 underline-offset-4">{i18n.t('features:landing.features.accessNow')}</span>
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-humg-blue group-hover:text-white dark:group-hover:bg-blue-500 transition-[transform,box-shadow]">
                    <ArrowRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </Link>
    );
};