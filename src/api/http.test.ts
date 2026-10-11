import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  getErrorMessage,
  getJson,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_TOO_MANY_REQUESTS,
  isAbortError,
  isNotFoundError,
  isOutcomeUnknownError,
  isUnknownResourceError,
  OUTCOME_UNKNOWN_MESSAGE,
  postJson,
} from './http';

describe('HTTP helpers', () => {
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('builds a GET URL, omits undefined query values, and requests JSON', async () => {
    fetchMock.mockResolvedValue(new Response('{"result":true}', { status: 200 }));
    const controller = new AbortController();

    await expect(
      getJson<{ result: boolean }>(
        '/sample',
        {
          term: 'two words',
          page: 2,
          enabled: false,
          omitted: undefined,
        },
        controller.signal
      )
    ).resolves.toEqual({ result: true });

    const firstCall = fetchMock.mock.calls[0];
    if (firstCall === undefined) throw new Error('Expected fetch to be called');
    const [input, init] = firstCall;
    const url = new URL(String(input));
    expect(url.pathname).toBe('/api/sample');
    expect(url.searchParams.get('term')).toBe('two words');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('enabled')).toBe('false');
    expect(url.searchParams.has('omitted')).toBe(false);
    expect(init?.method).toBeUndefined();
    expect(init?.headers).toEqual({ Accept: 'application/json' });
    expect(init?.signal).toBe(controller.signal);
  });

  it('posts JSON with the expected headers and forwards an explicit signal', async () => {
    fetchMock.mockResolvedValue(new Response('{"saved":true}', { status: 201 }));
    const controller = new AbortController();
    const body = { text: 'hello', count: 2 };

    await expect(postJson<{ saved: boolean }>('/sample', body, controller.signal)).resolves.toEqual(
      { saved: true }
    );

    const firstCall = fetchMock.mock.calls[0];
    if (firstCall === undefined) throw new Error('Expected fetch to be called');
    const [input, init] = firstCall;
    expect(String(input)).toBe(
      'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api/sample'
    );
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    expect(init?.body).toBe(JSON.stringify(body));
    expect(init?.signal).toBe(controller.signal);
  });

  it('maps HTTP error bodies and classifies known status codes', async () => {
    fetchMock.mockResolvedValue(new Response('{"error":"No such game"}', { status: 404 }));

    const request = getJson('/missing');
    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      message: 'No such game',
      status: HTTP_NOT_FOUND,
      outcomeUnknown: false,
    });

    const error = await request.catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(isNotFoundError(error)).toBe(true);
    expect(isUnknownResourceError(error)).toBe(true);
    expect(getErrorMessage(error)).toBe('No such game');
    expect(isUnknownResourceError(new ApiError('bad request', HTTP_BAD_REQUEST))).toBe(true);
    expect(isUnknownResourceError(new ApiError('slow down', HTTP_TOO_MANY_REQUESTS))).toBe(false);
  });

  it('uses status fallbacks for invalid error and success response bodies', async () => {
    fetchMock.mockResolvedValueOnce(new Response('not json', { status: 502 }));
    await expect(getJson('/failure')).rejects.toMatchObject({
      message: 'Request failed with status 502',
      status: 502,
    });

    fetchMock.mockResolvedValueOnce(new Response('not json', { status: 200 }));
    await expect(getJson('/invalid')).rejects.toMatchObject({
      message: 'Received an invalid response from the server.',
      status: 200,
    });
  });

  it('distinguishes network failures, aborted requests, and uncertain mutations', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    await expect(getJson('/offline')).rejects.toMatchObject({
      message: 'Network error. Please check your connection.',
      status: null,
    });

    const abort = new DOMException('cancelled', 'AbortError');
    fetchMock.mockRejectedValueOnce(abort);
    await expect(getJson('/cancelled')).rejects.toBe(abort);
    expect(isAbortError(abort)).toBe(true);

    fetchMock.mockRejectedValueOnce(new TypeError('connection lost'));
    const mutationError = await postJson('/mutation', {}).catch((error: unknown) => error);
    expect(mutationError).toMatchObject({
      message: OUTCOME_UNKNOWN_MESSAGE,
      status: null,
      outcomeUnknown: true,
    });
    expect(isOutcomeUnknownError(mutationError)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getErrorMessage(new Error('other'))).toBe('Something went wrong. Please try again.');
  });

  it('marks server-side mutation failures and invalid mutation responses as uncertain', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"error":"Invalid comment"}', { status: 400 }));
    await expect(postJson('/mutation', {})).rejects.toMatchObject({
      message: 'Invalid comment',
      status: 400,
      outcomeUnknown: false,
    });

    fetchMock.mockResolvedValueOnce(new Response('{"error":"Server failed"}', { status: 500 }));
    await expect(postJson('/mutation', {})).rejects.toMatchObject({
      message: 'Server failed',
      status: 500,
      outcomeUnknown: true,
    });

    fetchMock.mockResolvedValueOnce(new Response('not json', { status: 200 }));
    const invalid = await postJson('/mutation', {}).catch((error: unknown) => error);
    expect(invalid).toMatchObject({
      message: OUTCOME_UNKNOWN_MESSAGE,
      status: 200,
      outcomeUnknown: true,
    });
    expect(isOutcomeUnknownError(invalid)).toBe(true);
  });
});
