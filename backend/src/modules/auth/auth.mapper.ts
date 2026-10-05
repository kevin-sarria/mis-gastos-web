import type { Currency, Role, User } from '@prisma/client';

export interface PublicUserCurrency {
  code: string;
  symbol: string;
  minorUnits: number;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  currencyCode: string;
  currency: PublicUserCurrency | null;
}

type UserWithCurrency = User & { currency?: Currency | null };

export function toPublicUser(user: UserWithCurrency): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    currencyCode: user.currencyCode,
    currency: user.currency
      ? {
          code: user.currency.code,
          symbol: user.currency.symbol,
          minorUnits: user.currency.minorUnits,
        }
      : null,
  };
}
