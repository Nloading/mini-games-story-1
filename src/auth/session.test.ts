import { describe, expect, it, vi } from 'vitest';
import {
  SESSION_KEY,
  SESSION_LIFETIME_MS,
  clearSession,
  createSession,
  isExpired,
  parseSession,
  readSession,
  saveSession,
} from './session';
import type { AppSession } from './session';

const validSession: AppSession = {
  displayName: 'Player',
  email: 'player@example.com',
  authenticatedAt: 10_000,
  avatarUrl: 'https://example.com/avatar.png',
};

describe('parseSession', () => {
  it('parses valid session data and omits an empty optional avatar', () => {
    expect(parseSession(JSON.stringify(validSession))).toEqual(validSession);
    expect(parseSession('{"displayName":"","email":"x@y.com","authenticatedAt":0}')).toEqual({
      displayName: '',
      email: 'x@y.com',
      authenticatedAt: 0,
    });
    expect(
      parseSession('{"displayName":"A","email":"a@b.com","authenticatedAt":0,"avatarUrl":""}')
    ).toEqual({ displayName: 'A', email: 'a@b.com', authenticatedAt: 0 });
  });

  it.each([
    'not-json',
    'null',
    '[]',
    '42',
    '{"email":"a@b.com","authenticatedAt":0}',
    '{"displayName":1,"email":"a@b.com","authenticatedAt":0}',
    '{"displayName":"A","email":"","authenticatedAt":0}',
    '{"displayName":"A","email":1,"authenticatedAt":0}',
    '{"displayName":"A","email":"a@b.com","authenticatedAt":"0"}',
    '{"displayName":"A","email":"a@b.com","authenticatedAt":null}',
    '{"displayName":"A","email":"a@b.com","authenticatedAt":1e309}',
    '{"displayName":"A","email":"a@b.com","authenticatedAt":0,"avatarUrl":false}',
  ])('rejects invalid stored value %s', (raw) => {
    expect(parseSession(raw)).toBeNull();
  });
});

describe('session lifetime and conversion', () => {
  it('expires at the lifetime boundary but not immediately before it', () => {
    expect(SESSION_LIFETIME_MS).toBe(300_000);
    expect(isExpired(validSession, validSession.authenticatedAt + SESSION_LIFETIME_MS - 1)).toBe(
      false
    );
    expect(isExpired(validSession, validSession.authenticatedAt + SESSION_LIFETIME_MS)).toBe(true);
  });

  it('creates sessions while including only a non-empty avatar URL', () => {
    expect(createSession({ displayName: 'P', email: 'p@example.com' }, 123)).toEqual({
      displayName: 'P',
      email: 'p@example.com',
      authenticatedAt: 123,
    });
    expect(
      createSession(
        { displayName: 'P', email: 'p@example.com', avatarUrl: 'https://a.test/p' },
        123
      )
    ).toEqual({
      displayName: 'P',
      email: 'p@example.com',
      authenticatedAt: 123,
      avatarUrl: 'https://a.test/p',
    });
  });
});

describe('storage operations', () => {
  it('reads none, valid, expired, invalid, and future-dated session states', () => {
    const storage = { getItem: vi.fn<(key: string) => string | null>() };
    storage.getItem.mockReturnValueOnce(null);
    storage.getItem.mockReturnValueOnce(JSON.stringify(validSession));
    storage.getItem.mockReturnValueOnce(JSON.stringify(validSession));
    storage.getItem.mockReturnValueOnce('{');
    storage.getItem.mockReturnValueOnce(
      JSON.stringify({ ...validSession, authenticatedAt: 20_000 })
    );

    expect(readSession(storage, 10_000)).toEqual({ status: 'none' });
    expect(readSession(storage, 10_000)).toEqual({ status: 'valid', session: validSession });
    expect(readSession(storage, 10_000 + SESSION_LIFETIME_MS)).toEqual({ status: 'expired' });
    expect(readSession(storage, 10_000)).toEqual({ status: 'invalid' });
    expect(readSession(storage, 10_000)).toEqual({ status: 'invalid' });
    expect(storage.getItem).toHaveBeenCalledTimes(5);
    expect(storage.getItem).toHaveBeenCalledWith(SESSION_KEY);
  });

  it('treats storage read errors as no session', () => {
    expect(
      readSession(
        {
          getItem: () => {
            throw new Error('storage disabled');
          },
        },
        10_000
      )
    ).toEqual({ status: 'none' });
  });

  it('saves and clears using the session key and suppresses storage write errors', () => {
    const setItem = vi.fn<(key: string, value: string) => void>();
    const removeItem = vi.fn<(key: string) => void>();

    saveSession(validSession, { setItem });
    clearSession({ removeItem });
    expect(setItem).toHaveBeenCalledWith(SESSION_KEY, JSON.stringify(validSession));
    expect(removeItem).toHaveBeenCalledWith(SESSION_KEY);

    expect(() =>
      saveSession(validSession, {
        setItem: () => {
          throw new Error('quota exceeded');
        },
      })
    ).not.toThrow();
    expect(() =>
      clearSession({
        removeItem: () => {
          throw new Error('storage disabled');
        },
      })
    ).not.toThrow();
  });
});
