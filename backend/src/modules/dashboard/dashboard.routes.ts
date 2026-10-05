import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/require-auth';
import { dashboardController } from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get('/summary', dashboardController.summary);
