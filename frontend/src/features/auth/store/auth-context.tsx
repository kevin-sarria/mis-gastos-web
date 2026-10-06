import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { tokenStorage } from '@/core/http/token-storage';
import { httpAuthApi } from '../api/http-auth-api';
import type { RegisterParams } from '../api/auth-api';
import type { AuthSession, AuthUser } from '../domain/auth-user';
import { authStorage } from './auth-storage';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (session: AuthSession) => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authStorage.getUser());
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(tokenStorage.get()));

  useEffect(() => {
    if (!tokenStorage.get()) {
      return;
    }

    httpAuthApi
      .me()
      .then((me) => {
        authStorage.setUser(me);
        setUser(me);
      })
      .catch(() => {
        tokenStorage.clear();
        authStorage.clearUser();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const setSession = useCallback((session: AuthSession) => {
    tokenStorage.set(session.accessToken);
    authStorage.setUser(session.user);
    setUser(session.user);
  }, []);

  const updateUser = useCallback((next: AuthUser) => {
    authStorage.setUser(next);
    setUser(next);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await httpAuthApi.login({ email, password });
      setSession(session);
    },
    [setSession],
  );

  const register = useCallback(
    async (input: RegisterParams) => {
      const session = await httpAuthApi.register(input);
      setSession(session);
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    try {
      await httpAuthApi.logout();
    } catch {
      // Aunque la API falle, limpiamos la sesión local.
    }
    tokenStorage.clear();
    authStorage.clearUser();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      setSession,
      updateUser,
    }),
    [user, isLoading, login, register, logout, setSession, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
