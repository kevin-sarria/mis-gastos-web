import { httpClient } from '@/core/http/client';
import type { Category, CategoryType } from '../domain/category';

export interface CategoryCreateInput {
  type: CategoryType;
  name: string;
  color?: string | null;
  icon?: string | null;
}

export interface CategoryUpdateInput {
  name?: string;
  color?: string | null;
}

export interface CategoryApi {
  list(type?: CategoryType): Promise<Category[]>;
  create(input: CategoryCreateInput): Promise<Category>;
  update(id: string, input: CategoryUpdateInput): Promise<Category>;
  remove(id: string): Promise<void>;
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

  async update(id, input) {
    const { data } = await httpClient.patch<{ category: Category }>(`/categories/${id}`, input);
    return data.category;
  },

  async remove(id) {
    await httpClient.delete(`/categories/${id}`);
  },
};
