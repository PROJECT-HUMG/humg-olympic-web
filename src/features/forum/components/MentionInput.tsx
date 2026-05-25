import { useState, useRef, useEffect, useCallback, useMemo, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Author } from '@/features/forum/types/forum.types';
import { getUserNameColor } from '@/utils/rankingHelpers';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarHelpers';
import { VerifiedBadge, StudentBadges } from '@/features/badges/components/VerifiedBadge';
import i18n from '@/i18n';



interface TrackedMention {
    userId: number;
    name: string;
}

interface MentionInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: (content: string, mentionedUserIds: number[]) => void;
    isSending: boolean;
    placeholder?: string;
    commentAuthors: Author[];
    currentUserId?: number;
    postAuthor?: Author;
    avatarUrl?: string;
    initialMentions?: TrackedMention[];
    autoFocus?: boolean;
}

export const MentionInput = ({
    value,
    onChange,
    onSend,
    isSending,
    placeholder = i18n.t('forum:mention.defaultPlaceholder'),
    commentAuthors,
    currentUserId,
    postAuthor,
    avatarUrl,
    initialMentions,
    autoFocus = false,
}: MentionInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionStartIdx, setMentionStartIdx] = useState(-1);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [trackedMentions, setTrackedMentions] = useState<TrackedMention[]>(initialMentions ?? []);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            // Focus and put cursor at the end
            const length = textareaRef.current.value.length;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(length, length);
        }
    }, [autoFocus]);

    // Re-seed tracked mentions when initialMentions changes (e.g. replying to different comment)
    const prevInitialMentionsRef = useRef<TrackedMention[] | undefined>(initialMentions);
    useEffect(() => {
        if (initialMentions !== prevInitialMentionsRef.current) {
            prevInitialMentionsRef.current = initialMentions;
            setTrackedMentions(initialMentions ?? []);
        }
    }, [initialMentions]);

    const handleScroll = useCallback(() => {
        if (textareaRef.current && backdropRef.current) {
            backdropRef.current.scrollTop = textareaRef.current.scrollTop;
            backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    }, []);

    const renderValueWithHighlights = useCallback(() => {
        if (!value) return null;

        // Ensure trailing newlines render correctly (textarea reserves space for trailing newline)
        const renderString = value.endsWith('\n') ? value + ' ' : value;

        if (trackedMentions.length === 0) {
            return <span>{renderString}</span>;
        }

        const names = trackedMentions.map(m => m.name).sort((a, b) => b.length - a.length);
        const regexStr = names.map(n => `@${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).join('|');
        const regex = new RegExp(`(${regexStr})`, 'g');

        const elements: ReactNode[] = [];
        let match;
        let lastIndex = 0;

        while ((match = regex.exec(renderString)) !== null) {
            if (match.index > lastIndex) {
                elements.push(<span key={`text-${lastIndex}`}>{renderString.substring(lastIndex, match.index)}</span>);
            }
            elements.push(<span key={`mention-${match.index}`} className="text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/40 rounded">{match[0]}</span>);
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < renderString.length) {
            elements.push(<span key={`text-${lastIndex}`}>{renderString.substring(lastIndex)}</span>);
        }

        return <>{elements}</>;
    }, [value, trackedMentions]);

    // Deduplicate authors: post author + comment authors, exclude current user
    const availableAuthors = useMemo(() => {
        const map = new Map<number, Author>();
        if (postAuthor && postAuthor.id !== currentUserId) {
            map.set(postAuthor.id, postAuthor);
        }
        for (const a of commentAuthors) {
            if (a.id !== currentUserId && !map.has(a.id)) {
                map.set(a.id, a);
            }
        }
        return Array.from(map.values());
    }, [commentAuthors, postAuthor, currentUserId]);

    // Filter by query
    const filteredAuthors = useMemo(() => {
        if (!mentionQuery) return availableAuthors;
        const q = mentionQuery.toLowerCase();
        return availableAuthors.filter(a => a.name.toLowerCase().includes(q));
    }, [availableAuthors, mentionQuery]);

    // Reset selection when filtered list changes
    useEffect(() => {
        setSelectedIdx(0);
    }, [filteredAuthors.length]);

    // Auto-resize textarea
    const handleInput = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Auto-resize
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }

        // Detect @mention trigger
        const cursorPos = e.target.selectionStart ?? newValue.length;
        const textBeforeCursor = newValue.slice(0, cursorPos);

        // Find the last @ that's either at start or preceded by whitespace
        const lastAtIdx = textBeforeCursor.lastIndexOf('@');
        if (lastAtIdx >= 0 && (lastAtIdx === 0 || /\s/.test(textBeforeCursor[lastAtIdx - 1]))) {
            const query = textBeforeCursor.slice(lastAtIdx + 1);
            // Only show dropdown if query has no spaces (still typing the mention)
            if (!/\s/.test(query)) {
                setMentionQuery(query);
                setMentionStartIdx(lastAtIdx);
                setShowDropdown(true);
                return;
            }
        }

        setShowDropdown(false);
    }, [onChange]);

    // Insert mention — show @Name in textarea (human-readable)
    const insertMention = useCallback((author: Author) => {
        const beforeMention = value.slice(0, mentionStartIdx);
        const afterMention = value.slice(mentionStartIdx + 1 + mentionQuery.length);
        const mentionText = `@${author.name}`;
        const newValue = beforeMention + mentionText + ' ' + afterMention;

        onChange(newValue);
        setShowDropdown(false);
        setMentionQuery('');
        setMentionStartIdx(-1);

        // Track mention for conversion at send time
        setTrackedMentions(prev => {
            if (prev.some(m => m.userId === author.id)) return prev;
            return [...prev, { userId: author.id, name: author.name }];
        });

        // Focus and set cursor after mention
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                const cursorPos = beforeMention.length + mentionText.length + 1;
                textareaRef.current.focus();
                textareaRef.current.selectionStart = cursorPos;
                textareaRef.current.selectionEnd = cursorPos;
            }
        });
    }, [value, mentionStartIdx, mentionQuery, onChange]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (showDropdown && filteredAuthors.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIdx(i => (i + 1) % filteredAuthors.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIdx(i => (i - 1 + filteredAuthors.length) % filteredAuthors.length);
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                insertMention(filteredAuthors[selectedIdx]);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowDropdown(false);
                return;
            }
        }

        // Normal Enter = send (Shift+Enter = newline)
        if (e.key === 'Enter' && !e.shiftKey && !showDropdown) {
            e.preventDefault();
            handleSend();
        }
    }, [showDropdown, filteredAuthors, selectedIdx, insertMention]);

    // Convert @Name → @[userId] and send
    const handleSend = useCallback(() => {
        if (!value.trim() || isSending) return;

        // Convert display value to API format: replace @Name with @[userId]
        let apiContent = value;
        const validMentionIds: number[] = [];

        // Sort by name length descending to avoid partial replacements
        const sortedMentions = [...trackedMentions].sort((a, b) => b.name.length - a.name.length);
        for (const m of sortedMentions) {
            if (apiContent.includes(`@${m.name}`)) {
                apiContent = apiContent.replaceAll(`@${m.name}`, `@[${m.userId}]`);
                validMentionIds.push(m.userId);
            }
        }

        onSend(apiContent, validMentionIds);
        setTrackedMentions([]);

        // Reset textarea height
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }, [value, isSending, trackedMentions, onSend]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Scroll selected item into view
    useEffect(() => {
        if (showDropdown && dropdownRef.current) {
            const item = dropdownRef.current.children[selectedIdx] as HTMLElement;
            item?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIdx, showDropdown]);

    return (
        <div className="flex items-start gap-3">
            {avatarUrl && (
                <img
                    src={avatarUrl}
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                    alt="Current User"
                />
            )}
            <div className="flex-1 relative">
                {/* Backdrop logic for formatting */}
                <div
                    ref={backdropRef}
                    className={`absolute inset-0 block w-full pl-4 pr-12 py-3 rounded-[23px] text-sm border whitespace-pre-wrap break-words overflow-hidden pointer-events-none transition-colors ${isSending
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-slate-400 dark:text-slate-500 border-blue-300 dark:border-blue-800 animate-pulse'
                        : isFocused
                            ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-blue-500'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                    aria-hidden="true"
                >
                    {renderValueWithHighlights()}
                </div>

                <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder={placeholder}
                    className="relative block w-full pl-4 pr-12 py-3 bg-transparent rounded-[23px] text-sm outline-none border-transparent focus:ring-1 focus:ring-blue-500 text-transparent caret-slate-900 dark:caret-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none min-h-[46px] max-h-32 custom-scrollbar transition-colors"
                    value={value}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                    onScroll={handleScroll}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <div className="absolute right-2 bottom-2 flex items-center">
                    <button
                        onClick={handleSend}
                        disabled={isSending || !value.trim()}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                        aria-label={i18n.t('forum:mention.sendAriaLabel')}
                    >
                        {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>

                {/* Mention dropdown */}
                {showDropdown && filteredAuthors.length > 0 && (
                    <div
                        ref={dropdownRef}
                        className="absolute bottom-full left-0 mb-2 w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto z-50 animate-fade-in"
                    >
                        {filteredAuthors.map((author, idx) => (
                            <button
                                key={author.id}
                                onClick={() => insertMention(author)}
                                onMouseEnter={() => setSelectedIdx(idx)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${idx === selectedIdx
                                    ? 'bg-blue-50 dark:bg-blue-900/30'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <img
                                    src={getAvatarUrl(author.avatar, author.name)}
                                    alt={author.name}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                                    onError={(e) => handleAvatarError(e, author.name)}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-sm font-semibold truncate ${getUserNameColor(author.xpPoints)}`}>
                                            {author.name}
                                        </span>
                                        <VerifiedBadge role={author.role} size={12} />
                                        <StudentBadges badges={author.badges} maxDisplay={2} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Pre-fill mention for reply — shows @Name in input, tracks for @[userId] conversion at send
 */
export function createReplyMention(author: Author): { text: string; mention: TrackedMention } {
    return {
        text: `@${author.name} `,
        mention: { userId: author.id, name: author.name },
    };
}
