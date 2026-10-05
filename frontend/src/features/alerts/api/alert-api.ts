import { httpClient } from '@/core/http/client';
import type { Alert } from '../domain/alert';

export interface AlertApi {
  list(): Promise<Alert[]>;
  markRead(id: string): Promise<void>;
}

export const httpAlertApi: AlertApi = {
  async list() {
    const { data } = await httpClient.get<{ alerts: Alert[] }>('/alerts');
    return data.alerts;
  },

  async markRead(id) {
    await httpClient.patch(`/alerts/${id}/read`);
  },
};
