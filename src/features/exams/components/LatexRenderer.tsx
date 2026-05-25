import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
    content: string;
    className?: string;
    block?: boolean;
}

export const LatexRenderer = ({ content, className = '', block = false }: LatexRendererProps) => {
    // Memoize to avoid re-parsing on every render
    const safeContent = useMemo(() => content || '', [content]);

    if (!safeContent) return null;

    return (
        <div className={`latex-content prose prose-slate dark:prose-invert prose-sm md:prose-base max-w-none
            prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
            prose-headings:mb-2 prose-headings:mt-3
            prose-code:before:content-none prose-code:after:content-none
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
            prose-code:bg-slate-100 prose-code:dark:bg-slate-700
            prose-code:text-sm prose-code:font-mono
            prose-img:rounded-xl prose-img:shadow-sm
            prose-table:text-sm
            ${block ? '' : '[&>p]:inline [&>p]:m-0'}
            ${className}`}
        >
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
            >
                {safeContent}
            </ReactMarkdown>
        </div>
    );
};
