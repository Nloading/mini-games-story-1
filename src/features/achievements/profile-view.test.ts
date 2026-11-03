import { beforeEach, describe, expect, it } from 'vitest';
import { createProfileView } from './profile-view';
import { loadProfile, saveProfile } from './store';

const EMAIL = 'player@example.com';

describe('profile view', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders stats, locked and unlocked badges for the session user', () => {
    const profile = loadProfile(EMAIL);
    profile.stats.favoritedGames = ['tetris'];
    profile.unlocked['first-favorite'] = Date.now();
    saveProfile(EMAIL, profile);

    const view = createProfileView({
      displayName: 'Ann',
      email: EMAIL,
      authenticatedAt: Date.now(),
    });

    expect(view.querySelector('h1')?.textContent).toBe('Ann');
    expect(view.querySelectorAll('.stat-card')).toHaveLength(5);
    expect(view.querySelectorAll('.achievement-badge.is-unlocked')).toHaveLength(1);
    expect(view.querySelector('.profile-view__summary')?.textContent).toBe(
      '1 of 6 achievements unlocked'
    );
    expect(view.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('1');
  });
});
