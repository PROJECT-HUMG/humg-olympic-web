import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import i18n from '@/i18n';

const ROUTE_KEYS: Record<string, string> = {
    '': 'breadcrumb.home',
    'news': 'breadcrumb.news',
    'competitions': 'breadcrumb.competitions',
    'resources': 'breadcrumb.resources',
    'rankings': 'breadcrumb.rankings',
    'roadmap': 'breadcrumb.roadmap',
    'forum': 'breadcrumb.forum',
    'teams': 'breadcrumb.teams',
    'profile': 'breadcrumb.profile',
    'notifications': 'breadcrumb.notifications',
    'about-us': 'breadcrumb.aboutUs',
    'privacy': 'breadcrumb.privacy',
    'terms': 'breadcrumb.terms',
    'exams': 'breadcrumb.exams',
    'create': 'breadcrumb.create',
    'edit': 'breadcrumb.edit',
    'preview': 'breadcrumb.preview',
    'result': 'breadcrumb.result',
    'public': 'breadcrumb.public',
};

interface BreadcrumbProps {
    /** Override the last breadcrumb label (e.g. with a page title) */
    currentLabel?: string;
}

export const Breadcrumb = ({ currentLabel }: BreadcrumbProps) => {
    const { pathname } = useLocation();

    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    const crumbs = segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;

        /* ── Determine label ── */
        let label = ROUTE_KEYS[segment] ? i18n.t(`common:${ROUTE_KEYS[segment]}`) : '';

        // If it's the last segment and we have a custom label, use it
        if (isLast && currentLabel) {
            label = currentLabel;
        }

        // If no label found, check if it's an ID (purely numeric)
        if (!label) {
            label = /^\d+$/.test(segment) ? `#${segment}` : segment;
        }

        return { path, label, isLast };
    });

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-4 overflow-x-auto">
            <Link
                to="/"
                className="flex items-center gap-1 hover:text-humg-blue dark:hover:text-blue-400 transition-colors shrink-0"
            >
                <Home size={14} />
            </Link>

            {crumbs.map(({ path, label, isLast }) => (
                <span key={path} className="flex items-center gap-1 shrink-0">
                    <ChevronRight size={12} className="text-slate-300 dark:text-slate-600" />
                    {isLast ? (
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                            {label}
                        </span>
                    ) : (
                        <Link
                            to={path}
                            className="hover:text-humg-blue dark:hover:text-blue-400 transition-colors truncate max-w-[150px]"
                        >
                            {label}
                        </Link>
                    )}
                </span>
            ))}
        </nav>
    );
};
