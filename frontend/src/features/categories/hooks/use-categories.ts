import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpCategoryApi } from '../api/category-api';
import type { CategoryCreateInput } from '../api/category-api';
import type { CategoryType } from '../domain/category';

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: () => httpCategoryApi.list(type),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryCreateInput) => httpCategoryApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}
