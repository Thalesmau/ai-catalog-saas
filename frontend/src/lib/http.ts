import { tokenStorage } from './tokenStorage';

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333').replace(/\/$/, '');

export type FieldIssue = { field: string; error: string };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldIssue[];

  constructor(status: number, code: string, message: string, fieldErrors: FieldIssue[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

let unauthorizedHandler: (() => void) | undefined;

export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler;
}

export function authHeaders(): Record<string, string> {
  const token = tokenStorage.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function notifyUnauthorized() {
  unauthorizedHandler?.();
}

export async function toApiError(response: Response): Promise<ApiError> {
  const payload = await response.json().catch(() => null);
  const error = payload?.error;

  if (Array.isArray(error?.message)) {
    return new ApiError(response.status, error.code, 'Verifique os campos destacados.', error.message);
  }

  return new ApiError(
    response.status,
    error?.code ?? 'UNKNOWN',
    typeof error?.message === 'string' ? error.message : 'Algo deu errado. Tente novamente.',
  );
}

export function networkError(): ApiError {
  return new ApiError(0, 'NETWORK_ERROR', 'Não foi possível conectar à API. Ela está rodando?');
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
};

export async function http<T>(path: string, { method = 'GET', body, query, signal }: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const headers = authHeaders();
  let response: Response;

  try {
    response = await fetch(url, {
      method,
      signal,
      headers: { ...headers, ...(body !== undefined && { 'Content-Type': 'application/json' }) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw error;
    }

    throw networkError();
  }

  if (!response.ok) {
    if (response.status === 401 && headers.Authorization) {
      notifyUnauthorized();
    }

    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
