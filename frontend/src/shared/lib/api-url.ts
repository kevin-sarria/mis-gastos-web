import { env } from '@/config/env';

export function uploadUrl(storageKey: string): string {
  const base = env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');
  return `${base}/uploads/${storageKey}`;
}
