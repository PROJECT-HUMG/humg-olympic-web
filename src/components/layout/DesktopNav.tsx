import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { NavEntry, isNavGroup } from './types/header.types';

interface DesktopNavProps {
    navEntries: NavEntry[];
    isActive: (path: string) => boolean;
    isGroupActive: (children: { href: string }[]) => boolean;
    openDropdown: string | null;
    onDropdownEnter: (label: string) => void;
    onDropdownLeave: () => void;
    onPrefetch: (href: string) => void;
}

export const DesktopNav = ({
    navEntries,
    isActive,
    isGroupActive,
    openDropdown,
    onDropdownEnter,
    onDropdownLeave,
    onPrefetch,
}: DesktopNavProps) => (
    <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
        {navEntries.map((entry) => {
            if (isNavGroup(entry)) {
                const groupActive = isGroupActive(entry.children);
                const isOpen = openDropdown === entry.label;

                return (
                    <div
                        key={entry.label}
                        className="relative"
                        onMouseEnter={() => onDropdownEnter(entry.label)}
                        onMouseLeave={onDropdownLeave}
                    >
                        <button
                            className={`
                                relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 group
                                flex items-center justify-center gap-1 min-w-[6.5rem] whitespace-nowrap
                                ${groupActive
                                    ? 'text-humg-blue dark:text-blue-400 font-bold'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-humg-blue dark:hover:text-blue-300'
                                }
                            `}
                        >
                            {entry.label}
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                            <span className={`absolute bottom-1 left-4 right-6 h-0.5 rounded-full transition-all duration-300 
                                ${groupActive ? 'bg-humg-blue dark:bg-blue-400' : 'opacity-0'}`}
                            />
                        </button>

                        {/* ── Dropdown Panel ── */}
                        <div
                            className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${isOpen
                                ? 'opacity-100 translate-y-0 pointer-events-auto'
                                : 'opacity-0 -translate-y-1 pointer-events-none'
                                }`}
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-900/8 dark:shadow-black/20 overflow-hidden min-w-[180px]">
                                {entry.children.map((child) => {
                                    const childActive = isActive(child.href);
                                    return (
                                        <Link
                                            key={child.href}
                                            to={child.href}
                                            onMouseEnter={() => onPrefetch(child.href)}
                                            className={`block px-4 py-2.5 text-sm font-medium transition-colors
                                                ${childActive
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-humg-blue dark:text-blue-400'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-humg-blue dark:hover:text-blue-300'
                                                }`}
                                        >
                                            {child.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            }

            {/* Direct nav item */ }
            const active = isActive(entry.href);
            return (
                <Link
                    key={entry.label}
                    to={entry.href}
                    onMouseEnter={() => onPrefetch(entry.href)}
                    onFocus={() => onPrefetch(entry.href)}
                    className={`
                        relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 group
                        text-center min-w-[6.5rem] whitespace-nowrap
                        ${active
                            ? 'text-humg-blue dark:text-blue-400 font-bold'
                            : 'text-slate-600 dark:text-slate-300 hover:text-humg-blue dark:hover:text-blue-300'
                        }
                    `}
                >
                    {entry.label}
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 
                        ${active ? 'w-1/2 bg-humg-blue dark:bg-blue-400' : 'w-0 bg-humg-blue/50 dark:bg-blue-400/50 group-hover:w-1/3'}`}
                    />
                </Link>
            );
        })}
    </nav>
);
