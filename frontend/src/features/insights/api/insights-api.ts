import { httpClient } from '@/core/http/client';
import type { InsightsData } from '../domain/insights';

export interface InsightsApi {
  get(month: string): Promise<InsightsData>;
}

export const httpInsightsApi: InsightsApi = {
  async get(month) {
    const { data } = await httpClient.get<InsightsData>('/insights', { params: { month } });
    return data;
  },
};
