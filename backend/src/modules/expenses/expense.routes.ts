import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/require-auth';
import { expenseController } from './expense.controller';

export const expenseRouter = Router();

expenseRouter.use(requireAuth);
expenseRouter.get('/', expenseController.list);
expenseRouter.post('/', expenseController.create);
expenseRouter.patch('/:id', expenseController.update);
expenseRouter.delete('/:id', expenseController.remove);
