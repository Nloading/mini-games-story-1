import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  AuthCancelledError,
  getAuthErrorMessage,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  signOutFirebase,
  toProfile,
} from './auth-service';

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('./firebase', () => ({
  firebaseAuth: { name: 'mock-auth' },
  googleProvider: { name: 'mock-google-provider' },
}));

interface FakeUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

function credentialFor(user: FakeUser): Awaited<ReturnType<typeof signInWithEmailAndPassword>> {
  return { user } as unknown as Awaited<ReturnType<typeof signInWithEmailAndPassword>>;
}

describe('getAuthErrorMessage', () => {
  it.each([
    ['auth/invalid-credential', 'Incorrect email or password.'],
    ['auth/invalid-email', 'Enter a valid email address.'],
    ['auth/user-not-found', 'Incorrect email or password.'],
    ['auth/wrong-password', 'Incorrect email or password.'],
    ['auth/email-already-in-use', 'An account with this email already exists.'],
    ['auth/weak-password', 'Password is too weak.'],
    ['auth/too-many-requests', 'Too many attempts. Try again later.'],
    ['auth/network-request-failed', 'Network error. Please check your connection.'],
    ['auth/popup-blocked', 'The sign-in popup was blocked by the browser.'],
  ])('maps %s to a user-facing message', (code, message) => {
    expect(getAuthErrorMessage({ code })).toBe(message);
  });

  it('uses a generic message when the error code is unknown or malformed', () => {
    expect(getAuthErrorMessage({ code: 'auth/new-code' })).toBe(
      'Authentication failed. Please try again.'
    );
    expect(getAuthErrorMessage({ code: 7 })).toBe('Authentication failed. Please try again.');
    expect(getAuthErrorMessage(new Error('failure'))).toBe(
      'Authentication failed. Please try again.'
    );
    expect(getAuthErrorMessage(null)).toBe('Authentication failed. Please try again.');
  });
});

describe('toProfile', () => {
  it('normalizes missing display names and omits absent avatars', () => {
    expect(toProfile({ displayName: null, email: 'player@example.com', photoURL: null })).toEqual({
      displayName: '',
      email: 'player@example.com',
    });
    expect(
      toProfile({
        displayName: 'Player',
        email: 'player@example.com',
        photoURL: 'https://example.com/avatar.png',
      })
    ).toEqual({
      displayName: 'Player',
      email: 'player@example.com',
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(() => toProfile({ displayName: 'Player', email: null, photoURL: null })).toThrow(
      'Authenticated user has no email.'
    );
  });
});

describe('email authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in with email and returns the normalized Firebase user', async () => {
    const user = { displayName: null, email: 'player@example.com', photoURL: null };
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue(credentialFor(user));

    await expect(loginWithEmail('player@example.com', 'secret1')).resolves.toEqual({
      displayName: '',
      email: 'player@example.com',
    });
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      { name: 'mock-auth' },
      'player@example.com',
      'secret1'
    );
  });

  it('propagates login failures and rejects a successful credential with no email', async () => {
    const failure = { code: 'auth/invalid-credential' };
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(failure);
    await expect(loginWithEmail('player@example.com', 'wrong')).rejects.toBe(failure);

    vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce(
      credentialFor({ displayName: null, email: null, photoURL: null })
    );
    await expect(loginWithEmail('player@example.com', 'secret1')).rejects.toThrow(
      'Authenticated user has no email.'
    );
  });

  it('registers, updates the display name, and returns the requested profile', async () => {
    const user = { displayName: null, email: 'player@example.com', photoURL: null };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(
      credentialFor(user) as Awaited<ReturnType<typeof createUserWithEmailAndPassword>>
    );
    vi.mocked(updateProfile).mockResolvedValue(undefined);

    await expect(registerWithEmail('NewPlayer', 'player@example.com', 'Strong1!')).resolves.toEqual(
      { displayName: 'NewPlayer', email: 'player@example.com' }
    );
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      { name: 'mock-auth' },
      'player@example.com',
      'Strong1!'
    );
    expect(updateProfile).toHaveBeenCalledWith(user, { displayName: 'NewPlayer' });
  });

  it('does not update the profile when account creation fails and propagates update failures', async () => {
    const createFailure = new Error('create failed');
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(createFailure);
    await expect(registerWithEmail('Player', 'p@example.com', 'Strong1!')).rejects.toBe(
      createFailure
    );
    expect(updateProfile).not.toHaveBeenCalled();

    const user = { displayName: null, email: 'p@example.com', photoURL: null };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce(
      credentialFor(user) as Awaited<ReturnType<typeof createUserWithEmailAndPassword>>
    );
    const updateFailure = new Error('profile update failed');
    vi.mocked(updateProfile).mockRejectedValueOnce(updateFailure);
    await expect(registerWithEmail('Player', 'p@example.com', 'Strong1!')).rejects.toBe(
      updateFailure
    );
  });
});

describe('Google authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the popup user profile', async () => {
    const user = { displayName: 'Player', email: 'p@example.com', photoURL: 'https://a.test/p' };
    vi.mocked(signInWithPopup).mockResolvedValue(
      credentialFor(user) as Awaited<ReturnType<typeof signInWithPopup>>
    );

    await expect(loginWithGoogle()).resolves.toEqual({
      displayName: 'Player',
      email: 'p@example.com',
      avatarUrl: 'https://a.test/p',
    });
    expect(signInWithPopup).toHaveBeenCalledWith(
      { name: 'mock-auth' },
      { name: 'mock-google-provider' }
    );
  });

  it.each(['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'])(
    'translates cancellation code %s to AuthCancelledError',
    async (code) => {
      vi.mocked(signInWithPopup).mockRejectedValue({ code });

      await expect(loginWithGoogle()).rejects.toMatchObject({
        name: 'AuthCancelledError',
        message: 'Authentication was cancelled.',
      });
      await expect(loginWithGoogle()).rejects.toBeInstanceOf(AuthCancelledError);
    }
  );

  it('rethrows non-cancellation popup errors unchanged', async () => {
    const failure = { code: 'auth/popup-blocked' };
    vi.mocked(signInWithPopup).mockRejectedValue(failure);
    await expect(loginWithGoogle()).rejects.toBe(failure);
  });
});

describe('Firebase sign-out', () => {
  it('awaits Firebase sign-out and propagates failures', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);
    await expect(signOutFirebase()).resolves.toBeUndefined();
    expect(signOut).toHaveBeenCalledWith({ name: 'mock-auth' });

    const failure = new Error('sign-out failed');
    vi.mocked(signOut).mockRejectedValueOnce(failure);
    await expect(signOutFirebase()).rejects.toBe(failure);
  });
});
