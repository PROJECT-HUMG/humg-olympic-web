import i18n from '@/i18n';

export function extractErrorMessage(error: unknown, fallback = i18n.t('common:apiError.errorOccurred')): string {
    if (error instanceof Error) return error.message || fallback;
    if (typeof error === 'object' && error !== null) {
        const e = error as Record<string, unknown>;
        if (typeof e.message === 'string') return e.message;
        if (typeof e.response === 'object' && e.response !== null) {
            const resp = e.response as Record<string, unknown>;
            if (typeof resp.data === 'object' && resp.data !== null) {
                const data = resp.data as Record<string, unknown>;
                if (typeof data.message === 'string') return data.message;
            }
        }
        if (typeof e.code === 'string') return e.code;
    }
    if (typeof error === 'string') return error;
    return fallback;
}

export function extractErrorCode(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
        const e = error as Record<string, unknown>;
        if (typeof e.code === 'string') return e.code;
    }
    return '';
}

export function extractErrorStatus(error: unknown): number | undefined {
    if (typeof error === 'object' && error !== null) {
        const e = error as Record<string, unknown>;
        if (typeof e.status === 'number') return e.status;
        if (typeof e.response === 'object' && e.response !== null) {
            const resp = e.response as Record<string, unknown>;
            if (typeof resp.status === 'number') return resp.status;
        }
    }
    return undefined;
}
