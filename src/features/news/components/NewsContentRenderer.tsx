
import { BlockNoteJsonRenderer } from './BlockNoteJsonRenderer';

interface NewsContentRendererProps {
    content: string | any[];
}

export const NewsContentRenderer = ({ content }: NewsContentRendererProps) => {
    return (
        <div className="news-content-renderer px-4 md:px-0">
            <BlockNoteJsonRenderer content={content} />
        </div>
    );
};
