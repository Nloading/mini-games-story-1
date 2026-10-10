import { showSnackbar } from '@/components/snackbar/snackbar';
import { router } from '@/router/router';
import { QUERY_KEYS } from '@/router/url-state';
import type { AuthMode, RouteState } from '@/router/url-state';
import { validateSession } from './session-store';

export const ALREADY_AUTHENTICATED_MESSAGE = 'You are already logged in.';

/** Runs session recovery first, so an expired or invalid session counts as a guest. */
export function canOpenAuth(): boolean {
  if (validateSession() === null) return true;

  showSnackbar(ALREADY_AUTHENTICATED_MESSAGE, 'info');

  return false;
}

/** Use for every UI control that opens Auth. */
export function openAuth(mode: AuthMode): void {
  if (canOpenAuth()) router.openAuth(mode);
}

/**
 * Use for URL and history entries. Returns false when Auth was blocked: only `auth` is removed
 * from the current history entry (replaceState), so path, other params and hash are untouched.
 */
export function guardAuthRoute(state: RouteState): boolean {
  if (state.authMode === null || canOpenAuth()) return true;

  router.setQuery({ [QUERY_KEYS.auth]: null }, { replace: true });

  return false;
}
