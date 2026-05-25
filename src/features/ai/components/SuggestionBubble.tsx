import { X, MessageSquare, Sparkles, Power } from 'lucide-react';
import i18n from '@/i18n';

interface SuggestionBubbleProps {
    message: string | null;
    isVisible: boolean;
    onClose: () => void;
    onClick: () => void;
    onDisable?: () => void;
}

export const SuggestionBubble = ({
    message,
    isVisible,
    onClose,
    onClick,
    onDisable
}: SuggestionBubbleProps) => {
    if (!isVisible || !message) return null;

    return (
        <div
            className="absolute bottom-20 right-0 z-50 mb-2 mr-2 w-64 md:w-72 animate-fade-in-up"
            style={{ animationDuration: '0.3s' }}
        >
            <div className="relative group">
                <div
                    role="button"
                    tabIndex={0}
                    className={`
                        relative overflow-hidden cursor-pointer rounded-2xl p-4
                        border border-white/20 dark:border-slate-700/50
                        bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl
                        shadow-xl hover:shadow-humg-blue/10
                        transition-colors duration-300
                    `}
                    onClick={onClick}
                    onKeyDown={(e) => e.key === 'Enter' && onClick()}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-humg-blue/10 to-transparent opacity-50 dark:opacity-30 pointer-events-none" />

                    <div className="relative z-10 flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-humg-blue to-indigo-600 shadow-lg">
                                <Sparkles size={14} className="text-white animate-pulse" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="mb-1 flex items-center gap-1 text-xs font-bold text-humg-blue dark:text-blue-400">
                                <MessageSquare size={10} />
                                {i18n.t('features:ai.suggestion.title')}
                            </p>
                            <p className="text-sm font-medium leading-tight text-slate-700 dark:text-slate-200 break-words">
                                "{message}"
                            </p>
                        </div>
                    </div>

                    {onDisable && (
                        <div className="relative z-10 mt-2 pt-2 border-t border-slate-200/30 dark:border-slate-700/30 flex justify-end">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDisable();
                                }}
                                className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-red-400 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                            >
                                <Power size={8} />
                                {i18n.t('features:ai.suggestion.hideLabel')}
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    aria-label={i18n.t('features:ai.suggestion.closeAriaLabel')}
                    className={`
                        absolute -right-2 -top-2 z-20
                        flex h-6 w-6 items-center justify-center rounded-full
                        border border-slate-100 dark:border-slate-700
                        bg-white dark:bg-slate-800 text-slate-500
                        shadow-md transition-colors duration-200
                        hover:text-red-500 hover:scale-110
                    `}
                >
                    <X size={12} />
                </button>

                <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-b border-r border-white/20 bg-white/10 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60" />
            </div>
        </div>
    );
};