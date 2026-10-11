import { signOutFirebase } from './auth-service';
import type { AuthProfile } from './auth-service';
import {
  SESSION_LIFETIME_MS,
  clearSession,
  createSession,
  readSession,
  saveSession,
} from './session';
import type { AppSession } from './session';

export type SessionEvent = 'started' | 'restored' | 'expired' | 'invalid' | 'logout';
type SessionListener = (session: AppSession | null, event: SessionEvent) => void;

const EXPIRY_MARGIN_MS = 50;

const listeners = new Set<SessionListener>();
let current: AppSession | null = null;
let expiryTimer: number | undefined;

function emit(event: SessionEvent): void {
  [...listeners].forEach((listener) => listener(current, event));
}

function scheduleExpiry(session: AppSession): void {
  window.clearTimeout(expiryTimer);

  const remaining = session.authenticatedAt + SESSION_LIFETIME_MS - Date.now();
  expiryTimer = window.setTimeout(() => {
    validateSession();
  }, Math.max(remaining, 0) + EXPIRY_MARGIN_MS);
}

function stopSession(event: 'expired' | 'invalid' | 'logout'): void {
  window.clearTimeout(expiryTimer);
  current = null;
  clearSession();
  emit(event);
}

async function signOutQuietly(): Promise<void> {
  try {
    await signOutFirebase();
  } catch {
    // Guest Mode is already active, and the app never trusts Firebase's currentUser alone.
  }
}

function endSession(event: 'expired' | 'invalid'): void {
  stopSession(event);
  void signOutQuietly();
}

/** Re-reads storage, so manual edits in DevTools are honored. Call before every protected action. */
export function validateSession(): AppSession | null {
  const result = readSession();

  switch (result.status) {
    case 'valid':
      current = result.session;
      scheduleExpiry(result.session);
      return current;
    case 'expired':
      endSession('expired');
      return null;
    case 'invalid':
      endSession('invalid');
      return null;
    case 'none':
      if (current !== null) endSession('invalid');
      return null;
  }
}

export function initSession(): AppSession | null {
  const session = validateSession();
  if (session !== null) emit('restored');

  return session;
}

export function startSession(profile: AuthProfile): AppSession {
  const session = createSession(profile);
  saveSession(session);
  current = session;
  scheduleExpiry(session);
  emit('started');

  return session;
}

/** Guest Mode starts immediately; resolves to false when Firebase signOut failed. */
export async function logout(): Promise<boolean> {
  stopSession('logout');

  try {
    await signOutFirebase();
    return true;
  } catch {
    return false;
  }
}

export function getSession(): AppSession | null {
  return current;
}

export function subscribeSession(listener: SessionListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
