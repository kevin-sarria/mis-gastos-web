import { httpClient } from '@/core/http/client';
import { mapExpense } from '../domain/expense';
import type { Expense, ExpenseCreateInput, ExpenseDto } from '../domain/expense';

export interface ExpenseApi {
  list(month: string): Promise<Expense[]>;
  create(input: ExpenseCreateInput): Promise<Expense>;
  update(id: string, input: Partial<ExpenseCreateInput>): Promise<Expense>;
  remove(id: string): Promise<void>;
}

export const httpExpenseApi: ExpenseApi = {
  async list(month) {
    const { data } = await httpClient.get<{ expenses: ExpenseDto[] }>('/expenses', {
      params: { month },
    });
    return data.expenses.map((expense) => mapExpense(expense));
  },

  async create(input) {
    const { data } = await httpClient.post<{ expense: ExpenseDto }>('/expenses', input);
    return mapExpense(data.expense);
  },

  async update(id, input) {
    const { data } = await httpClient.patch<{ expense: ExpenseDto }>(`/expenses/${id}`, input);
    return mapExpense(data.expense);
  },

  async remove(id) {
    await httpClient.delete(`/expenses/${id}`);
  },
};
