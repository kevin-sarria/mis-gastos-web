import type { CategoryType } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../../shared/errors/app-error';
import { categoryRepository } from './category.repository';
import type { CategoryCreateInput, CategoryUpdateInput } from './category.schemas';

export const categoryService = {
  listForUser(userId: string, type?: CategoryType) {
    return categoryRepository.listForUser(userId, type);
  },

  create(userId: string, input: CategoryCreateInput) {
    return categoryRepository.create(userId, input);
  },

  async update(userId: string, id: string, input: CategoryUpdateInput) {
    const category = await this.getOwnedCategory(userId, id);
    return categoryRepository.update(category.id, input);
  },

  async remove(userId: string, id: string) {
    const category = await this.getOwnedCategory(userId, id);
    return categoryRepository.remove(category.id);
  },

  async getOwnedCategory(userId: string, id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Categoría no encontrada');
    }
    if (category.userId !== userId) {
      throw new ForbiddenError('No puedes modificar una categoría por defecto');
    }
    return category;
  },
};
