export type Role = 'SUPER_ADMIN' | 'USER';

export interface UserCurrency {
  code: string;
  symbol: string;
  minorUnits: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  currencyCode: string;
  currency: UserCurrency | null;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}
