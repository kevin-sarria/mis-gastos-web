import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';
import { AppError } from '../errors/app-error';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: error.flatten(),
      },
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: { code: error.code, message: error.message, details: error.details },
    });
    return;
  }

  const multerLike = error as { name?: string; code?: string } | null;
  if (multerLike?.name === 'MulterError') {
    const message =
      multerLike.code === 'LIMIT_FILE_SIZE'
        ? 'El archivo supera el tamaño máximo (10 MB)'
        : 'Error al subir el archivo';
    res.status(400).json({ error: { code: 'UPLOAD_ERROR', message } });
    return;
  }

  logger.error({ err: error }, 'Error no controlado');

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado',
      ...(env.NODE_ENV === 'development' ? { details: String(error) } : {}),
    },
  });
}
