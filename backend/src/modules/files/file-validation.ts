import { ValidationError } from '../../shared/errors/app-error';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface DetectedFileType {
  ext: string;
  mime: string;
}

interface FileType extends DetectedFileType {
  matches: (buffer: Buffer) => boolean;
}

const FILE_TYPES: FileType[] = [
  {
    ext: 'pdf',
    mime: 'application/pdf',
    matches: (b) =>
      b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  },
  {
    ext: 'jpg',
    mime: 'image/jpeg',
    matches: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: 'png',
    mime: 'image/png',
    matches: (b) =>
      b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: 'webp',
    mime: 'image/webp',
    matches: (b) =>
      b.length >= 12 &&
      b.toString('ascii', 0, 4) === 'RIFF' &&
      b.toString('ascii', 8, 12) === 'WEBP',
  },
];

export function detectFileType(buffer: Buffer): DetectedFileType | null {
  const match = FILE_TYPES.find((type) => type.matches(buffer));
  return match ? { ext: match.ext, mime: match.mime } : null;
}

export function validateFile(buffer: Buffer): DetectedFileType {
  if (buffer.length === 0) {
    throw new ValidationError('El archivo está vacío');
  }
  if (buffer.length > MAX_SIZE_BYTES) {
    throw new ValidationError('El archivo supera los 10 MB');
  }
  const detected = detectFileType(buffer);
  if (!detected) {
    throw new ValidationError('Formato no permitido. Usa PDF, JPG, PNG o WebP');
  }
  return detected;
}
