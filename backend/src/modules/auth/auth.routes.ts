import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../shared/middleware/require-auth';
import { authController } from './auth.controller';

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: { code: 'RATE_LIMITED', message: 'Demasiados intentos, espera unos minutos' },
  },
});

export const authRouter = Router();

authRouter.post('/register', strictLimiter, authController.register);
authRouter.post('/login', strictLimiter, authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.post('/forgot-password', strictLimiter, authController.forgotPassword);
authRouter.post('/reset-password', strictLimiter, authController.resetPassword);
authRouter.get('/google', authController.googleStart);
authRouter.get('/google/callback', authController.googleCallback);
authRouter.get('/me', requireAuth, authController.me);
