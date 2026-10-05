import { httpClient } from '@/core/http/client';
import type { Category, CategoryType } from '../domain/category';

export interface CategoryCreateInput {
  type: CategoryType;
  name: string;
  color?: string | null;
  icon?: string | null;
}

export interface CategoryApi {
  list(type?: CategoryType): Promise<Category[]>;
  create(input: CategoryCreateInput): Promise<Category>;
}

export const httpCategoryApi: CategoryApi = {
  async list(type) {
    const { data } = await httpClient.get<{ categories: Category[] }>('/categories', {
      params: type ? { type } : undefined,
    });
    return data.categories;
  },

  async create(input) {
    const { data } = await httpClient.post<{ category: Category }>('/categories', input);
    return data.category;
  },
};
