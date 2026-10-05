import { useQuery } from '@tanstack/react-query';
import { httpCategoryApi } from '../api/category-api';
import type { CategoryType } from '../domain/category';

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: () => httpCategoryApi.list(type),
  });
}
