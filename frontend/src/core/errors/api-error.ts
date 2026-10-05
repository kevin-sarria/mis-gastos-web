export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  public readonly status?: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code = 'UNKNOWN_ERROR', status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
