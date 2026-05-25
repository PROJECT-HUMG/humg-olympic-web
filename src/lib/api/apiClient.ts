import { API_BASE_URL } from '@/lib/api/apiConfig';
import { getErrorMessage } from '@/lib/api/errorMapping';
import i18n from '@/i18n';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly originalMessage: string;

  constructor(message: string, code: string, status: number, originalMessage?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.originalMessage = originalMessage ?? message;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig extends Omit<RequestInit, 'body' | 'method'> { }

class RefreshController {
  private refreshPromise: Promise<string> | null = null;
  private logoutDispatching = false;
  private _suppressLogout = false;

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  setAccessToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  suppressLogout(suppress: boolean): void {
    this._suppressLogout = suppress;
  }

  clearAuth(): void {
    if (this.logoutDispatching || this._suppressLogout) return;
    this.logoutDispatching = true;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth:logout'));
    queueMicrotask(() => {
      this.logoutDispatching = false;
    });
  }

  async refreshToken(): Promise<string> {
    this.refreshPromise ??= this._doRefresh().finally(() => {
      this.refreshPromise = null;
    });
    return this.refreshPromise;
  }

  private async _doRefresh(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      this.clearAuth();
      throw new Error(i18n.t('common:apiError.refreshFailed'));
    }

    const data = await response.json();
    const newToken: string | undefined = data.accessToken ?? data.token;

    if (!newToken) {
      this.clearAuth();
      throw new Error(i18n.t('common:apiError.noToken'));
    }

    this.setAccessToken(newToken);
    window.dispatchEvent(new CustomEvent('auth:token_refreshed'));
    return newToken;
  }
}

const rc = new RefreshController();

function buildHeaders(
  existing: HeadersInit | undefined,
  body: BodyInit | null | undefined,
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (existing instanceof Headers) {
    existing.forEach((v, k) => { headers[k] = v; });
  } else if (Array.isArray(existing)) {
    existing.forEach(([k, v]) => { headers[k] = v; });
  } else if (existing) {
    Object.assign(headers, existing);
  }
  if (body instanceof FormData) {
    delete headers['Content-Type'];
  } else if (body !== undefined && body !== null) {
    headers['Content-Type'] ??= 'application/json';
  }
  const token = rc.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function fetchWithAuth(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const token = rc.getAccessToken();
  let response = await fetch(url, init);

  if (response.status === 401 && token !== null) {
    try {
      const newToken = await rc.refreshToken();
      const refreshedHeaders = { ...(init.headers as Record<string, string>), Authorization: `Bearer ${newToken}` };
      response = await fetch(url, { ...init, headers: refreshedHeaders });
    } catch {
    }
  }

  return response;
}

async function request<T>(
  endpoint: string,
  method: HttpMethod,
  body?: unknown,
  config: RequestConfig = {},
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const serialisedBody: BodyInit | undefined =
    body instanceof FormData ? body :
      body !== undefined ? JSON.stringify(body) :
        undefined;

  const headers = buildHeaders(config.headers, serialisedBody);
  const init: RequestInit = { ...config, method, headers, credentials: 'include', body: serialisedBody };

  const response = await fetchWithAuth(url, init);

  if (!response.ok) {
    return handleErrorResponse(response);
  }

  return parseResponse<T>(response);
}
const STATUS_TO_ERROR_CODE: Record<number, string> = {
  429: 'RATE_LIMIT_EXCEEDED',
  502: 'SERVICE_UNAVAILABLE',
  503: 'SERVICE_UNAVAILABLE',
  504: 'SERVICE_UNAVAILABLE',
};

async function handleErrorResponse(response: Response): Promise<never> {
  const errorData = await response.json().catch(() => ({}));

  if (response.status === 401) {
    rc.clearAuth();
  }

  const originalMessage: string =
    errorData.message ?? i18n.t('common:apiError.fallback', { status: response.status });
  const errorCode: string =
    errorData.code ?? STATUS_TO_ERROR_CODE[response.status] ?? 'UNKNOWN_ERROR';
  const translatedMessage = getErrorMessage(errorCode, originalMessage);

  throw new ApiError(translatedMessage, errorCode, response.status, originalMessage);
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}

export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, 'GET', undefined, config),

  post: <T>(endpoint: string, body: unknown, config?: RequestConfig) =>
    request<T>(endpoint, 'POST', body, config),

  put: <T>(endpoint: string, body: unknown, config?: RequestConfig) =>
    request<T>(endpoint, 'PUT', body, config),

  patch: <T>(endpoint: string, body: unknown, config?: RequestConfig) =>
    request<T>(endpoint, 'PATCH', body, config),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, 'DELETE', undefined, config),
} as const;

export const suppressAutoLogout = (suppress: boolean) => rc.suppressLogout(suppress);

export async function authenticatedFetch(
  url: string,
  config: RequestInit = {},
): Promise<Response> {
  const headers = buildHeaders(config.headers, config.body as BodyInit | undefined);
  return fetchWithAuth(url, { ...config, headers, credentials: 'include' });
}