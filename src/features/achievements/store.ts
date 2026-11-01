import type { ProfileData, Stats } from './types';

const KEY_PREFIX = 'minigames:achievements:';

function createEmptyStats(): Stats {
  return { favoritedGames: [], commentsPosted: 0, likedComments: [], gamesOpened: [], logins: 0 };
}

function createEmptyProfile(): ProfileData {
  return { stats: createEmptyStats(), unlocked: {} };
}

function storageKey(email: string): string {
  return KEY_PREFIX + email.toLowerCase();
}

export function loadProfile(email: string): ProfileData {
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return createEmptyProfile();

    const parsed = JSON.parse(raw) as Partial<ProfileData>;

    return {
      stats: { ...createEmptyStats(), ...parsed.stats },
      unlocked: parsed.unlocked ?? {},
    };
  } catch {
    return createEmptyProfile();
  }
}

export function saveProfile(email: string, profile: ProfileData): void {
  try {
    localStorage.setItem(storageKey(email), JSON.stringify(profile));
  } catch {
    // Storage can be unavailable (private mode, quota); progress just won't persist.
  }
}
