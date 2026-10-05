import { useQuery } from '@tanstack/react-query';
import { httpAuthApi } from '../api/http-auth-api';

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies', 'active'],
    queryFn: () => httpAuthApi.getCurrencies(),
    staleTime: 5 * 60 * 1000,
  });
}
