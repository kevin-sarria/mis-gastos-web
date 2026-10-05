import { asyncHandler } from '../../shared/utils/async-handler';
import { currencyCreateSchema, currencyUpdateSchema } from './currency.schemas';
import { currencyService } from './currency.service';

export const currencyController = {
  list: asyncHandler(async (_req, res) => {
    const currencies = await currencyService.listActive();
    res.json({ currencies });
  }),

  listAll: asyncHandler(async (_req, res) => {
    const currencies = await currencyService.listAll();
    res.json({ currencies });
  }),

  create: asyncHandler(async (req, res) => {
    const input = currencyCreateSchema.parse(req.body);
    const currency = await currencyService.create(input);
    res.status(201).json({ currency });
  }),

  update: asyncHandler(async (req, res) => {
    const { code } = req.params;
    if (!code) {
      throw new Error('Falta el código de moneda');
    }
    const input = currencyUpdateSchema.parse(req.body);
    const currency = await currencyService.update(code, input);
    res.json({ currency });
  }),
};
