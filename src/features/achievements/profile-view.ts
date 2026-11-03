import './profile-view.scss';
import { getProfileName } from '@/auth/profile';
import type { AppSession } from '@/auth/session';
import { loadProfile } from './store';
import { getAchievementStates } from './view-model';
import type { AchievementState } from './view-model';

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
}

function createStatCard(label: string, value: number): HTMLElement {
  const card = createElement('div', 'stat-card');
  card.append(
    createElement('strong', 'stat-card__value', String(value)),
    createElement('span', 'stat-card__label', label)
  );

  return card;
}

function formatUnlockDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function createBadge({ achievement, current, percent, unlockedAt }: AchievementState): HTMLElement {
  const badge = createElement('li', 'achievement-badge');
  badge.classList.toggle('is-unlocked', unlockedAt !== null);

  const icon = createElement('span', 'achievement-badge__icon', achievement.icon);
  icon.setAttribute('aria-hidden', 'true');

  const bar = createElement('div', 'achievement-badge__bar');
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', `${achievement.title} progress`);
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', String(achievement.target));
  bar.setAttribute('aria-valuenow', String(current));
  bar.style.setProperty('--progress', `${percent}%`);
  bar.append(createElement('span', 'achievement-badge__fill'));

  const status =
    unlockedAt === null
      ? `${current} / ${achievement.target}`
      : `Unlocked ${formatUnlockDate(unlockedAt)}`;

  badge.append(
    icon,
    createElement('h3', 'achievement-badge__title', achievement.title),
    createElement('p', 'achievement-badge__description', achievement.description),
    bar,
    createElement('p', 'achievement-badge__status', status)
  );

  return badge;
}

export function createProfileView(session: AppSession): HTMLElement {
  const { stats, unlocked } = loadProfile(session.email);
  const states = getAchievementStates({ stats, unlocked });
  const unlockedCount = states.filter((state) => state.unlockedAt !== null).length;

  const header = createElement('header', 'profile-view__header');
  header.append(
    createElement('h1', 'profile-view__title', getProfileName(session)),
    createElement('p', 'profile-view__email', session.email),
    createElement(
      'p',
      'profile-view__summary',
      `${unlockedCount} of ${states.length} achievements unlocked`
    )
  );

  const statsGrid = createElement('div', 'profile-view__stats');
  statsGrid.append(
    createStatCard('Games explored', stats.gamesOpened.length),
    createStatCard('Games favorited', stats.favoritedGames.length),
    createStatCard('Comments posted', stats.commentsPosted),
    createStatCard('Comments liked', stats.likedComments.length),
    createStatCard('Logins', stats.logins)
  );

  const badges = createElement('ul', 'profile-view__badges');
  badges.append(...states.map(createBadge));

  const inner = createElement('div', 'profile-view__inner');
  inner.append(
    header,
    statsGrid,
    createElement('h2', 'profile-view__subtitle', 'Achievements'),
    badges
  );

  const root = createElement('section', 'profile-view');
  root.append(inner);

  return root;
}
