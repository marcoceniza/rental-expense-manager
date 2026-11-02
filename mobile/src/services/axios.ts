/**
 * Axios instance for the Rental Expense Manager API.
 *
 * The web backend (Laravel + Sanctum) is the source of truth. This client:
 *   - targets the API base URL,
 *   - attaches the Sanctum bearer token to every authenticated request,
 *   - surfaces backend validation errors as typed field errors,
 *   - retries transient network failures for safe requests.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  create,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios';
import type { ApiFieldErrors } from './types';

export const API_BASE_URL = 'http://localhost:8000';

const ACCESS_TOKEN_KEY = 'rem_access_token';
const MAX_RETRIES = 2;

interface RetryConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

interface ValidationErrorResponse {
  errors?: ApiFieldErrors;
}

export const api: AxiosInstance = create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token: string): Promise<void> {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.set('Authorization', 'Bearer ' + token);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    const config = error.config as RetryConfig | undefined;
    const method = config?.method?.toUpperCase();
    const canRetry =
      config &&
      !error.response &&
      error.code !== 'ECONNABORTED' &&
      ['GET', 'HEAD', 'OPTIONS'].includes(method ?? '') &&
      (config.retryCount ?? 0) < MAX_RETRIES;

    if (canRetry) {
      config.retryCount = (config.retryCount ?? 0) + 1;
      const retryCount = config.retryCount;
      await new Promise((resolve) =>
        setTimeout(resolve, 200 * 2 ** (retryCount - 1)),
      );
      return api.request(config);
    }

    if (error.response?.status === 422) {
      const data = error.response.data as ValidationErrorResponse | undefined;
      if (data?.errors) {
        return Promise.reject({
          status: 422,
          fieldErrors: data.errors,
          message: 'Please fix the highlighted fields and try again.',
        });
      }
    }

    return Promise.reject(error);
  },
);

export default api;
