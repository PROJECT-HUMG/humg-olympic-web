/**
 * Shared avatar URL utilities.
 * Centralises fallback logic so every <img> that shows a user/team avatar
 * resolves to a usable URL — even when the backend returns null/undefined.
 */

const UI_AVATARS_BASE = 'https://ui-avatars.com/api/';

/** Build a deterministic letter-avatar URL from a display name. */
const buildFallback = (name: string): string =>
    `${UI_AVATARS_BASE}?name=${encodeURIComponent(name || '?')}&background=random&color=fff`;

/**
 * Return `url` when it is a non-empty string, otherwise a generated
 * letter-avatar fallback derived from `name`.
 *
 * @example
 * <img src={getAvatarUrl(user.avatarUrl, user.fullName)} />
 */
export const getAvatarUrl = (
    url: string | null | undefined,
    name: string,
): string => (url ? url : buildFallback(name));

/**
 * `onError` handler for avatar `<img>` elements.
 * Swaps the broken src to the letter-avatar fallback so the user never
 * sees a broken-image icon.
 *
 * @example
 * <img
 *   src={getAvatarUrl(user.avatarUrl, user.fullName)}
 *   onError={(e) => handleAvatarError(e, user.fullName)}
 * />
 */
export const handleAvatarError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    name: string,
): void => {
    const target = e.currentTarget;
    const fallback = buildFallback(name);
    // Prevent infinite loop when fallback itself fails
    if (target.src !== fallback) {
        target.src = fallback;
    }
};
