import { createElement, type ReactNode, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mention } from '@/features/forum/types/forum.types';

export function renderContentWithMentions(
    content: string,
    mentions?: Mention[],
    renderMention?: (userId: number, name: string, key: string) => ReactNode,
): ReactNode[] {
    const hasNewFormat = /@\[\d+\]/.test(content);

    if (hasNewFormat) {
        return parseNewFormat(content, mentions ?? [], renderMention);
    }

    if (mentions && mentions.length > 0) {
        return parseLegacyFormat(content, mentions, renderMention);
    }

    if (content.includes('@')) {
        return renderFallbackMentions(content);
    }

    return [content];
}

function parseNewFormat(
    content: string,
    mentions: Mention[],
    renderMention?: (userId: number, name: string, key: string) => ReactNode,
): ReactNode[] {
    const mentionMap = new Map(mentions.map(m => [m.userId, m.name]));
    const parts: ReactNode[] = [];
    const regex = /@\[(\d+)\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index));
        }

        const userId = Number(match[1]);
        const name = mentionMap.get(userId) ?? `User #${userId}`;
        const key = `mention-${userId}-${match.index}`;

        parts.push(renderMentionNode(userId, name, key, renderMention));
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [content];
}

function parseLegacyFormat(
    content: string,
    mentions: Mention[],
    renderMention?: (userId: number, name: string, key: string) => ReactNode,
): ReactNode[] {
    const sortedMentions = [...mentions].sort((a, b) => b.name.length - a.name.length);

    const positions: { start: number; end: number; mention: Mention }[] = [];
    const used = new Set<number>();

    for (const m of sortedMentions) {
        const tag = `@${m.name}`;
        let searchFrom = 0;
        let idx: number;
        while ((idx = content.indexOf(tag, searchFrom)) !== -1) {
            let overlaps = false;
            for (let i = idx; i < idx + tag.length; i++) {
                if (used.has(i)) { overlaps = true; break; }
            }
            if (!overlaps) {
                positions.push({ start: idx, end: idx + tag.length, mention: m });
                for (let i = idx; i < idx + tag.length; i++) used.add(i);
                break;
            }
            searchFrom = idx + tag.length;
        }
    }

    if (positions.length === 0) {
        return [content];
    }

    positions.sort((a, b) => a.start - b.start);

    const parts: ReactNode[] = [];
    let lastIndex = 0;

    for (const pos of positions) {
        if (pos.start > lastIndex) {
            parts.push(content.slice(lastIndex, pos.start));
        }
        const key = `mention-${pos.mention.userId}-${pos.start}`;
        parts.push(renderMentionNode(pos.mention.userId, pos.mention.name, key, renderMention));
        lastIndex = pos.end;
    }

    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
    }

    return parts;
}

function renderMentionNode(
    userId: number,
    name: string,
    key: string,
    renderMention?: (userId: number, name: string, key: string) => ReactNode,
): ReactNode {
    if (renderMention) {
        return renderMention(userId, name, key);
    }
    return createElement(
        Link,
        {
            key,
            to: `/profile/${userId}`,
            className: 'text-blue-600 dark:text-blue-400 font-semibold hover:underline',
            onClick: (e: MouseEvent) => e.stopPropagation(),
        },
        `@${name}`
    );
}

function renderFallbackMentions(content: string): ReactNode[] {
    const parts: ReactNode[] = [];
    const regex = /@\[(\d+)\]|@(\S+)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index));
        }
        parts.push(
            createElement(
                'span',
                {
                    key: `mention-fb-${match.index}`,
                    className: 'text-blue-600 dark:text-blue-400 font-semibold',
                },
                match[0]
            )
        );
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [content];
}
