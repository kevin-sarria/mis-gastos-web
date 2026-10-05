import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { healthRouter } from './modules/health/health.routes';
import { errorHandler } from './shared/middleware/error-handler';
import { notFoundHandler } from './shared/middleware/not-found';

export const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.APP_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));

// Rate limiting general. Los endpoints de auth tendrán límites más estrictos en la Fase 2.
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
);

// Rutas
app.use('/api/v1/health', healthRouter);

// 404 y errores
app.use(notFoundHandler);
app.use(errorHandler);
