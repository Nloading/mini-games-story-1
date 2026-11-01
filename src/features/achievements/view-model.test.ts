import { describe, expect, it } from 'vitest';
import { achievements } from './achievements';
import type { ProfileData } from './types';
import { getAchievementStates } from './view-model';

function createProfile(overrides: Partial<ProfileData['stats']> = {}): ProfileData {
  return {
    stats: {
      favoritedGames: [],
      commentsPosted: 0,
      likedComments: [],
      gamesOpened: [],
      logins: 0,
      ...overrides,
    },
    unlocked: {},
  };
}

function findState(profile: ProfileData, id: string) {
  const state = getAchievementStates(profile).find((item) => item.achievement.id === id);
  if (state === undefined) throw new Error(`Missing achievement ${id}`);

  return state;
}

describe('achievement view model', () => {
  it('returns one state per achievement', () => {
    expect(getAchievementStates(createProfile())).toHaveLength(achievements.length);
  });

  it('calculates progress and percent', () => {
    const state = findState(createProfile({ commentsPosted: 1 }), 'critic');

    expect(state.current).toBe(1);
    expect(state.percent).toBe(33);
    expect(state.unlockedAt).toBeNull();
  });

  it('caps progress at the target', () => {
    const state = findState(createProfile({ logins: 10 }), 'regular');

    expect(state.current).toBe(3);
    expect(state.percent).toBe(100);
  });

  it('exposes the unlock timestamp', () => {
    const profile = createProfile();
    profile.unlocked['regular'] = 999;

    expect(findState(profile, 'regular').unlockedAt).toBe(999);
  });
});
