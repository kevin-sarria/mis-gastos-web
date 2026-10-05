import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { ApiError } from '@/core/errors/api-error';
import type { ApiErrorPayload } from '@/core/errors/api-error';
import { tokenStorage } from '@/core/http/token-storage';

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

export const httpClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && shouldAttemptRefresh(original.url)) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return httpClient(original);
      }
      window.location.assign('/login');
      return Promise.reject(toApiError(error));
    }

    return Promise.reject(toApiError(error));
  },
);

function shouldAttemptRefresh(url?: string): boolean {
  if (!url) {
    return false;
  }
  const excluded = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
  return !excluded.some((endpoint) => url.includes(endpoint));
}

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      pendingQueue.push(resolve);
    });
  }

  isRefreshing = true;
  try {
    const response = await axios.post<{ accessToken: string }>(
      `${env.VITE_API_URL}/auth/refresh`,
      null,
      { withCredentials: true },
    );
    const accessToken = response.data.accessToken;
    tokenStorage.set(accessToken);
    pendingQueue.forEach((resolve) => resolve(accessToken));
    return accessToken;
  } catch {
    tokenStorage.clear();
    pendingQueue.forEach((resolve) => resolve(null));
    return null;
  } finally {
    pendingQueue = [];
    isRefreshing = false;
  }
}

function toApiError(error: AxiosError<ApiErrorPayload>): ApiError {
  if (error.response) {
    const data = error.response.data;
    return new ApiError(
      data?.message ?? 'Error del servidor',
      data?.code ?? 'UNKNOWN_ERROR',
      error.response.status,
      data?.details,
    );
  }
  return new ApiError('No se pudo conectar con el servidor', 'NETWORK_ERROR');
}
