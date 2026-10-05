import type { AuthUser } from '../domain/auth-user';

export interface ApiUserCurrencyDto {
  code: string;
  symbol: string;
  minorUnits: number;
}

export interface ApiUserDto {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'SUPER_ADMIN' | 'USER';
  currencyCode: string;
  currency: ApiUserCurrencyDto | null;
}

export function mapUserToDomain(dto: ApiUserDto): AuthUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    avatarUrl: dto.avatarUrl,
    role: dto.role,
    currencyCode: dto.currencyCode,
    currency: dto.currency
      ? {
          code: dto.currency.code,
          symbol: dto.currency.symbol,
          minorUnits: dto.currency.minorUnits,
        }
      : null,
  };
}
