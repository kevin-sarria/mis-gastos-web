import { formatMonthKey, monthRangeFromQuery } from '../../shared/utils/finance';
import { asyncHandler } from '../../shared/utils/async-handler';
import { budgetCreateSchema, budgetUpdateSchema } from './budget.schemas';
import { budgetService } from './budget.service';

export const budgetController = {
  list: asyncHandler(async (req, res) => {
    const range = monthRangeFromQuery(req.query.month);
    const budgets = await budgetService.list(req.user?.userId ?? '', range);
    res.json({ month: formatMonthKey(range), budgets });
  }),

  create: asyncHandler(async (req, res) => {
    const input = budgetCreateSchema.parse(req.body);
    const budget = await budgetService.create(req.user?.userId ?? '', input);
    res.status(201).json({ budget });
  }),

  update: asyncHandler(async (req, res) => {
    const input = budgetUpdateSchema.parse(req.body);
    const budget = await budgetService.update(req.user?.userId ?? '', req.params.id ?? '', input);
    res.json({ budget });
  }),

  remove: asyncHandler(async (req, res) => {
    await budgetService.remove(req.user?.userId ?? '', req.params.id ?? '');
    res.status(204).send();
  }),
};
