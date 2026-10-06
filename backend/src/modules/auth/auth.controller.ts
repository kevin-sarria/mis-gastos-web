import type { Request, Response } from 'express';
import { env } from '../../config/env';
import { ValidationError } from '../../shared/errors/app-error';
import { asyncHandler } from '../../shared/utils/async-handler';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from './auth.schemas';
import { authService } from './auth.service';
import type { RequestMeta } from './auth.service';
import { googleOAuth } from './oauth/google.service';

const REFRESH_COOKIE = 'refresh_token';

function requestMeta(req: Request): RequestMeta {
  return { userAgent: req.headers['user-agent'] ?? null, ip: req.ip ?? null };
}

function setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: expiresAt.getTime() - Date.now(),
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
}

function readRefreshCookie(req: Request): string | null {
  const value = req.cookies?.[REFRESH_COOKIE];
  return typeof value === 'string' ? value : null;
}

export const authController = {
  register: asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input, requestMeta(req));
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.status(201).json({ user: result.user, accessToken: result.accessToken });
  }),

  login: asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input, requestMeta(req));
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.json({ user: result.user, accessToken: result.accessToken });
  }),

  refresh: asyncHandler(async (req, res) => {
    const rawToken = readRefreshCookie(req);
    if (!rawToken) {
      throw new ValidationError('No hay sesión activa');
    }
    const result = await authService.refresh(rawToken, requestMeta(req));
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.json({ user: result.user, accessToken: result.accessToken });
  }),

  logout: asyncHandler(async (req, res) => {
    const rawToken = readRefreshCookie(req);
    await authService.logout(rawToken ?? '');
    clearRefreshCookie(res);
    res.status(204).send();
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const input = forgotPasswordSchema.parse(req.body);
    await authService.forgotPassword(input.email);
    res.status(202).json({ message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña' });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const input = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(input);
    res.json({ message: 'Contraseña actualizada correctamente' });
  }),

  googleStart: (_req: Request, res: Response) => {
    res.redirect(googleOAuth.buildAuthUrl());
  },

  googleCallback: asyncHandler(async (req, res) => {
    const code = req.query.code;
    if (typeof code !== 'string') {
      throw new ValidationError('Falta el código de autorización');
    }
    const result = await authService.googleLogin(code, requestMeta(req));
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.redirect(`${env.APP_URL}/auth/google?token=${result.accessToken}`);
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user?.userId ?? '');
    res.json({ user });
  }),

  updateMe: asyncHandler(async (req, res) => {
    const input = updateProfileSchema.parse(req.body);
    const user = await authService.updateProfile(req.user?.userId ?? '', input);
    res.json({ user });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const input = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.user?.userId ?? '', input);
    res.json({ message: 'Contraseña actualizada correctamente' });
  }),
};
