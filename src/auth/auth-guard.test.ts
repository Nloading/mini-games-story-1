import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showSnackbar } from '@/components/snackbar/snackbar';
import { router } from '@/router/router';
import type { RouteState } from '@/router/url-state';
import { validateSession } from './session-store';
import { ALREADY_AUTHENTICATED_MESSAGE, canOpenAuth, guardAuthRoute, openAuth } from './auth-guard';

vi.mock('@/components/snackbar/snackbar', () => ({ showSnackbar: vi.fn() }));
vi.mock('@/router/router', () => ({
  router: { openAuth: vi.fn(), setQuery: vi.fn() },
}));
vi.mock('./session-store', () => ({ validateSession: vi.fn() }));

const routeState = (authMode: RouteState['authMode']): RouteState => ({
  page: 'library',
  path: '/library',
  library: { category: 'puzzle', sort: 'name-asc', page: 3 },
  gameSlug: 'game-one',
  authMode,
});

describe('auth guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateSession).mockReturnValue(null);
  });

  it('allows auth when no active session is recovered', () => {
    expect(canOpenAuth()).toBe(true);
    expect(validateSession).toHaveBeenCalledOnce();
    expect(showSnackbar).not.toHaveBeenCalled();
  });

  it('blocks auth for an active session and displays an informational message', () => {
    vi.mocked(validateSession).mockReturnValue({
      displayName: 'Player',
      email: 'p@example.com',
      authenticatedAt: 1,
    });

    expect(canOpenAuth()).toBe(false);
    expect(showSnackbar).toHaveBeenCalledWith(ALREADY_AUTHENTICATED_MESSAGE, 'info');
  });

  it('opens the requested auth mode only when allowed', () => {
    openAuth('register');
    expect(router.openAuth).toHaveBeenCalledWith('register');

    vi.mocked(validateSession).mockReturnValue({
      displayName: 'Player',
      email: 'p@example.com',
      authenticatedAt: 1,
    });
    vi.mocked(router.openAuth).mockClear();
    openAuth('login');
    expect(router.openAuth).not.toHaveBeenCalled();
  });

  it('allows routes without auth and routes for guests', () => {
    expect(guardAuthRoute(routeState(null))).toBe(true);
    expect(validateSession).not.toHaveBeenCalled();

    expect(guardAuthRoute(routeState('login'))).toBe(true);
    expect(router.setQuery).not.toHaveBeenCalled();
  });

  it('removes only the auth query when an authenticated user follows an auth route', () => {
    vi.mocked(validateSession).mockReturnValue({
      displayName: 'Player',
      email: 'p@example.com',
      authenticatedAt: 1,
    });

    expect(guardAuthRoute(routeState('register'))).toBe(false);
    expect(router.setQuery).toHaveBeenCalledWith({ auth: null }, { replace: true });
    expect(showSnackbar).toHaveBeenCalledWith(ALREADY_AUTHENTICATED_MESSAGE, 'info');
  });
});
