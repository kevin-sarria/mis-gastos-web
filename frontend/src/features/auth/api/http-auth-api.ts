import { httpClient } from '@/core/http/client';
import type { Currency } from '@/shared/domain/currency';
import type { AuthSession } from '../domain/auth-user';
import { mapUserToDomain } from '../mappers/auth.mapper';
import type { ApiUserDto } from '../mappers/auth.mapper';
import type { AuthApi } from './auth-api';

interface AuthResponseDto {
  user: ApiUserDto;
  accessToken: string;
}

export const httpAuthApi: AuthApi = {
  async login(input) {
    const { data } = await httpClient.post<AuthResponseDto>('/auth/login', input);
    return toSession(data);
  },

  async register(input) {
    const { data } = await httpClient.post<AuthResponseDto>('/auth/register', input);
    return toSession(data);
  },

  async logout() {
    await httpClient.post('/auth/logout');
  },

  async me() {
    const { data } = await httpClient.get<{ user: ApiUserDto }>('/auth/me');
    return mapUserToDomain(data.user);
  },

  async forgotPassword(email) {
    await httpClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(input) {
    await httpClient.post('/auth/reset-password', input);
  },

  async getCurrencies() {
    const { data } = await httpClient.get<{ currencies: Currency[] }>('/currencies');
    return data.currencies;
  },

  async updateProfile(input) {
    const { data } = await httpClient.patch<{ user: ApiUserDto }>('/auth/me', input);
    return mapUserToDomain(data.user);
  },

  async changePassword(input) {
    await httpClient.post('/auth/me/password', input);
  },
};

function toSession(dto: AuthResponseDto): AuthSession {
  return { user: mapUserToDomain(dto.user), accessToken: dto.accessToken };
}
