import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/require-auth';
import { debtController } from './debt.controller';

export const debtRouter = Router();

debtRouter.use(requireAuth);

// Rutas específicas antes de /:id
debtRouter.post('/simulator', debtController.simulate);
debtRouter.get('/payoff-plan', debtController.payoffPlan);
debtRouter.get('/plan', debtController.getPlan);
debtRouter.put('/plan', debtController.savePlan);
debtRouter.delete('/plan', debtController.removePlan);

debtRouter.get('/', debtController.list);
debtRouter.post('/', debtController.create);
debtRouter.get('/:id', debtController.get);
debtRouter.patch('/:id', debtController.update);
debtRouter.delete('/:id', debtController.remove);
debtRouter.post('/:id/payments', debtController.addPayment);
