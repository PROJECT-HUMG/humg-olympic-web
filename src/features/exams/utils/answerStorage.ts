import type { LocalAnswer, LocalAnswerStore } from '../types/attempt.types';

const STORAGE_KEY_PREFIX = 'exam_attempt_';

export function getStorageKey(attemptId: number): string {
    return `${STORAGE_KEY_PREFIX}${attemptId}`;
}

export function loadAnswers(attemptId: number): Record<number, LocalAnswer> {
    try {
        const raw = localStorage.getItem(getStorageKey(attemptId));
        if (!raw) return {};
        const store: LocalAnswerStore = JSON.parse(raw);
        return store.answers || {};
    } catch {
        return {};
    }
}

export function saveAnswer(attemptId: number, questionId: number, answer: LocalAnswer): void {
    const current = loadAnswers(attemptId);
    current[questionId] = answer;
    const store: LocalAnswerStore = {
        answers: current,
        savedAt: new Date().toISOString(),
    };
    localStorage.setItem(getStorageKey(attemptId), JSON.stringify(store));
}

export function clearAnswers(attemptId: number): void {
    localStorage.removeItem(getStorageKey(attemptId));
}

export function countAnswered(answers: Record<number, LocalAnswer>): number {
    return Object.values(answers).filter(a =>
        (a.selectedOptionIds && a.selectedOptionIds.length > 0) ||
        (a.textAnswer && a.textAnswer.trim().length > 0) ||
        (a.textAnswers && a.textAnswers.some(t => t.trim().length > 0))
    ).length;
}

export function cleanupOldAttempts(maxToKeep: number = 3): void {
    try {
        // Clean up localStorage for answers
        const attemptKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
                attemptKeys.push(key);
            }
        }

        if (attemptKeys.length > maxToKeep) {
            // Sort keys by the timestamp inside their payload (or just sort by key name if IDs are incremental)
            const attemptsWithTime = attemptKeys.map(key => {
                let savedAt = 0;
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const store: LocalAnswerStore = JSON.parse(raw);
                        savedAt = new Date(store.savedAt).getTime();
                    }
                } catch { /* ignore parse error */ }
                return { key, savedAt };
            });

            attemptsWithTime.sort((a, b) => b.savedAt - a.savedAt); // Descending (newest first)

            // Remove everything after maxToKeep
            const toRemove = attemptsWithTime.slice(maxToKeep);
            toRemove.forEach(({ key }) => localStorage.removeItem(key));
        }

        // Clean up sessionStorage for exam sessions
        const sessionKeys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith('exam_session_')) {
                sessionKeys.push(key);
            }
        }

        if (sessionKeys.length > maxToKeep) {
            const sessionsWithId = sessionKeys.map(key => {
                const id = parseInt(key.replace('exam_session_', ''), 10);
                return { key, id: isNaN(id) ? 0 : id };
            });
            sessionsWithId.sort((a, b) => b.id - a.id); // Descending ID
            const toRemoveSessions = sessionsWithId.slice(maxToKeep);
            toRemoveSessions.forEach(({ key }) => sessionStorage.removeItem(key));
        }
    } catch {
        // Ignore errors in cleanup
    }
}
