import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageSpecificSuggestions, getDefaultSuggestions } from '../constants/aiSuggestions';

const SUGGESTION_INTERVAL = 15 * 60 * 1000;
const INITIAL_DELAY = 5000;

export const useAISuggestions = (isChatOpen: boolean) => {
    const location = useLocation();

    const currentView = location.pathname === '/'
        ? 'home'
        : location.pathname.substring(1).split('/')[0];

    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const pickSuggestion = useCallback(() => {
        if (isChatOpen) return;

        const pageMap = getPageSpecificSuggestions();
        const specificList = pageMap[currentView] || [];
        const combinedList = [...specificList, ...getDefaultSuggestions()];

        const uniqueList = Array.from(new Set(combinedList));
        const randomItem = uniqueList[Math.floor(Math.random() * uniqueList.length)];

        setSuggestion(randomItem);
        setIsVisible(true);
    }, [currentView, isChatOpen]);

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        setIsVisible(false);
        if (!isChatOpen) {
            timeoutRef.current = setTimeout(() => {
                pickSuggestion();

                intervalRef.current = setInterval(pickSuggestion, SUGGESTION_INTERVAL);
            }, INITIAL_DELAY);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [currentView, isChatOpen, pickSuggestion]);

    const dismissSuggestion = () => {
        setIsVisible(false);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(pickSuggestion, SUGGESTION_INTERVAL);
    };

    return {
        suggestion,
        isVisible,
        dismissSuggestion
    };
};