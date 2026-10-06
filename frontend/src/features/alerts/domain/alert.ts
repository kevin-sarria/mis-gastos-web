export type AlertType = 'OVER_BUDGET' | 'NEAR_BUDGET' | 'ANOMALY';

export interface AlertParams {
  budgetName?: string;
  spentMinorUnits?: number;
  limitMinorUnits?: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: string;
  params: AlertParams;
  readAt: string | null;
  createdAt: string;
}
