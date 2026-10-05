import { uploadUrl } from '@/shared/lib/api-url';

export type ExpenseTag = 'FIXED' | 'VARIABLE' | 'EMERGENCY' | 'ANT_EXPENSE';

export const EXPENSE_TAG_LABELS: Record<ExpenseTag, string> = {
  FIXED: 'Fijo',
  VARIABLE: 'Variable',
  EMERGENCY: 'Emergencia',
  ANT_EXPENSE: 'Gasto hormiga',
};

export interface ExpenseAttachment {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string | null;
}

export interface Expense {
  id: string;
  categoryId: string;
  title: string;
  amountMinorUnits: number;
  date: string;
  justification: string | null;
  tags: ExpenseTag[];
  category: ExpenseCategory | null;
  attachments: ExpenseAttachment[];
}

export interface ExpenseCreateInput {
  categoryId: string;
  title: string;
  amountMinorUnits: number;
  date: string;
  tags: ExpenseTag[];
  justification?: string | null;
}

export interface ExpenseDto {
  id: string;
  categoryId: string;
  title: string;
  amountMinorUnits: number;
  date: string;
  justification: string | null;
  category: ExpenseCategory | null;
  tags: { expenseId: string; tag: ExpenseTag }[];
  attachments: {
    id: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
  }[];
}

export function mapExpense(dto: ExpenseDto): Expense {
  return {
    id: dto.id,
    categoryId: dto.categoryId,
    title: dto.title,
    amountMinorUnits: dto.amountMinorUnits,
    date: dto.date,
    justification: dto.justification,
    category: dto.category,
    tags: dto.tags.map((tag) => tag.tag),
    attachments: dto.attachments.map((attachment) => ({
      id: attachment.id,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      url: uploadUrl(attachment.storageKey),
    })),
  };
}
