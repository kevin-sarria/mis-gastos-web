import { asyncHandler } from '../../shared/utils/async-handler';
import {
  debtCreateSchema,
  debtUpdateSchema,
  payoffPlanSchema,
  paymentCreateSchema,
  planSaveSchema,
  simulatorSchema,
} from './debt.schemas';
import { debtService } from './debt.service';

export const debtController = {
  list: asyncHandler(async (req, res) => {
    const result = await debtService.list(req.user?.userId ?? '');
    res.json(result);
  }),

  get: asyncHandler(async (req, res) => {
    const debt = await debtService.get(req.user?.userId ?? '', req.params.id ?? '');
    res.json({ debt });
  }),

  create: asyncHandler(async (req, res) => {
    const input = debtCreateSchema.parse(req.body);
    const debt = await debtService.create(req.user?.userId ?? '', input);
    res.status(201).json({ debt });
  }),

  update: asyncHandler(async (req, res) => {
    const input = debtUpdateSchema.parse(req.body);
    const debt = await debtService.update(req.user?.userId ?? '', req.params.id ?? '', input);
    res.json({ debt });
  }),

  remove: asyncHandler(async (req, res) => {
    await debtService.remove(req.user?.userId ?? '', req.params.id ?? '');
    res.status(204).send();
  }),

  addPayment: asyncHandler(async (req, res) => {
    const input = paymentCreateSchema.parse(req.body);
    const debt = await debtService.addPayment(req.user?.userId ?? '', req.params.id ?? '', input);
    res.status(201).json({ debt });
  }),

  simulate: asyncHandler(async (req, res) => {
    const input = simulatorSchema.parse(req.body);
    res.json({ simulation: debtService.simulate(input) });
  }),

  payoffPlan: asyncHandler(async (req, res) => {
    const input = payoffPlanSchema.parse({
      extraMonthlyMinorUnits: Number(req.query.extra ?? 0),
    });
    const plan = await debtService.payoffPlan(req.user?.userId ?? '', input);
    res.json(plan);
  }),

  getPlan: asyncHandler(async (req, res) => {
    const plan = await debtService.currentMonthPlan(req.user?.userId ?? '');
    res.json({ plan });
  }),

  savePlan: asyncHandler(async (req, res) => {
    const input = planSaveSchema.parse(req.body);
    const plan = await debtService.savePlan(req.user?.userId ?? '', input);
    res.json({ plan });
  }),

  removePlan: asyncHandler(async (req, res) => {
    await debtService.deletePlan(req.user?.userId ?? '');
    res.status(204).send();
  }),
};
