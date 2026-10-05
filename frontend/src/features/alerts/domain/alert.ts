export type AlertType = 'OVER_BUDGET' | 'NEAR_BUDGET' | 'ANOMALY';

export interface Alert {
  id: string;
  type: AlertType;
  severity: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}
