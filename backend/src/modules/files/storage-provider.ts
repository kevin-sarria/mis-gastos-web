export interface IncomingFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface StoredFile {
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface StorageProvider {
  save(file: IncomingFile): Promise<StoredFile>;
  read(storageKey: string): Promise<Buffer>;
  remove(storageKey: string): Promise<void>;
}
