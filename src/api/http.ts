import { API_BASE_URL } from './config';

type QueryValue = string | number | boolean | undefined;
export type QueryParams = Record<string, QueryValue>;

export const HTTP_BAD_REQUEST = 400;
export const HTTP_NOT_FOUND = 404;
export const HTTP_TOO_MANY_REQUESTS = 429;

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

interface ApiErrorBody {
  error?: string;
}

export class ApiError extends Error {
  public readonly status: number | null;
  public readonly outcomeUnknown: boolean;

  constructor(message: string, status: number | null, outcomeUnknown = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.outcomeUnknown = outcomeUnknown;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === HTTP_NOT_FOUND;
}

export function isUnknownResourceError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === HTTP_NOT_FOUND || error.status === HTTP_BAD_REQUEST)
  );
}

export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE;
}

export const OUTCOME_UNKNOWN_MESSAGE =
  'The connection was interrupted, so we cannot tell whether your action was saved.';

const MUTATION_TIMEOUT_MS = 15000;
const HTTP_SERVER_ERROR = 500;

export function isOutcomeUnknownError(error: unknown): boolean {
  return error instanceof ApiError && error.outcomeUnknown;
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

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.error === 'string' && body.error.length > 0) {
      return body.error;
    }
  } catch {
    // body is not JSON, use the fallback below
  }

  return `Request failed with status ${response.status}`;
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
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new ApiError('Received an invalid response from the server.', response.status);
  }
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(MUTATION_TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(OUTCOME_UNKNOWN_MESSAGE, null, true);
  }

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response),
      response.status,
      response.status >= HTTP_SERVER_ERROR
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(OUTCOME_UNKNOWN_MESSAGE, response.status, true);
  }
}
