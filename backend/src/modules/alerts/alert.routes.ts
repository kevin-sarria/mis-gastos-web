import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/require-auth';
import { alertController } from './alert.controller';

export const alertRouter = Router();

alertRouter.use(requireAuth);
alertRouter.get('/', alertController.list);
alertRouter.patch('/:id/read', alertController.markRead);
