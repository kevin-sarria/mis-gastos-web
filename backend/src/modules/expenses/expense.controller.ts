import { asyncHandler } from '../../shared/utils/async-handler';
import { expenseCreateSchema, expenseUpdateSchema } from './expense.schemas';
import { expenseService } from './expense.service';

export const expenseController = {
  list: asyncHandler(async (req, res) => {
    const expenses = await expenseService.list(req.user?.userId ?? '');
    res.json({ expenses });
  }),

  create: asyncHandler(async (req, res) => {
    const input = expenseCreateSchema.parse(req.body);
    const expense = await expenseService.create(req.user?.userId ?? '', input);
    res.status(201).json({ expense });
  }),

  update: asyncHandler(async (req, res) => {
    const input = expenseUpdateSchema.parse(req.body);
    const expense = await expenseService.update(req.user?.userId ?? '', req.params.id ?? '', input);
    res.json({ expense });
  }),

  remove: asyncHandler(async (req, res) => {
    await expenseService.remove(req.user?.userId ?? '', req.params.id ?? '');
    res.status(204).send();
  }),
};
