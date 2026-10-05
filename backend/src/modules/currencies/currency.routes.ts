import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/require-auth';
import { requireRole } from '../../shared/middleware/require-role';
import { currencyController } from './currency.controller';

export const currencyRouter = Router();

// Pública: el registro necesita listar monedas activas.
currencyRouter.get('/', currencyController.list);

// Solo super admin.
currencyRouter.get('/all', requireAuth, requireRole('SUPER_ADMIN'), currencyController.listAll);
currencyRouter.post('/', requireAuth, requireRole('SUPER_ADMIN'), currencyController.create);
currencyRouter.patch('/:code', requireAuth, requireRole('SUPER_ADMIN'), currencyController.update);
