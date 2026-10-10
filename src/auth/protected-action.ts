import { showSnackbar } from '@/components/snackbar/snackbar';
import { openAuth } from './auth-guard';
import { getSession, validateSession } from './session-store';
import type { AppSession } from './session';

export const GUEST_ACTION_MESSAGE = 'Please log in to use this feature.';

/**
 * Returns the active session, or null after sending the user to Auth. No request may be sent on
 * null. An expired session already produced its own "expired" Snackbar inside validateSession(),
 * so the guest warning is shown only to users who had no session to begin with.
 */
export function requireSession(): AppSession | null {
  const hadSession = getSession() !== null;
  const session = validateSession();
  if (session !== null) return session;

  if (!hadSession) showSnackbar(GUEST_ACTION_MESSAGE, 'warning');
  openAuth('login');

  return null;
}
