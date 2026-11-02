/**
 * Axios instance for the Rental Expense Manager API.
 *
 * The web backend (Laravel + Sanctum) is the source of truth. This client:
 *   - targets the API base URL,
 *   - attaches the Sanctum bearer token to every authed request,
 *   - surfaces backend validation errors (422) as typed field errors,
 *   - retries transient network failures.
 *
 * Override API_BASE_URL before importing (e.g. from env) to point at a
 * different host/port. The default matches web/.env (APP_URL).
 */
import { AxiosInstance, AxiosError, AxiosResponse, isAxiosError, create } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiFieldErrors } from './types';

export const API_BASE_URL = 'http://localhost:8000';

const ACCESS_TOKEN_KEY = 'rem_access_token';

export const api: AxiosInstance = create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

/** Read the stored Sanctum token from AsyncStorage. */
export async function getAccessToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return raw;
  } catch {
    return null;
  }
}

/** Persist the Sanctum token so it is attached to subsequent requests. */
export async function setAccessToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Unable to persist auth token.', error);
  }
}

/** Remove the stored token on logout. */
export async function clearAccessToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
}

function isValidationException(error: AxiosError<unknown>): boolean {
  const data = error.response?.data as { message?: unknown } | undefined;
  return (
    isAxiosError(error) && (error.response?.status ?? 0) === 422 && !!data?.message
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error as AxiosError<unknown>;

    // Translate a 422 ValidationException into readable field errors.
    if (isValidationException(original)) {
      return Promise.reject({
        status: 422,
        fieldErrors: (original.response?.data as { message?: unknown })?.message as ApiFieldErrors,
        message: 'Please fix the highlighted fields and try again.',
      });
    }

    return Promise.reject(original);
  },
);

const MAX_RETRIES = 2;

async function withRetry(fn: () => Promise<AxiosResponse>): Promise<AxiosResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      // Only retry on network-level failures (no response yet), not on 4xx/5xx.
      if (isAxiosError(error) && error.code !== 'ECONNABORTED' && !error.response) {
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, Math.min(200 * 2 ** attempt, 3000)));
          continue;
        }
      }
      throw error;
    }
  }
  throw lastError;
}

api.request = ((...args) => {
  const request = api.request as unknown as Parameters<typeof api.request>[0];
  if (request) {
    return withRetry(() => api.request(request));
  }
  const config = args[0] as unknown as Parameters<typeof api.request>[0];
  return withRetry(() => api.request(config));
}) as typeof api.request;

export default api;
