import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../shared/errors/app-error';
import { validateFile } from './file-validation';
import { LocalStorageProvider } from './local-storage.provider';
import type { StorageProvider } from './storage-provider';

// En producción, reemplazar por un proveedor S3/Cloudinary que implemente StorageProvider.
export const storageProvider: StorageProvider = new LocalStorageProvider();

export interface UploadedFile {
  buffer: Buffer;
  originalName: string;
  mimeType?: string;
}

export const fileService = {
  async attachToExpense(userId: string, expenseId: string, file: UploadedFile) {
    const expense = await prisma.expense.findFirst({ where: { id: expenseId, userId } });
    if (!expense) {
      throw new NotFoundError('Gasto no encontrado');
    }

    const detected = validateFile(file.buffer);
    const stored = await storageProvider.save({
      buffer: file.buffer,
      originalName: file.originalName,
      mimeType: detected.mime,
    });

    return prisma.attachment.create({
      data: {
        userId,
        expenseId,
        filename: stored.filename,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        storageKey: stored.storageKey,
        provider: 'LOCAL',
      },
    });
  },

  listForExpense(userId: string, expenseId: string) {
    return prisma.attachment.findMany({
      where: { expenseId, userId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async remove(userId: string, attachmentId: string) {
    const attachment = await prisma.attachment.findFirst({
      where: { id: attachmentId, userId },
    });
    if (!attachment) {
      throw new NotFoundError('Archivo no encontrado');
    }
    await storageProvider.remove(attachment.storageKey);
    await prisma.attachment.delete({ where: { id: attachment.id } });
  },
};
