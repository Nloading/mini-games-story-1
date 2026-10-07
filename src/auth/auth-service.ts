import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth, googleProvider } from './firebase';

export interface AuthProfile {
  displayName: string;
  email: string;
  avatarUrl?: string;
}

interface FirebaseUserLike {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export class AuthCancelledError extends Error {
  constructor() {
    super('Authentication was cancelled.');
    this.name = 'AuthCancelledError';
  }
}

const CANCELLED_CODES: readonly string[] = [
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
];

const FALLBACK_MESSAGE = 'Authentication failed. Please try again.';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/popup-blocked': 'The sign-in popup was blocked by the browser.',
};

function getErrorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error as { code: unknown };
    return typeof code === 'string' ? code : null;
  }

  return null;
}

export function getAuthErrorMessage(error: unknown): string {
  const code = getErrorCode(error);

  return (code !== null ? ERROR_MESSAGES[code] : undefined) ?? FALLBACK_MESSAGE;
}

export function toProfile(user: FirebaseUserLike): AuthProfile {
  if (user.email === null) {
    throw new Error('Authenticated user has no email.');
  }

  const profile: AuthProfile = {
    displayName: user.displayName ?? '',
    email: user.email,
  };

  if (user.photoURL) {
    profile.avatarUrl = user.photoURL;
  }

  return profile;
}

export async function loginWithEmail(email: string, password: string): Promise<AuthProfile> {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);

  return toProfile(credential.user);
}

export async function registerWithEmail(
  username: string,
  email: string,
  password: string
): Promise<AuthProfile> {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(credential.user, { displayName: username });

  return toProfile({ ...credential.user, displayName: username });
}

export async function loginWithGoogle(): Promise<AuthProfile> {
  try {
    const credential = await signInWithPopup(firebaseAuth, googleProvider);

    return toProfile(credential.user);
  } catch (error) {
    const code = getErrorCode(error);
    if (code !== null && CANCELLED_CODES.includes(code)) {
      throw new AuthCancelledError();
    }

    throw error;
  }
}

export async function signOutFirebase(): Promise<void> {
  await signOut(firebaseAuth);
}
