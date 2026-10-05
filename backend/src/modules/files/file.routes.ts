import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/require-auth';
import { fileController } from './file.controller';

export const fileRouter = Router();

fileRouter.use(requireAuth);
fileRouter.post('/expenses/:expenseId/attachments', fileController.upload);
fileRouter.get('/expenses/:expenseId/attachments', fileController.list);
fileRouter.delete('/attachments/:id', fileController.remove);
