import i18n from '@/i18n';
import { getErrorMessage } from '@/lib/api/errorMapping';

const t = (key: string) => i18n.t(key);

/**
 * Look up a translated settings message by code.
 * Falls back to error namespace, then to a default.
 */
export const getSettingsMessage = (code: string, defaultMessage?: string): string => {
    const settingsKey = `settings:${code}`;
    const translated = i18n.t(settingsKey);

    // i18next returns the key when no translation is found
    if (translated !== settingsKey) return translated;

    // Try error namespace as fallback (some codes like INVALID_CURRENT_PASSWORD exist there too)
    return getErrorMessage(code, defaultMessage || t('common:error'));
};
