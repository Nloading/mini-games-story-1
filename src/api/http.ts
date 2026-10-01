import { API_BASE_URL } from './config';

type QueryValue = string | number | boolean | undefined;
export type QueryParams = Record<string, QueryValue>;

export class ApiError extends Error {
  public readonly status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function getJson<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, params), {
      signal,
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new ApiError('Network error. Please check your connection.', null);
  }

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as T;
}
