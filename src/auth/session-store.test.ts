/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSession,
  initSession,
  logout,
  startSession,
  subscribeSession,
  validateSession,
} from './session-store';
import { SESSION_KEY, SESSION_LIFETIME_MS } from './session';

const authMocks = vi.hoisted(() => ({
  signOutFirebase: vi.fn<() => Promise<void>>(),
}));

vi.mock('./auth-service', () => authMocks);

const profile = {
  displayName: 'Player',
  email: 'player@example.com',
  avatarUrl: 'https://example.com/avatar.png',
};

describe('session store', () => {
  const unsubscribers: Array<() => void> = [];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    localStorage.clear();
    authMocks.signOutFirebase.mockReset().mockResolvedValue(undefined);
    if (getSession() !== null) await logout();
  });

  afterEach(async () => {
    unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
    if (getSession() !== null) await logout();
    localStorage.clear();
    vi.useRealTimers();
  });

  it('starts a session, persists it, schedules expiry, and emits started', () => {
    const listener = vi.fn();
    unsubscribers.push(subscribeSession(listener));

    const session = startSession(profile);
    expect(session).toEqual({
      ...profile,
      authenticatedAt: Date.now(),
    });
    expect(getSession()).toEqual(session);
    expect(JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')).toEqual(session);
    expect(listener).toHaveBeenCalledWith(session, 'started');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('restores a valid session from storage and returns it on subsequent validation', () => {
    const stored = {
      displayName: 'Saved',
      email: 'saved@example.com',
      authenticatedAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
    const listener = vi.fn();
    unsubscribers.push(subscribeSession(listener));

    expect(initSession()).toEqual(stored);
    expect(validateSession()).toEqual(stored);
    expect(getSession()).toEqual(stored);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(stored, 'restored');
  });

  it('emits no restored event when initialization finds no session', () => {
    const listener = vi.fn();
    unsubscribers.push(subscribeSession(listener));

    expect(initSession()).toBeNull();
    expect(getSession()).toBeNull();
    expect(listener).not.toHaveBeenCalled();
  });

  it.each(['expired', 'invalid'] as const)(
    'clears a %s session, signs Firebase out, and notifies listeners',
    (event) => {
      const timestamp = event === 'expired' ? Date.now() - SESSION_LIFETIME_MS : Number.NaN;
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ displayName: 'P', email: 'p@example.com', authenticatedAt: timestamp })
      );
      const listener = vi.fn();
      unsubscribers.push(subscribeSession(listener));

      expect(validateSession()).toBeNull();
      expect(getSession()).toBeNull();
      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
      expect(listener).toHaveBeenCalledWith(null, event);
      expect(authMocks.signOutFirebase).toHaveBeenCalledTimes(1);
    }
  );

  it('invalidates the in-memory session when its persisted value is removed', () => {
    const listener = vi.fn();
    unsubscribers.push(subscribeSession(listener));
    const session = startSession(profile);
    listener.mockClear();
    localStorage.removeItem(SESSION_KEY);

    expect(validateSession()).toBeNull();
    expect(getSession()).toBeNull();
    expect(listener).toHaveBeenCalledWith(null, 'invalid');
    expect(authMocks.signOutFirebase).toHaveBeenCalledTimes(1);
    expect(session.email).toBe(profile.email);
  });

  it('expires automatically and ignores Firebase sign-out failure in background cleanup', async () => {
    const listener = vi.fn();
    unsubscribers.push(subscribeSession(listener));
    authMocks.signOutFirebase.mockRejectedValueOnce(new Error('offline'));
    startSession(profile);
    listener.mockClear();

    await vi.advanceTimersByTimeAsync(SESSION_LIFETIME_MS + 50);

    expect(getSession()).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(listener).toHaveBeenCalledWith(null, 'expired');
    expect(authMocks.signOutFirebase).toHaveBeenCalledTimes(1);
  });

  it('logs out locally immediately and reports Firebase sign-out success or failure', async () => {
    const listener = vi.fn();
    unsubscribers.push(subscribeSession(listener));
    startSession(profile);
    listener.mockClear();

    await expect(logout()).resolves.toBe(true);
    expect(getSession()).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(listener).toHaveBeenCalledWith(null, 'logout');
    expect(authMocks.signOutFirebase).toHaveBeenCalledTimes(1);

    startSession(profile);
    authMocks.signOutFirebase.mockRejectedValueOnce(new Error('offline'));
    await expect(logout()).resolves.toBe(false);
    expect(getSession()).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('removes listeners when unsubscribed', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);
    unsubscribe();

    startSession(profile);
    expect(listener).not.toHaveBeenCalled();
  });
});
