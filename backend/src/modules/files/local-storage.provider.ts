import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomToken } from '../../shared/utils/crypto';
import type { IncomingFile, StorageProvider, StoredFile } from './storage-provider';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

export class LocalStorageProvider implements StorageProvider {
  async save(file: IncomingFile): Promise<StoredFile> {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const extension = path.extname(file.originalName).toLowerCase();
    const storageKey = `${randomToken(16)}${extension}`;

    await writeFile(path.join(UPLOAD_DIR, storageKey), file.buffer);

    return {
      storageKey,
      filename: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.buffer.length,
    };
  }

  async read(storageKey: string): Promise<Buffer> {
    return readFile(path.join(UPLOAD_DIR, storageKey));
  }

  async remove(storageKey: string): Promise<void> {
    await unlink(path.join(UPLOAD_DIR, storageKey)).catch(() => undefined);
  }
}
