import { httpClient } from '@/core/http/client';
import type { Budget, BudgetCreateInput } from '../domain/budget';

export interface BudgetApi {
  list(): Promise<Budget[]>;
  create(input: BudgetCreateInput): Promise<Budget>;
  remove(id: string): Promise<void>;
}

export const httpBudgetApi: BudgetApi = {
  async list() {
    const { data } = await httpClient.get<{ budgets: Budget[] }>('/budgets');
    return data.budgets;
  },

  async create(input) {
    const { data } = await httpClient.post<{ budget: Budget }>('/budgets', input);
    return data.budget;
  },

  async remove(id) {
    await httpClient.delete(`/budgets/${id}`);
  },
};
