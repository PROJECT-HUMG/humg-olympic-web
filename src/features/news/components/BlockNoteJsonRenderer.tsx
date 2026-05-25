import { useMemo, Fragment, type ReactNode } from 'react';
import i18n from '@/i18n';

type Block = {
    id?: string;
    type: string;
    props?: Record<string, unknown>;
    content?: string | InlineContent[];
    children?: Block[];
};

type InlineContent =
    | { type: 'text'; text: string; styles?: Record<string, string | boolean> }
    | { type: 'link'; content: InlineContent[]; href: string };

interface TableRow {
    cells?: InlineContent[][];
}

const proseClasses = 'prose dark:prose-invert max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-humg-blue prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 dark:prose-strong:text-white prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl';

function renderInlineContent(content: string | InlineContent[] | undefined): ReactNode {
    if (content == null) return null;
    if (typeof content === 'string') return content;

    return content.map((item, i) => {
        if (item.type === 'text') {
            const { text, styles } = item;
            let el: ReactNode = text;
            if (styles?.bold) el = <strong key={i}>{el}</strong>;
            if (styles?.italic) el = <em key={i}>{el}</em>;
            if (styles?.underline) el = <span key={i} className="underline">{el}</span>;
            if (styles?.strike) el = <s key={i}>{el}</s>;
            if (styles?.code) el = <code key={i} className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sm">{el}</code>;
            if (!styles?.bold && !styles?.italic && !styles?.underline && !styles?.strike && !styles?.code) el = <span key={i}>{el}</span>;
            return <Fragment key={i}>{el}</Fragment>;
        }
        if (item.type === 'link') {
            return (
                <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="text-humg-blue hover:underline">
                    {renderInlineContent(item.content)}
                </a>
            );
        }
        return null;
    });
}

