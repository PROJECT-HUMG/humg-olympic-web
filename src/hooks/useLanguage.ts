import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

const STORAGE_KEY = 'app_language';

export type AppLanguage = 'vi' | 'en';

export const LANGUAGES: { code: AppLanguage; label: string; flag: string }[] = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
];

export function useLanguage() {
    const { t, i18n } = useTranslation();

    const language = i18n.language as AppLanguage;

    const setLanguage = useCallback((lang: AppLanguage) => {
        i18n.changeLanguage(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    }, [i18n]);

    return { t, language, setLanguage };
}
