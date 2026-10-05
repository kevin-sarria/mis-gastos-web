import type { CategoryType } from '@prisma/client';
import { asyncHandler } from '../../shared/utils/async-handler';
import { categoryCreateSchema, categoryUpdateSchema } from './category.schemas';
import { categoryService } from './category.service';

function parseType(value: unknown): CategoryType | undefined {
  return value === 'INCOME' || value === 'EXPENSE' ? value : undefined;
}

export const categoryController = {
  list: asyncHandler(async (req, res) => {
    const categories = await categoryService.listForUser(
      req.user?.userId ?? '',
      parseType(req.query.type),
    );
    res.json({ categories });
  }),

  create: asyncHandler(async (req, res) => {
    const input = categoryCreateSchema.parse(req.body);
    const category = await categoryService.create(req.user?.userId ?? '', input);
    res.status(201).json({ category });
  }),

  update: asyncHandler(async (req, res) => {
    const input = categoryUpdateSchema.parse(req.body);
    const category = await categoryService.update(req.user?.userId ?? '', req.params.id ?? '', input);
    res.json({ category });
  }),

  remove: asyncHandler(async (req, res) => {
    await categoryService.remove(req.user?.userId ?? '', req.params.id ?? '');
    res.status(204).send();
  }),
};
