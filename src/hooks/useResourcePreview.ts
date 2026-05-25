import { useState, useCallback } from 'react';
import { resourceRepository } from '@/features/resources/api';

interface PreviewData {
    isOpen: boolean;
    url: string | null;
    fileName: string;
    fileType: string;
}

const INITIAL_PREVIEW: PreviewData = {
    isOpen: false,
    url: null,
    fileName: '',
    fileType: '',
};

export const useResourcePreview = () => {
    const [previewData, setPreviewData] = useState<PreviewData>(INITIAL_PREVIEW);
    const [previewLoadingId, setPreviewLoadingId] = useState<number | null>(null);

    const openPreview = useCallback(async (resourceId: number, fileName: string, fileType: string) => {
        setPreviewLoadingId(resourceId);
        try {
            const { blob } = await resourceRepository.previewResource(resourceId);
            const url = window.URL.createObjectURL(blob);
            setPreviewData({ isOpen: true, url, fileName, fileType });
        } catch (error: unknown) {
            throw error;
        } finally {
            setPreviewLoadingId(null);
        }
    }, []);

    const closePreview = useCallback(() => {
        if (previewData.url) {
            window.URL.revokeObjectURL(previewData.url);
        }
        setPreviewData(INITIAL_PREVIEW);
    }, [previewData.url]);

    return {
        previewData,
        previewLoadingId,
        openPreview,
        closePreview,
    };
};
