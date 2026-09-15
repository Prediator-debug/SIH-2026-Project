import config from '@/lib/config';

/**
 * Enterprise API Client for Backend Communication
 * Centralizes URL resolution, authorization tokens, timeouts, and error handling.
 */

export function getBackendUrl(path: string): string {
  const base = config.backendApiUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export interface FetchBackendOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Unified fetch wrapper for backend FastAPI endpoints
 */
export async function fetchBackend(path: string, options: FetchBackendOptions = {}): Promise<Response> {
  const url = getBackendUrl(path);
  const { timeoutMs = 15000, headers: customHeaders, ...restOptions } = options;

  const headers = new Headers(customHeaders || {});
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Inject user auth token from localStorage if in browser environment
  if (typeof window !== 'undefined') {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${storedToken}`);
      }
    } catch {
      // Ignore storage access errors in private/sandboxed contexts
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers,
      signal: options.signal || controller.signal,
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Request to backend timed out after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Strongly typed JSON helper for backend requests
 */
export async function fetchBackendJson<T = any>(path: string, options: FetchBackendOptions = {}): Promise<T> {
  const res = await fetchBackend(path, options);
  if (!res.ok) {
    let errMessage = `Backend returned ${res.status}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson?.detail) {
        errMessage = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      } else if (errJson?.error) {
        errMessage = errJson.error;
      }
    } catch {
      // Fallback to statusText
    }
    throw new Error(errMessage);
  }
  return res.json() as Promise<T>;
}
