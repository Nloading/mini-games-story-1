import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showSnackbar } from '@/components/snackbar/snackbar';
import { openAuth } from './auth-guard';
import { getSession, validateSession } from './session-store';
import { GUEST_ACTION_MESSAGE, requireSession } from './protected-action';

vi.mock('@/components/snackbar/snackbar', () => ({ showSnackbar: vi.fn() }));
vi.mock('./auth-guard', () => ({ openAuth: vi.fn() }));
vi.mock('./session-store', () => ({ getSession: vi.fn(), validateSession: vi.fn() }));

const session = {
  displayName: 'Player',
  email: 'p@example.com',
  authenticatedAt: 123,
};

describe('requireSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockReturnValue(null);
    vi.mocked(validateSession).mockReturnValue(null);
  });

  it('returns the validated session without showing a warning or opening auth', () => {
    vi.mocked(validateSession).mockReturnValue(session);

    expect(requireSession()).toEqual(session);
    expect(showSnackbar).not.toHaveBeenCalled();
    expect(openAuth).not.toHaveBeenCalled();
  });

  it('warns guests and opens login when no session existed', () => {
    expect(requireSession()).toBeNull();
    expect(validateSession).toHaveBeenCalledOnce();
    expect(showSnackbar).toHaveBeenCalledWith(GUEST_ACTION_MESSAGE, 'warning');
    expect(openAuth).toHaveBeenCalledWith('login');
  });

  it('does not show the guest warning when an existing session expires during validation', () => {
    vi.mocked(getSession).mockReturnValue(session);

    expect(requireSession()).toBeNull();
    expect(showSnackbar).not.toHaveBeenCalled();
    expect(openAuth).toHaveBeenCalledWith('login');
  });
});
