import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/require-auth';
import { budgetController } from './budget.controller';

export const budgetRouter = Router();

budgetRouter.use(requireAuth);
budgetRouter.get('/', budgetController.list);
budgetRouter.post('/', budgetController.create);
budgetRouter.patch('/:id', budgetController.update);
budgetRouter.delete('/:id', budgetController.remove);
