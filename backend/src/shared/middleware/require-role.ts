import type { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../errors/app-error';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('No autenticado'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('No tienes permisos para realizar esta acción'));
      return;
    }
    next();
  };
}
