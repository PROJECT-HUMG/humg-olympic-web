import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Download, AlertCircle, Loader2, FileX, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import i18n from '@/i18n';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use CDN worker — avoids deploy issues with bundled worker path resolution
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string | null;
    fileName: string;
    fileType: string;
    onDownload?: () => void;
}

export const PreviewModal = ({
    isOpen, onClose, fileUrl, fileName, fileType, onDownload
}: PreviewModalProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // PDF-specific state
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && fileUrl) {
            setIsLoading(true);
            setHasError(false);
            setCurrentPage(1);
            setScale(1.0);
        }
    }, [isOpen, fileUrl]);

    // Measure container width for responsive PDF rendering
    useEffect(() => {
        if (!isOpen) return;
        const measure = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setCurrentPage(p => Math.min(p + 1, numPages));
            if (e.key === 'ArrowLeft') setCurrentPage(p => Math.max(p - 1, 1));
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, numPages]);

    if (!isOpen || !fileUrl) return null;

    const normalizedType = fileType.toUpperCase();
    const isPDF = normalizedType.includes('PDF');
    const isImage = ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'].some(ext => normalizedType.includes(ext));

    const handleLoad = () => setIsLoading(false);
    const handleError = () => { setIsLoading(false); setHasError(true); };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setIsLoading(false);
    };

    const onDocumentLoadError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    const pageWidth = containerWidth > 0
        ? Math.min(containerWidth - 32, 900) * scale
        : undefined;

    const renderContent = () => {
        if (hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 px-6 text-center">
                    <FileX size={48} className="mb-4 text-red-400" />
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{i18n.t('resources:preview.cannotLoad')}</p>
                    <p className="text-sm mb-6 text-slate-400">{i18n.t('resources:preview.fileError')}</p>
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className="px-5 py-2.5 bg-humg-blue text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                        >
                            {i18n.t('resources:preview.downloadToView')}
                        </button>
                    )}
                </div>
            );
        }

        if (isPDF) {
            return (
                <div ref={containerRef} className="w-full h-full flex flex-col overflow-hidden">
                    {/* PDF Controls */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 gap-2 flex-wrap">
                        {/* Page navigation */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage <= 1}
                                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                                aria-label={i18n.t('resources:preview.previousPage')}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 min-w-[70px] text-center">
                                {numPages > 0 ? `${currentPage} / ${numPages}` : '...'}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, numPages))}
                                disabled={currentPage >= numPages}
                                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                                aria-label={i18n.t('resources:preview.nextPage')}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Zoom controls */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}
                                disabled={scale <= 0.5}
                                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                                aria-label={i18n.t('resources:preview.zoomOut')}
                            >
                                <ZoomOut size={15} />
                            </button>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 min-w-[44px] text-center">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={() => setScale(s => Math.min(s + 0.25, 3))}
                                disabled={scale >= 3}
                                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                                aria-label={i18n.t('resources:preview.zoomIn')}
                            >
                                <ZoomIn size={15} />
                            </button>
                            <button
                                onClick={() => setScale(1.0)}
                                className="px-2 py-1 text-[11px] font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* PDF Canvas area */}
                    <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 relative">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-200 dark:bg-slate-950">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-10 h-10 text-humg-blue animate-spin" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{i18n.t('resources:preview.loadingPdf')}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-center py-4 px-4 min-h-full">
                            <Document
                                file={fileUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                loading={<></>}
                            >
                                <Page
                                    pageNumber={currentPage}
                                    width={pageWidth}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    className="shadow-xl rounded-sm overflow-hidden"
                                    onRenderSuccess={() => setIsLoading(false)}
                                />
                            </Document>
                        </div>
                    </div>
                </div>
            );
        }

        if (isImage) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-slate-900/95 overflow-hidden relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <Loader2 className="w-10 h-10 text-white/50 animate-spin" />
                        </div>
                    )}
                    <img
                        src={fileUrl}
                        alt="Preview"
                        className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 px-6 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={40} className="text-slate-400" />
                </div>
                <p className="text-xl font-bold text-slate-700 dark:text-white mb-2">{i18n.t('resources:preview.unsupportedFormat')}</p>
                <p className="text-slate-400 mb-8 max-w-xs">{i18n.t('resources:preview.unsupportedHint')}</p>
                {onDownload && (
                    <button
                        onClick={onDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-humg-blue text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 active:scale-95 transform duration-200"
                    >
                        <Download size={20} />
                        {i18n.t('resources:preview.downloadNow')}
                    </button>
                )}
            </div>
        );
    };

    return (
        isOpen && (
            // pt-16/pt-20 clears the fixed navbar on mobile/desktop
            <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center pt-16 sm:pt-20 sm:p-6">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={onClose}
                />

                {/* Modal box */}
                <div
                    className="relative bg-white dark:bg-slate-900 w-full h-[calc(100svh-4rem)] sm:h-[calc(100svh-6rem)] sm:max-w-5xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="preview-modal-title"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 z-20 shadow-sm flex-shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 min-w-0">
                            <div className="p-1.5 sm:p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0" aria-hidden="true">
                                {isPDF
                                    ? <span className="text-xs font-bold text-red-500">PDF</span>
                                    : isImage
                                        ? <span className="text-xs font-bold text-blue-500">IMG</span>
                                        : <span className="text-xs font-bold text-slate-500">FILE</span>
                                }
                            </div>
                            <h3
                                id="preview-modal-title"
                                className="font-bold text-sm sm:text-lg text-slate-800 dark:text-white truncate"
                                title={fileName}
                            >
                                {fileName}
                            </h3>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {onDownload && (
                                <button
                                    onClick={onDownload}
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs sm:text-sm font-semibold"
                                    aria-label={i18n.t('resources:preview.downloadDocument')}
                                >
                                    <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    <span className="hidden sm:inline">{i18n.t('resources:preview.download')}</span>
                                </button>
                            )}
                            {onDownload && <div className="w-px h-4 sm:h-6 bg-slate-200 dark:bg-slate-600 mx-0.5 sm:mx-1" aria-hidden="true" />}
                            <button
                                onClick={onClose}
                                className="p-1.5 sm:p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-colors"
                                aria-label={i18n.t('resources:preview.closePreview')}
                            >
                                <X size={20} className="sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900 relative overflow-hidden min-h-0">
                        {renderContent()}
                    </div>
                </div>
            </div>
        )
    );
};
