import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/require-auth';
import { categoryController } from './category.controller';

export const categoryRouter = Router();

categoryRouter.use(requireAuth);
categoryRouter.get('/', categoryController.list);
categoryRouter.post('/', categoryController.create);
categoryRouter.patch('/:id', categoryController.update);
categoryRouter.delete('/:id', categoryController.remove);
