interface IconButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    active?: boolean;
    badge?: number;
}

export const IconButton = ({ children, onClick, active, badge }: IconButtonProps) => (
    <button
        onClick={onClick}
        className={`
            relative w-10 h-10 rounded-full flex items-center justify-center 
            transition-colors duration-200 border
            ${active
                ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-humg-blue dark:text-blue-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
            }
        `}
    >
        {children}
        {badge != null && badge > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                {badge > 9 ? '9+' : badge}
            </span>
        )}
    </button>
);
