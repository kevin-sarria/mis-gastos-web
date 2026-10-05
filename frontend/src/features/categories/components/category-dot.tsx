import { cn } from '@/lib/utils';
import { DEFAULT_CATEGORY_COLOR } from '../domain/category-colors';

export function CategoryDot({ color, className }: { color?: string | null; className?: string }) {
  return (
    <span
      className={cn('inline-block h-2.5 w-2.5 shrink-0 rounded-full', className)}
      style={{ backgroundColor: color ?? DEFAULT_CATEGORY_COLOR }}
      aria-hidden="true"
    />
  );
}
