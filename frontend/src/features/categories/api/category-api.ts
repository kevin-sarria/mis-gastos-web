import { httpClient } from '@/core/http/client';
import type { Category, CategoryType } from '../domain/category';

export interface CategoryApi {
  list(type?: CategoryType): Promise<Category[]>;
}

export const httpCategoryApi: CategoryApi = {
  async list(type) {
    const { data } = await httpClient.get<{ categories: Category[] }>('/categories', {
      params: type ? { type } : undefined,
    });
    return data.categories;
  },
};
