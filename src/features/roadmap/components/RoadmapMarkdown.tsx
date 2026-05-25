import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RoadmapMarkdownProps {
    content: string;
    className?: string;
    compact?: boolean;
}

export const RoadmapMarkdown = ({ content, className = '', compact = false }: RoadmapMarkdownProps) => {
    if (!content.trim()) return null;

    return (
        <div
            className={`max-w-none text-slate-500 dark:text-slate-400
                [&_p]:my-1 [&_p]:leading-relaxed
                [&_strong]:font-bold [&_strong]:text-slate-700 dark:[&_strong]:text-slate-200
                [&_em]:text-slate-600 dark:[&_em]:text-slate-300
                [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5
                [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5
                [&_li]:my-1 [&_li]:leading-relaxed
                [&_a]:font-semibold [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline-offset-4 hover:[&_a]:underline
                [&_code]:rounded-md [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800
                [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]
                [&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 dark:[&_blockquote]:border-blue-800
                [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-600 dark:[&_blockquote]:text-slate-300
                ${compact ? 'max-h-12 overflow-hidden text-sm [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0' : 'text-base'}
                ${className}`}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer">
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
