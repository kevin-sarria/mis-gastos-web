import { formatMonthKey, monthRangeFromQuery } from '../../shared/utils/finance';
import { asyncHandler } from '../../shared/utils/async-handler';
import { incomeCreateSchema, incomeUpdateSchema } from './income.schemas';
import { incomeService } from './income.service';

export const incomeController = {
  list: asyncHandler(async (req, res) => {
    const range = monthRangeFromQuery(req.query.month);
    const incomes = await incomeService.list(req.user?.userId ?? '', range);
    res.json({ month: formatMonthKey(range), incomes });
  }),

  create: asyncHandler(async (req, res) => {
    const input = incomeCreateSchema.parse(req.body);
    const income = await incomeService.create(req.user?.userId ?? '', input);
    res.status(201).json({ income });
  }),

  update: asyncHandler(async (req, res) => {
    const input = incomeUpdateSchema.parse(req.body);
    const income = await incomeService.update(req.user?.userId ?? '', req.params.id ?? '', input);
    res.json({ income });
  }),

  remove: asyncHandler(async (req, res) => {
    await incomeService.remove(req.user?.userId ?? '', req.params.id ?? '');
    res.status(204).send();
  }),
};
