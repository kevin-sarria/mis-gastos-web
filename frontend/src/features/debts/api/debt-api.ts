import { httpClient } from '@/core/http/client';
import type {
  Debt,
  DebtCreateInput,
  DebtsData,
  PayoffPlan,
  SimulationResult,
} from '../domain/debt';

export interface SimulatorInput {
  amountMinorUnits: number;
  monthlyRateMicro: number;
  months?: number;
  paymentMinorUnits?: number;
}

export interface PaymentInput {
  amountMinorUnits: number;
  date: string;
  note?: string | null;
}

export interface DebtApi {
  list(): Promise<DebtsData>;
  create(input: DebtCreateInput): Promise<Debt>;
  update(id: string, input: Partial<DebtCreateInput>): Promise<Debt>;
  remove(id: string): Promise<void>;
  addPayment(id: string, input: PaymentInput): Promise<Debt>;
  simulate(input: SimulatorInput): Promise<SimulationResult>;
  payoffPlan(extraMinorUnits: number): Promise<PayoffPlan>;
}

export const httpDebtApi: DebtApi = {
  async list() {
    const { data } = await httpClient.get<DebtsData>('/debts');
    return data;
  },

  async create(input) {
    const { data } = await httpClient.post<{ debt: Debt }>('/debts', input);
    return data.debt;
  },

  async update(id, input) {
    const { data } = await httpClient.patch<{ debt: Debt }>(`/debts/${id}`, input);
    return data.debt;
  },

  async remove(id) {
    await httpClient.delete(`/debts/${id}`);
  },

  async addPayment(id, input) {
    const { data } = await httpClient.post<{ debt: Debt }>(`/debts/${id}/payments`, input);
    return data.debt;
  },

  async simulate(input) {
    const { data } = await httpClient.post<{ simulation: SimulationResult }>(
      '/debts/simulator',
      input,
    );
    return data.simulation;
  },

  async payoffPlan(extraMinorUnits) {
    const { data } = await httpClient.get<PayoffPlan>('/debts/payoff-plan', {
      params: { extra: extraMinorUnits },
    });
    return data;
  },
};
