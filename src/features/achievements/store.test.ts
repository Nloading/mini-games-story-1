import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadProfile, saveProfile } from './store';

const EMAIL = 'Player@Example.com';

describe('achievement store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty profile for a user without saved data', () => {
    const profile = loadProfile(EMAIL);

    expect(profile.stats).toEqual({
      favoritedGames: [],
      commentsPosted: 0,
      likedComments: [],
      gamesOpened: [],
      logins: 0,
    });
    expect(profile.unlocked).toEqual({});
  });

  it('round-trips a saved profile', () => {
    const profile = loadProfile(EMAIL);
    profile.stats.logins = 2;
    profile.unlocked['regular'] = 123;

    saveProfile(EMAIL, profile);

    expect(loadProfile(EMAIL)).toEqual(profile);
  });

  it('treats the email case-insensitively and keeps users separate', () => {
    const profile = loadProfile(EMAIL);
    profile.stats.logins = 5;
    saveProfile(EMAIL, profile);

    expect(loadProfile('player@example.com').stats.logins).toBe(5);
    expect(loadProfile('other@example.com').stats.logins).toBe(0);
  });

  it('fills missing stats fields with defaults', () => {
    localStorage.setItem(
      'minigames:achievements:player@example.com',
      JSON.stringify({ stats: { logins: 4 } })
    );

    const profile = loadProfile(EMAIL);

    expect(profile.stats.logins).toBe(4);
    expect(profile.stats.gamesOpened).toEqual([]);
  });

  it('falls back to an empty profile when the saved data is corrupted', () => {
    localStorage.setItem('minigames:achievements:player@example.com', '{not json');

    expect(loadProfile(EMAIL).stats.logins).toBe(0);
  });

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(() => saveProfile(EMAIL, loadProfile(EMAIL))).not.toThrow();
  });
});
