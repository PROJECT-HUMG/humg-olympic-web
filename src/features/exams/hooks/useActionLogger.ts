import { useRef, useCallback } from 'react';
import type { ActionLogEntry, ActionLogType } from '@/features/exams/types/attempt.types';

const DEBOUNCE_MS = 2000;

/**
 * Tracks user actions during exam for lecturer review.
 * Stores logs in a ref to avoid re-renders.
 */
export const useActionLogger = () => {
    const logsRef = useRef<ActionLogEntry[]>([]);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingRef = useRef<{ action: ActionLogType; questionId?: number; detail?: string } | null>(null);

    const flushPending = useCallback(() => {
        if (pendingRef.current) {
            logsRef.current.push({
                ...pendingRef.current,
                timestamp: new Date().toISOString(),
            });
            pendingRef.current = null;
        }
    }, []);

    const log = useCallback((action: ActionLogType, questionId?: number, detail?: string) => {
        logsRef.current.push({
            action,
            questionId,
            timestamp: new Date().toISOString(),
            detail,
        });
    }, []);

    /** Debounced log — batches rapid calls (e.g. ANSWER_CHANGE per keystroke) into one log entry */
    const logDebounced = useCallback((action: ActionLogType, questionId?: number, detail?: string) => {
        // If pending log is for a different question, flush it first
        if (pendingRef.current && pendingRef.current.questionId !== questionId) {
            flushPending();
        }

        pendingRef.current = { action, questionId, detail };

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            flushPending();
            debounceTimerRef.current = null;
        }, DEBOUNCE_MS);
    }, [flushPending]);

    const getLogs = useCallback(() => {
        // Flush any pending debounced log before returning
        flushPending();
        return [...logsRef.current];
    }, [flushPending]);

    const clear = useCallback(() => {
        logsRef.current = [];
        pendingRef.current = null;
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
    }, []);

    return { log, logDebounced, getLogs, clear };
};
