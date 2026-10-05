import type { NextFunction, Request, Response } from 'express';
import { tokenService } from '../../modules/auth/token.service';
import { UnauthorizedError } from '../errors/app-error';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new UnauthorizedError('No autenticado'));
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = tokenService.verifyAccessToken(token);
    next();
  } catch {
    next(new UnauthorizedError('Sesión inválida o expirada'));
  }
}
