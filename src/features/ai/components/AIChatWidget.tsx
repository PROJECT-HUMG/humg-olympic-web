import { useState, useRef, useEffect, useCallback, type PointerEvent, type CSSProperties, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, User, Loader2, Minimize2, Maximize2, Clock } from 'lucide-react';
import { SuggestionBubble } from './SuggestionBubble';
import { api } from '@/lib/api';
import { ApiError } from '@/lib/api/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useAISuggestions } from '@/features/ai/hooks/useAISuggestions';
import { sanitizeHtml } from '@/utils/sanitize';
import i18n from '@/i18n';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
    isRateLimit?: boolean;
}

const formatMessage = (text: string) => {
    const html = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br />')
        .trim();
    return sanitizeHtml(html);
};

type WidgetState = 'disabled' | 'bubble' | 'open';

export const AIChatWidget = () => {
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const currentView = location.pathname === '/' ? 'home' : location.pathname.substring(1).split('/')[0];

    const [widgetState, setWidgetState] = useState<WidgetState>('bubble');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: i18n.t('features:ai.welcomeMsg') }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef(messages);
    useEffect(() => { messagesRef.current = messages; }, [messages]);
    const conversationIdRef = useRef<string | null>(null);
    const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [bubblePos, setBubblePos] = useState({ x: -1, y: -1 });
    const isDragging = useRef(false);
    const wasDragged = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const dragStartPos = useRef({ x: 0, y: 0 });
    const edgePadding = 16;
    const [isEntering, setIsEntering] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsEntering(false), 800);
        return () => clearTimeout(timer);
    }, []);


    const getBubbleSize = useCallback(() => (window.innerWidth < 640 ? 64 : 72), []);
    const [bubbleSize, setBubbleSizeState] = useState(56);

    useEffect(() => {
        const update = () => setBubbleSizeState(getBubbleSize());
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [getBubbleSize]);

    // Initialize bubble position to bottom-right
    useEffect(() => {
        setBubblePos({
            x: window.innerWidth - bubbleSize - edgePadding,
            y: window.innerHeight - bubbleSize - edgePadding - 8,
        });
    }, [bubbleSize]);

    // Dispatch AI state changes so Header can render re-enable button
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('ai:statechange', { detail: { state: widgetState } }));
    }, [widgetState]);

    // Listen for re-enable request from Header navbar button
    useEffect(() => {
        const handleEnable = () => setWidgetState('bubble');
        window.addEventListener('ai:enable', handleEnable);
        return () => window.removeEventListener('ai:enable', handleEnable);
    }, []);


    const snapToEdge = useCallback((x: number, y: number) => {
        const midX = window.innerWidth / 2;
        const snappedX = x + bubbleSize / 2 < midX
            ? edgePadding
            : window.innerWidth - bubbleSize - edgePadding;
        const clampedY = Math.max(edgePadding, Math.min(y, window.innerHeight - bubbleSize - edgePadding));
        return { x: snappedX, y: clampedY };
    }, [bubbleSize]);

    // Mouse drag handlers
    const handlePointerDown = useCallback((e: PointerEvent) => {
        isDragging.current = true;
        wasDragged.current = false;
        dragStart.current = { x: e.clientX, y: e.clientY };
        dragStartPos.current = { ...bubblePos };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        e.preventDefault();
    }, [bubblePos]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) wasDragged.current = true;
        setBubblePos({
            x: dragStartPos.current.x + dx,
            y: dragStartPos.current.y + dy,
        });
    }, []);

    const handlePointerUp = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;
        setBubblePos(prev => snapToEdge(prev.x, prev.y));
    }, [snapToEdge]);

    // Compute chat panel position based on bubble
    const getChatPanelStyle = useCallback((): CSSProperties => {
        const panelW = Math.min(448, window.innerWidth - 48);
        const panelH = 650;
        const isLeft = bubblePos.x < window.innerWidth / 2;

        let left = isLeft ? bubblePos.x : bubblePos.x + bubbleSize - panelW;
        let top = bubblePos.y - panelH - 12;


        if (top < edgePadding) {
            top = bubblePos.y + bubbleSize + 12;
        }

        if (top + panelH > window.innerHeight - edgePadding) {
            top = window.innerHeight - panelH - edgePadding;
        }

        left = Math.max(edgePadding, Math.min(left, window.innerWidth - panelW - edgePadding));

        return { position: 'fixed', left, top, zIndex: 60 };
    }, [bubblePos, bubbleSize]);

    const { suggestion, isVisible, dismissSuggestion } = useAISuggestions(widgetState === 'bubble');

    useEffect(() => {
        if (widgetState === 'open' && !isMinimized && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, widgetState, isMinimized]);


    useEffect(() => {
        return () => {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
        };
    }, []);

    const startCooldown = useCallback((seconds: number) => {
        setRateLimitCooldown(seconds);
        if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = setInterval(() => {
            setRateLimitCooldown(prev => {
                if (prev <= 1) {
                    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const getRateLimitMessage = () => {
        const limit = isAuthenticated ? i18n.t('features:ai.rateLimitAuth') : i18n.t('features:ai.rateLimitGuest');
        const suggestion = isAuthenticated
            ? i18n.t('features:ai.rateLimitWait')
            : i18n.t('features:ai.rateLimitLogin');
        return i18n.t('features:ai.rateLimitMsg', { limit, suggestion });
    };

    const handleSend = async (e?: FormEvent, textOverride?: string) => {
        e?.preventDefault();
        const textToSend = textOverride || input.trim();
        if (!textToSend || rateLimitCooldown > 0) return;

        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post<{
                reply: string;
                conversationId?: string;
            }>('/ai/chat', {
                message: textToSend,
                conversationId: conversationIdRef.current,
                context: currentView,
                history: messagesRef.current.filter(m => !m.isError && !m.isRateLimit).map(m => ({ role: m.role, text: m.text })),
            });

            if (response.conversationId) {
                conversationIdRef.current = response.conversationId;
            }

            if (response.reply) {
                setMessages(prev => [...prev, { role: 'model', text: response.reply }]);
            } else {
                throw new Error(i18n.t('features:ai.emptyResponse'));
            }
        } catch (error: unknown) {
            if (error instanceof ApiError && error.status === 429) {
                startCooldown(60);
                setMessages(prev => [...prev, {
                    role: 'model',
                    text: getRateLimitMessage(),
                    isRateLimit: true,
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'model',
                    text: i18n.t('features:ai.errorResponse'),
                    isError: true,
                }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = () => {
        if (suggestion) {
            setWidgetState('open');
            setIsMinimized(false);
            dismissSuggestion();
            handleSend(undefined, suggestion);
        }
    };

    const handleDisable = () => {
        setWidgetState('disabled');
        dismissSuggestion();
    };

    const handleEnable = () => {
        setWidgetState('bubble');
    };


    if (widgetState === 'disabled') {
        return null;
    }

    return (
        <>

            {widgetState === 'bubble' && (
                <div data-ai-widget className="fixed z-[59]" style={{
                    left: bubblePos.x < window.innerWidth / 2
                        ? bubblePos.x + bubbleSize + 8
                        : bubblePos.x - 8,
                    top: bubblePos.y - 8,
                    transform: bubblePos.x < window.innerWidth / 2 ? 'none' : 'translateX(-100%)',
                }}>
                    <SuggestionBubble
                        message={suggestion}
                        isVisible={isVisible}
                        onClose={dismissSuggestion}
                        onClick={handleSuggestionClick}
                        onDisable={handleDisable}
                    />
                </div>
            )}

            {widgetState === 'bubble' ? (
                <div
                    data-ai-widget
                    className="fixed z-[60] group"
                    style={{
                        left: bubblePos.x,
                        top: bubblePos.y,
                        transition: isDragging.current ? 'none' : 'left 0.3s ease, top 0.3s ease',
                        touchAction: 'none',
                        ...(isEntering ? {
                            animation: 'ai-fly-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                        } : {}),
                    }}
                >
                    {isEntering && (
                        <style>{`
                            @keyframes ai-fly-in {
                                0% { opacity: 0; transform: translateY(-100px) rotate(-15deg) scale(0.6); }
                                60% { opacity: 1; transform: translateY(10px) rotate(3deg) scale(1.05); }
                                100% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
                            }
                        `}</style>
                    )}
                    <button
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onClick={() => { if (!wasDragged.current) { setWidgetState('open'); dismissSuggestion(); } }}
                        className="rounded-full shadow-glow flex items-center justify-center transition-transform duration-300 relative z-[60] overflow-hidden cursor-grab active:cursor-grabbing"
                        style={{ width: bubbleSize, height: bubbleSize }}
                        title={i18n.t('features:ai.chatTitle')}
                    >
                        <img src="/assets/avatar-chatbot.png" alt="OlympAI" className="w-full h-full object-cover" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleDisable(); }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 hover:scale-110 z-[61]"
                        title={i18n.t('features:ai.disableTitle')}
                    >
                        <X size={10} className="text-slate-400 hover:text-red-500" />
                    </button>
                </div>
            ) : (
                <div
                    data-ai-widget
                    className={`w-[calc(100vw-3rem)] sm:w-[28rem] max-w-[28rem] bg-white dark:bg-humg-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors duration-300 ${isMinimized ? 'h-16' : 'h-[650px] max-h-[85vh]'}`}
                    style={getChatPanelStyle()}
                >

                    <div
                        className="bg-gradient-to-r from-humg-blue to-indigo-600 p-4 flex justify-between items-center cursor-pointer select-none"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        <div className="flex items-center gap-2 text-white">
                            <div className="rounded-full overflow-hidden flex-shrink-0">
                                <img src="/assets/avatar-chatbot.png" alt="OlympAI" className="w-10 h-10 rounded-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">OlympAI</h3>
                                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    {i18n.t('features:ai.readyStatus')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-white/80">
                            <button
                                onClick={(e) => { e.stopPropagation(); setWidgetState('bubble'); setIsMinimized(false); }}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                title={i18n.t('features:ai.closeChat')}
                            >
                                <Minimize2 size={16} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDisable(); setWidgetState('disabled'); }}
                                className="p-1.5 hover:bg-red-500/30 rounded-lg transition-colors hover:text-white"
                                title={i18n.t('features:ai.disableTitle')}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0F172A]">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${msg.role === 'user'
                                            ? user?.avatarUrl ? 'ring-2 ring-humg-blue/30' : 'bg-slate-200 dark:bg-slate-700'
                                            : msg.isRateLimit || msg.isError
                                                ? 'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 text-white'
                                                : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
                                            }`}>
                                            {msg.role === 'user'
                                                ? (user?.avatarUrl
                                                    ? <img src={user.avatarUrl} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                                                    : <User size={16} className="text-slate-600 dark:text-slate-300" />)
                                                : <img src="/assets/avatar-chatbot.png" alt="OlympAI" className="w-full h-full object-cover" />
                                            }
                                        </div>
                                        <div
                                            className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-humg-blue text-white rounded-tr-none'
                                                : msg.isRateLimit
                                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700/50 rounded-tl-none shadow-sm'
                                                    : msg.isError
                                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/50 rounded-tl-none shadow-sm'
                                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                                        />
                                    </div>
                                ))}

                                {/* FAQ Quick Replies — only show with welcome message */}
                                {messages.length === 1 && !isLoading && (
                                    <div className="flex flex-wrap gap-2 pl-13">
                                        {[
                                            i18n.t('features:ai.quickQ1'),
                                            i18n.t('features:ai.quickQ2'),
                                            i18n.t('features:ai.quickQ3'),
                                            i18n.t('features:ai.quickQ4'),
                                        ].map((q) => (
                                            <button
                                                key={q}
                                                onClick={() => handleSend(undefined, q)}
                                                className="px-3 py-1.5 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            <img src="/assets/avatar-chatbot.png" alt="OlympAI" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm flex gap-1">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>


                            <div className="p-3 bg-white dark:bg-humg-dark-surface border-t border-slate-100 dark:border-slate-700">
                                {/* Rate limit cooldown banner */}
                                {rateLimitCooldown > 0 && (
                                    <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700/50">
                                        <Clock size={14} className="text-amber-500 flex-shrink-0" />
                                        <p className="text-xs text-amber-700 dark:text-amber-300">
                                            Vui lòng đợi <strong>{rateLimitCooldown}s</strong> trước khi gửi tin tiếp
                                        </p>
                                    </div>
                                )}
                                <form onSubmit={(e) => handleSend(e)} className="relative">
                                    <input
                                        type="text"
                                        placeholder={rateLimitCooldown > 0 ? i18n.t('features:ai.inputWaiting', { seconds: rateLimitCooldown }) : i18n.t('features:ai.inputPlaceholder')}
                                        className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-humg-blue/50 text-slate-800 dark:text-white disabled:opacity-60"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={isLoading || rateLimitCooldown > 0}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading || rateLimitCooldown > 0}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-humg-blue text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    </button>
                                </form>
                                <div className="text-center mt-2">
                                    <p className="text-[10px] text-slate-400">{i18n.t('features:ai.poweredBy')}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};