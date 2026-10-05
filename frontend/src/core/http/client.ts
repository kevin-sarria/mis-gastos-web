import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { ApiError } from '@/core/errors/api-error';
import type { ApiErrorPayload } from '@/core/errors/api-error';
import { tokenStorage } from '@/core/http/token-storage';

export const httpClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // el refresh token viaja en cookie httpOnly
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    // TODO (Fase 2): refresh automático del access token y reintento de la petición.
    return Promise.reject(toApiError(error));
  },
);

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
