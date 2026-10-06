import { httpClient } from '@/core/http/client';
import type { DashboardSummary } from '../domain/dashboard';

export interface DashboardApi {
  summary(month: string): Promise<DashboardSummary>;
}

export const httpDashboardApi: DashboardApi = {
  async summary(month) {
    const { data } = await httpClient.get<DashboardSummary>('/dashboard/summary', {
      params: { month },
    });
    return data;
  },
};