function renderBlock(block: Block, index: number): ReactNode {
    const key = block.id ?? index;
    const content = block.content;
    const props = block.props ?? {};
    const children = block.children;

    const renderChildren = children?.length ? (
        <div className="ml-4 mt-2">
            {children.map((b, i) => renderBlock(b, i))}
        </div>
    ) : null;

    switch (block.type) {
        case 'paragraph':
            return (
                <div key={key} className="mb-4">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {renderInlineContent(Array.isArray(content) ? content : content ? [{ type: 'text', text: String(content) }] : undefined)}
                    </p>
                    {renderChildren}
                </div>
            );
        case 'heading': {
            const level = Math.min(3, Math.max(1, Number((props as { level?: number }).level) || 1));
            const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
            const classMap = { h1: 'text-2xl mt-8 mb-4', h2: 'text-xl mt-6 mb-3', h3: 'text-lg mt-4 mb-2' };
            return (
                <div key={key}>
                    <Tag className={`font-bold text-slate-900 dark:text-white ${classMap[Tag]}`}>
                        {renderInlineContent(Array.isArray(content) ? content : content ? [{ type: 'text', text: String(content) }] : undefined)}
                    </Tag>
                    {renderChildren}
                </div>
            );
        }
        case 'bulletListItem':
            return (
                <li key={key} className="ml-4 list-disc text-slate-600 dark:text-slate-300 mb-1">
                    {renderInlineContent(Array.isArray(content) ? content : content ? [{ type: 'text', text: String(content) }] : undefined)}
                    {children?.length ? <ul className="mt-1 list-disc ml-4">{children.map((b, i) => renderBlock(b, i))}</ul> : null}
                </li>
            );
        case 'numberedListItem':
            return (
                <li key={key} className="ml-4 list-decimal text-slate-600 dark:text-slate-300 mb-1">
                    {renderInlineContent(Array.isArray(content) ? content : content ? [{ type: 'text', text: String(content) }] : undefined)}
                    {children?.length ? <ol className="mt-1 list-decimal ml-4">{children.map((b, i) => renderBlock(b, i))}</ol> : null}
                </li>
            );
        case 'checkListItem': {
            const checked = (props as { checked?: boolean }).checked === true;
            return (
                <li key={key} className="flex flex-col mb-2">
                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <span className="mt-0.5 shrink-0" aria-hidden>{checked ? '☑' : '☐'}</span>
                        <span className={checked ? 'line-through opacity-80' : ''}>
                            {renderInlineContent(Array.isArray(content) ? content : content ? [{ type: 'text', text: String(content) }] : undefined)}
                        </span>
                    </div>
                    {renderChildren}
                </li>
            );
        }
        case 'image': {
            const url = (props as { url?: string }).url;
            const caption = (props as { caption?: string }).caption;
            if (!url) return renderChildren;
            return (
                <figure key={key} className="my-6">
                    <img src={url} alt={caption || ''} className="rounded-xl w-full max-w-2xl mx-auto shadow-md" loading="lazy" />
                    {caption && <figcaption className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">{caption}</figcaption>}
                    {renderChildren}
                </figure>
            );
        }
        case 'codeBlock': {
            const lang = (props as { language?: string }).language;
            const code = typeof content === 'string' ? content : Array.isArray(content) ? content.map(c => c.type === 'text' ? (c as { text: string }).text : '').join('') : '';
            return (
                <div key={key}>
                    <pre className="my-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-x-auto text-sm">
                        <code className={lang ? `language-${lang}` : ''}>{code}</code>
                    </pre>
                    {renderChildren}
                </div>
            );
        }
        case 'blockquote':
            return (
                <div key={key}>
                    <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 italic text-slate-600 dark:text-slate-400">
                        {renderInlineContent(Array.isArray(content) ? content : content ? [{ type: 'text', text: String(content) }] : undefined)}
                    </blockquote>
                    {renderChildren}
                </div>
            );
        case 'table': {
            const contentObj = content as unknown as { rows?: TableRow[]; type?: string };
            const propsObj = props as { rows?: TableRow[] };
            const rows = contentObj?.rows || propsObj?.rows || (contentObj?.type === 'tableContent' ? contentObj.rows : undefined);
            const tableContent = Array.isArray(rows) ? (
                <div className="overflow-x-auto my-6">
                    <table className="w-full text-left border-collapse border border-slate-300 dark:border-slate-700">
                        <tbody>
                            {rows.map((row: TableRow, rIndex: number) => (
                                <tr key={rIndex} className="border-b border-slate-300 dark:border-slate-700">
                                    {row.cells?.map((cell: InlineContent[], cIndex: number) => (
                                        <td key={cIndex} className="p-3 border border-slate-300 dark:border-slate-700 align-top">
                                            {renderInlineContent(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null;

            return (
                <div key={key}>
                    {tableContent}
                    {renderChildren}
                </div>
            );
        }
        case 'audio':
        case 'video':
        case 'file': {
            const url = (props as { url?: string })?.url;
            const name = (props as { name?: string; title?: string })?.name || (props as { title?: string })?.title;
            if (!url) return renderChildren;

            let mediaContent;
            if (block.type === 'video') {
                mediaContent = (
                    <div className="my-6">
                        <video src={url} controls className="rounded-xl w-full max-w-2xl mx-auto shadow-md" />
                        {name && <p className="text-center text-sm text-slate-500 mt-2">{name}</p>}
                    </div>
                );
            } else if (block.type === 'audio') {
                mediaContent = (
                    <div className="my-4">
                        <audio src={url} controls className="w-full max-w-md mx-auto" />
                        {name && <p className="text-center text-sm text-slate-500 mt-2">{name}</p>}
                    </div>
                );
            } else {
                mediaContent = (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 my-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-fit">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">{name || i18n.t('news:renderer.downloadFile')}</span>
                    </a>
                );
            }
            return (
                <div key={key}>
                    {mediaContent}
                    {renderChildren}
                </div>
            );
        }
        case 'divider':
        case 'horizontalRule':
            return (
                <div key={key}>
                    <hr className="my-8 border-slate-200 dark:border-slate-700" />
                    {renderChildren}
                </div>
            );
        default:
            return (
                <div key={key} className="mb-4 text-slate-600 dark:text-slate-300">
                    {renderInlineContent(Array.isArray(content) ? content : (content && typeof content !== 'object') ? [{ type: 'text', text: String(content) }] : undefined)}
                    {renderChildren}
                </div>
            );
    }
}

export interface BlockNoteJsonRendererProps {
    /** BlockNote document JSON: string (parse) or array of blocks */
    content: string | Block[];
    className?: string;
}

/**
 * Render BlockNote document JSON with full control over colors and typography.
 * Use this instead of BlockNoteView for read-only display so theme (light/dark) and colors match your app.
 */
export const BlockNoteJsonRenderer = ({ content, className = '' }: BlockNoteJsonRendererProps) => {
    const blocks = useMemo((): Block[] => {
        if (typeof content === 'string') {
            try {
                const parsed = JSON.parse(content);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                return [];
            }
        }
        return Array.isArray(content) ? content : [];
    }, [content]);

    if (blocks.length === 0) {
        return <p className="text-slate-500 dark:text-slate-400 italic">{i18n.t('news:renderer.noContent')}</p>;
    }

    const listStack: { type: string; items: ReactNode[] }[] = [];
    const result: ReactNode[] = [];

    blocks.forEach((block, index) => {
        if (block.type === 'bulletListItem') {
            if (listStack[listStack.length - 1]?.type === 'bullet') {
                listStack[listStack.length - 1].items.push(renderBlock(block, index));
            } else {
                listStack.push({ type: 'bullet', items: [renderBlock(block, index)] });
            }
            return;
        }
        if (block.type === 'numberedListItem') {
            if (listStack[listStack.length - 1]?.type === 'number') {
                listStack[listStack.length - 1].items.push(renderBlock(block, index));
            } else {
                listStack.push({ type: 'number', items: [renderBlock(block, index)] });
            }
            return;
        }
        while (listStack.length > 0) {
            const list = listStack.pop()!;
            result.push(list.type === 'bullet' ? <ul key={`ul-${result.length}`} className="list-disc ml-4 mb-4">{list.items}</ul> : <ol key={`ol-${result.length}`} className="list-decimal ml-4 mb-4">{list.items}</ol>);
        }
        result.push(renderBlock(block, index));
    });

    while (listStack.length > 0) {
        const list = listStack.pop()!;
        result.push(list.type === 'bullet' ? <ul key={`ul-${result.length}`} className="list-disc ml-4 mb-4">{list.items}</ul> : <ol key={`ol-${result.length}`} className="list-decimal ml-4 mb-4">{list.items}</ol>);
    }

    return (
        <div className={`${proseClasses} ${className}`.trim()}>
            {result}
        </div>
    );
};
