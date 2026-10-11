import type { AuthProfile } from './auth-service';

export const SESSION_KEY = 'minigames:nloading-mini-games:app-session';

const SESSION_LIFETIME_MINUTES = 5;
const SECONDS_IN_MINUTE = 60;
const MS_IN_SECOND = 1000;
export const SESSION_LIFETIME_MS = SESSION_LIFETIME_MINUTES * SECONDS_IN_MINUTE * MS_IN_SECOND;

export interface AppSession {
  displayName: string;
  email: string;
  authenticatedAt: number;
  avatarUrl?: string;
}

export type SessionReadResult =
  | { status: 'none' }
  | { status: 'valid'; session: AppSession }
  | { status: 'expired' }
  | { status: 'invalid' };

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;
type RemovableStorage = Pick<Storage, 'removeItem'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseSession(raw: string): AppSession | null {
  let data: unknown;

  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(data)) return null;

  const { displayName, email, authenticatedAt, avatarUrl } = data;
  if (
    typeof displayName !== 'string' ||
    typeof email !== 'string' ||
    email === '' ||
    typeof authenticatedAt !== 'number' ||
    !Number.isFinite(authenticatedAt)
  ) {
    return null;
  }

  if (avatarUrl !== undefined && typeof avatarUrl !== 'string') return null;

  const session: AppSession = { displayName, email, authenticatedAt };
  if (avatarUrl) session.avatarUrl = avatarUrl;

  return session;
}

export function isExpired(session: AppSession, now: number = Date.now()): boolean {
  return now - session.authenticatedAt >= SESSION_LIFETIME_MS;
}

export function createSession(profile: AuthProfile, now: number = Date.now()): AppSession {
  const session: AppSession = {
    displayName: profile.displayName,
    email: profile.email,
    authenticatedAt: now,
  };
  if (profile.avatarUrl) session.avatarUrl = profile.avatarUrl;

  return session;
}

export function readSession(
  storage: ReadableStorage = window.localStorage,
  now: number = Date.now()
): SessionReadResult {
  let raw: string | null;

  try {
    raw = storage.getItem(SESSION_KEY);
  } catch {
    return { status: 'none' };
  }

  if (raw === null) return { status: 'none' };

  const session = parseSession(raw);
  // A timestamp from the future would extend the lifetime, so it counts as tampered data.
  if (session === null || session.authenticatedAt > now) return { status: 'invalid' };

  return isExpired(session, now) ? { status: 'expired' } : { status: 'valid', session };
}

export function saveSession(
  session: AppSession,
  storage: WritableStorage = window.localStorage
): void {
  try {
    storage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage can be unavailable (private mode, quota); the in-memory session still works.
  }
}

export function clearSession(storage: RemovableStorage = window.localStorage): void {
  try {
    storage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
