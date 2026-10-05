import { httpClient } from '@/core/http/client';
import type { ExpenseAttachment } from '@/features/expenses/domain/expense';

export interface FileApi {
  upload(expenseId: string, file: File): Promise<ExpenseAttachment>;
}

export const httpFileApi: FileApi = {
  async upload(expenseId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await httpClient.post<{ attachment: ExpenseAttachment }>(
      `/files/expenses/${expenseId}/attachments`,
      formData,
    );
    return data.attachment;
  },
};
