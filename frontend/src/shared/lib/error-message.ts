import { ApiError } from '@/core/errors/api-error';

type TranslateFn = (key: string, options?: { defaultValue?: string }) => string;

export function messageFromError(error: unknown, t: TranslateFn): string {
  if (error instanceof ApiError) {
    return t(`errors.${error.code}`, { defaultValue: error.message });
  }
  if (error instanceof Error) {
    return error.message;
  }
  return t('errors.UNKNOWN_ERROR');
}
