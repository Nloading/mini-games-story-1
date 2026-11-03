import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { achievements } from './achievements';
import { bus } from './events';
import { initAchievementToasts } from './toast';

describe('achievement toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.replaceChildren();
    initAchievementToasts();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the unlocked achievement in a live region and removes it later', () => {
    const [achievement] = achievements;
    if (achievement === undefined) throw new Error('No achievements defined');

    bus.emit('achievement:unlocked', { achievement });

    const region = document.querySelector('.achievement-toasts');
    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.getAttribute('popover')).toBe('manual');
    expect(region?.getAttribute('data-popover-open')).toBe('true');
    expect(region?.textContent).toContain(achievement.title);

    vi.runAllTimers();

    expect(document.querySelector('.achievement-toast')).toBeNull();
    expect(region?.getAttribute('data-popover-open')).toBeNull();
  });
});
