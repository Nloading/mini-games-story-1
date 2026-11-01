import { getSession, subscribeSession } from '@/auth/session-store';
import { achievements } from './achievements';
import { bus } from './events';
import { loadProfile, saveProfile } from './store';
import type { Stats } from './types';

let initialized = false;

function addUnique(list: string[], value: string): void {
  if (!list.includes(value)) list.push(value);
}

function track(update: (stats: Stats) => void): void {
  const session = getSession();
  if (session === null) return;

  const profile = loadProfile(session.email);
  update(profile.stats);

  const newlyUnlocked = achievements.filter(
    (achievement) =>
      !profile.unlocked[achievement.id] && achievement.progress(profile.stats) >= achievement.target
  );

  const now = Date.now();
  newlyUnlocked.forEach((achievement) => {
    profile.unlocked[achievement.id] = now;
  });

  saveProfile(session.email, profile);

  newlyUnlocked.forEach((achievement) => {
    bus.emit('achievement:unlocked', { achievement });
  });
}

export function initAchievements(): void {
  if (initialized) return;
  initialized = true;

  // Only a real sign-in counts; a restored session must not inflate the login counter.
  subscribeSession((_session, event) => {
    if (event === 'started') {
      track((stats) => {
        stats.logins += 1;
      });
    }
  });

  bus.on('favorite:added', ({ gameSlug }) => {
    track((stats) => addUnique(stats.favoritedGames, gameSlug));
  });

  bus.on('comment:posted', () => {
    track((stats) => {
      stats.commentsPosted += 1;
    });
  });

  bus.on('comment:liked', ({ commentId }) => {
    track((stats) => addUnique(stats.likedComments, commentId));
  });

  bus.on('game:opened', ({ gameSlug }) => {
    track((stats) => addUnique(stats.gamesOpened, gameSlug));
  });
}
