import { httpClient } from '@/core/http/client';
import type { Currency } from '@/shared/domain/currency';

export interface CurrencyCreateInput {
  code: string;
  name: string;
  symbol: string;
  minorUnits: number;
}

export const httpCurrencyAdminApi = {
  async listAll(): Promise<Currency[]> {
    const { data } = await httpClient.get<{ currencies: Currency[] }>('/currencies/all');
    return data.currencies;
  },

  async create(input: CurrencyCreateInput): Promise<Currency> {
    const { data } = await httpClient.post<{ currency: Currency }>('/currencies', input);
    return data.currency;
  },
};
