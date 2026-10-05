import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/require-auth';
import { incomeController } from './income.controller';

export const incomeRouter = Router();

incomeRouter.use(requireAuth);
incomeRouter.get('/', incomeController.list);
incomeRouter.post('/', incomeController.create);
incomeRouter.patch('/:id', incomeController.update);
incomeRouter.delete('/:id', incomeController.remove);
