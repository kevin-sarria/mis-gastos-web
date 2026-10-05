import type { Currency } from '@/shared/domain/currency';
import type { AuthSession, AuthUser } from '../domain/auth-user';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  currencyCode: string;
}

export interface ResetPasswordParams {
  token: string;
  password: string;
}

export interface AuthApi {
  login(input: LoginParams): Promise<AuthSession>;
  register(input: RegisterParams): Promise<AuthSession>;
  logout(): Promise<void>;
  me(): Promise<AuthUser>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(input: ResetPasswordParams): Promise<void>;
  getCurrencies(): Promise<Currency[]>;
}
