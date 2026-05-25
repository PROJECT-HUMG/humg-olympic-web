export const API_BASE_URL = import.meta.env.DEV
    ? '/api/v1'
    : (import.meta.env.VITE_API_BASE_URL ?? '/api/v1');
