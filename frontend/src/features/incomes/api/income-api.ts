import { httpClient } from '@/core/http/client';
import type { Income, IncomeCreateInput } from '../domain/income';

export interface IncomeApi {
  list(): Promise<Income[]>;
  create(input: IncomeCreateInput): Promise<Income>;
  remove(id: string): Promise<void>;
}

export const httpIncomeApi: IncomeApi = {
  async list() {
    const { data } = await httpClient.get<{ incomes: Income[] }>('/incomes');
    return data.incomes;
  },

  async create(input) {
    const { data } = await httpClient.post<{ income: Income }>('/incomes', input);
    return data.income;
  },

  async remove(id) {
    await httpClient.delete(`/incomes/${id}`);
  },
};
