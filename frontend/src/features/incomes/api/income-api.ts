import { httpClient } from '@/core/http/client';
import type { Income, IncomeCreateInput } from '../domain/income';

export interface IncomeApi {
  list(month: string): Promise<Income[]>;
  create(input: IncomeCreateInput): Promise<Income>;
  update(id: string, input: Partial<IncomeCreateInput>): Promise<Income>;
  remove(id: string): Promise<void>;
}

export const httpIncomeApi: IncomeApi = {
  async list(month) {
    const { data } = await httpClient.get<{ incomes: Income[] }>('/incomes', {
      params: { month },
    });
    return data.incomes;
  },

  async create(input) {
    const { data } = await httpClient.post<{ income: Income }>('/incomes', input);
    return data.income;
  },

  async update(id, input) {
    const { data } = await httpClient.patch<{ income: Income }>(`/incomes/${id}`, input);
    return data.income;
  },

  async remove(id) {
    await httpClient.delete(`/incomes/${id}`);
  },
};
