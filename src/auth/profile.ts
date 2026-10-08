import type { AppSession } from './session';

export const FALLBACK_NAME = 'Player';

const ALPHANUMERIC_PATTERN = /[\p{L}\p{N}]/u;
const WHITESPACE_PATTERN = /\s+/;
const HTTP_URL_PATTERN = /^https?:\/\//i;
const MAX_INITIAL_WORDS = 2;

export function getProfileName(profile: Pick<AppSession, 'displayName' | 'email'>): string {
  const name = profile.displayName.trim();
  if (name !== '') return name;

  const localPart = profile.email.split('@')[0]?.trim() ?? '';

  return localPart !== '' ? localPart : FALLBACK_NAME;
}

function firstAlphanumeric(word: string): string | undefined {
  return Array.from(word).find((char) => ALPHANUMERIC_PATTERN.test(char));
}

/** Returns null when no letter or digit exists, so the caller can show a generic avatar. */
export function getInitials(name: string): string | null {
  const letters = name
    .trim()
    .split(WHITESPACE_PATTERN)
    .filter((word) => word !== '')
    .slice(0, MAX_INITIAL_WORDS)
    .map(firstAlphanumeric)
    .filter((char): char is string => char !== undefined);

  return letters.length === 0 ? null : letters.join('').toUpperCase();
}

export function getSafeAvatarUrl(url: string | undefined): string | null {
  return url !== undefined && HTTP_URL_PATTERN.test(url) ? url : null;
}
