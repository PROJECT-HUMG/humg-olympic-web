import i18n from '@/i18n';

/**
 * Look up a translated error message by error code.
 * Uses i18next's `errors` namespace so the message respects the current language.
 */
export const getErrorMessage = (code: string, defaultMessage?: string): string => {
    const key = `errors:${code}`;
    const translated = i18n.t(key);

    // i18next returns the key when no translation is found
    if (translated === key) {
        return defaultMessage || i18n.t('errors:DEFAULT');
    }

    return translated;
};
