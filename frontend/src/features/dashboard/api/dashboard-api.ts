import { httpClient } from '@/core/http/client';
import type { DashboardSummary } from '../domain/dashboard';

export interface DashboardApi {
  summary(): Promise<DashboardSummary>;
}

export const httpDashboardApi: DashboardApi = {
  async summary() {
    const { data } = await httpClient.get<DashboardSummary>('/dashboard/summary');
    return data;
  },
};
