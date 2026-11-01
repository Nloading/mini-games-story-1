import { achievements } from './achievements';
import type { Achievement, ProfileData } from './types';

const PERCENT = 100;

export interface AchievementState {
  achievement: Achievement;
  current: number;
  percent: number;
  unlockedAt: number | null;
}

export function getAchievementStates(profile: ProfileData): AchievementState[] {
  return achievements.map((achievement) => {
    const current = Math.min(achievement.progress(profile.stats), achievement.target);

    return {
      achievement,
      current,
      percent: Math.round((current / achievement.target) * PERCENT),
      unlockedAt: profile.unlocked[achievement.id] ?? null,
    };
  });
}
