import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/require-auth';
import { insightsController } from './insights.controller';

export const insightsRouter = Router();

insightsRouter.use(requireAuth);
insightsRouter.get('/', insightsController.get);
