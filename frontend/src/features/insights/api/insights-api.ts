import { httpClient } from '@/core/http/client';
import type { InsightsData } from '../domain/insights';

export interface InsightsApi {
  get(): Promise<InsightsData>;
}

export const httpInsightsApi: InsightsApi = {
  async get() {
    const { data } = await httpClient.get<InsightsData>('/insights');
    return data;
  },
};
