import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'node:path';
import { pinoHttp } from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { alertRouter } from './modules/alerts/alert.routes';
import { authRouter } from './modules/auth/auth.routes';
import { budgetRouter } from './modules/budgets/budget.routes';
import { categoryRouter } from './modules/categories/category.routes';
import { currencyRouter } from './modules/currencies/currency.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { expenseRouter } from './modules/expenses/expense.routes';
import { fileRouter } from './modules/files/file.routes';
import { healthRouter } from './modules/health/health.routes';
import { incomeRouter } from './modules/incomes/income.routes';
import { insightsRouter } from './modules/insights/insights.routes';
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
app.use(cookieParser());
app.use(pinoHttp({ logger }));

// Archivos subidos (implementación local de desarrollo).
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Rate limiting general. Los endpoints de auth tienen límites más estrictos.
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
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/currencies', currencyRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/incomes', incomeRouter);
app.use('/api/v1/expenses', expenseRouter);
app.use('/api/v1/files', fileRouter);
app.use('/api/v1/budgets', budgetRouter);
app.use('/api/v1/alerts', alertRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/insights', insightsRouter);

// 404 y errores
app.use(notFoundHandler);
app.use(errorHandler);
