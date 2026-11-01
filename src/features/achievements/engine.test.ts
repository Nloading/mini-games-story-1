import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSession } from '@/auth/session';
import { bus } from './events';
import { loadProfile } from './store';
import type { Achievement } from './types';

type SessionListener = (session: AppSession | null, event: string) => void;

const mocks = vi.hoisted(() => ({
  session: null as AppSession | null,
  listener: null as SessionListener | null,
}));

vi.mock('@/auth/session-store', () => ({
  getSession: () => mocks.session,
  subscribeSession: (listener: SessionListener) => {
    mocks.listener = listener;

    return vi.fn();
  },
}));

const EMAIL = 'player@example.com';
const unlockedIds: string[] = [];

function createSession(email: string): AppSession {
  return { displayName: 'Player', email, authenticatedAt: Date.now() };
}

function emitSession(event: string): void {
  mocks.listener?.(mocks.session, event);
}

describe('achievement engine', () => {
  beforeAll(async () => {
    const { initAchievements } = await import('./engine');
    initAchievements();
    // A second call must not register the listeners twice.
    initAchievements();

    bus.on('achievement:unlocked', ({ achievement }: { achievement: Achievement }) => {
      unlockedIds.push(achievement.id);
    });
  });

  beforeEach(() => {
    localStorage.clear();
    unlockedIds.length = 0;
    mocks.session = createSession(EMAIL);
  });

  it('ignores events while nobody is logged in', () => {
    mocks.session = null;

    bus.emit('favorite:added', { gameSlug: 'tetris' });

    expect(loadProfile(EMAIL).stats.favoritedGames).toEqual([]);
    expect(unlockedIds).toEqual([]);
  });

  it('unlocks an achievement exactly once', () => {
    bus.emit('favorite:added', { gameSlug: 'tetris' });
    bus.emit('favorite:added', { gameSlug: 'snake' });

    expect(unlockedIds).toEqual(['first-favorite']);
    expect(loadProfile(EMAIL).unlocked['first-favorite']).toBeTypeOf('number');
  });

  it('counts the same game or comment only once', () => {
    bus.emit('favorite:added', { gameSlug: 'tetris' });
    bus.emit('favorite:added', { gameSlug: 'tetris' });
    bus.emit('game:opened', { gameSlug: 'tetris' });
    bus.emit('game:opened', { gameSlug: 'tetris' });
    bus.emit('comment:liked', { commentId: 'c1' });
    bus.emit('comment:liked', { commentId: 'c1' });

    const { stats } = loadProfile(EMAIL);
    expect(stats.favoritedGames).toEqual(['tetris']);
    expect(stats.gamesOpened).toEqual(['tetris']);
    expect(stats.likedComments).toEqual(['c1']);
  });

  it('unlocks Collector after five different favorites', () => {
    ['a', 'b', 'c', 'd', 'e'].forEach((gameSlug) => bus.emit('favorite:added', { gameSlug }));

    expect(unlockedIds).toEqual(['first-favorite', 'collector']);
  });

  it('counts every posted comment', () => {
    ['a', 'a', 'b'].forEach((gameSlug) => bus.emit('comment:posted', { gameSlug }));

    expect(loadProfile(EMAIL).stats.commentsPosted).toBe(3);
    expect(unlockedIds).toEqual(['critic']);
  });

  it('counts a login only when a session is started, not restored', () => {
    emitSession('restored');
    expect(loadProfile(EMAIL).stats.logins).toBe(0);

    emitSession('started');
    emitSession('started');
    emitSession('started');

    expect(loadProfile(EMAIL).stats.logins).toBe(3);
    expect(unlockedIds).toEqual(['regular']);
  });

  it('keeps the progress of different users separate', () => {
    bus.emit('favorite:added', { gameSlug: 'tetris' });
    mocks.session = createSession('other@example.com');

    expect(loadProfile('other@example.com').stats.favoritedGames).toEqual([]);
  });
});
