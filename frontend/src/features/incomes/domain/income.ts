export type IncomeFrequency = 'ONE_TIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface IncomeCategory {
  id: string;
  name: string;
  color: string | null;
}

export interface Income {
  id: string;
  categoryId: string;
  title: string;
  amountMinorUnits: number;
  frequency: IncomeFrequency;
  date: string;
  note: string | null;
  category: IncomeCategory | null;
}

export interface IncomeCreateInput {
  categoryId: string;
  title: string;
  amountMinorUnits: number;
  frequency: IncomeFrequency;
  date: string;
  note?: string | null;
}
