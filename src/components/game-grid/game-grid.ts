import './game-grid.scss';
import starIcon from '../../assets/images/star.png';
import likeIcon from '../../assets/images/heart.png';
import { resolveAssetUrl } from '@/api/config';
import type { GameCard } from '@/api/types';
import { createSkeleton } from '@/components/feedback/feedback';
import { formatCount } from '@/utils/format';
import { escapeHtml } from '@/utils/html';

const FREE_PRICE = 'Free';

export interface GameGrid {
  element: HTMLElement;
  region: HTMLElement;
}

function renderCard(game: GameCard): string {
  const name = escapeHtml(game.name);
  const priceClass = game.price === FREE_PRICE ? ' price--free' : '';

  return `
    <li class="library-card">
      <img class="library-card__cover" src="${escapeHtml(
        resolveAssetUrl(game.cardImage)
      )}" alt="${name}" loading="lazy" />
      <div class="library-card__body">
        <div class="library-card__top">
          <h3>${name}</h3>
          <span class="category-chip">${escapeHtml(game.category)}</span>
          <span class="price${priceClass}">${escapeHtml(game.price)}</span>
        </div>
        <p class="library-card__desc">${escapeHtml(game.shortDescription)}</p>
        <div class="library-card__meta">
          <span class="library-card__stat">
            <img src="${starIcon}" alt="" width="16" height="16" />
            ${game.rating}
          </span>
          <span class="library-card__stat">
            <img src="${likeIcon}" alt="" width="16" height="16" />
            ${formatCount(game.likesCount)}
          </span>
          <button type="button" class="btn btn--primary btn--sm library-card__details" data-slug="${escapeHtml(
            game.slug
          )}">Details</button>
        </div>
      </div>
    </li>
  `;
}

export function createGameCards(games: GameCard[]): HTMLElement {
  const list = document.createElement('ul');
  list.className = 'game-grid__list';
  list.innerHTML = games.map(renderCard).join('');

  return list;
}

export function createGameCardsSkeleton(count: number): HTMLElement {
  const list = document.createElement('ul');
  list.className = 'game-grid__list';
  list.setAttribute('aria-hidden', 'true');

  Array.from({ length: count }).forEach(() => {
    const item = document.createElement('li');
    item.className = 'library-card library-card--skeleton';

    const cover = createSkeleton('image');
    cover.classList.add('library-card__cover');

    const body = document.createElement('div');
    body.className = 'library-card__body';
    body.append(createSkeleton('title'), createSkeleton('line'), createSkeleton('line'));

    item.append(cover, body);
    list.append(item);
  });

  return list;
}

export function createGameGrid(): GameGrid {
  const section = document.createElement('section');
  section.className = 'game-grid';
  section.innerHTML = `
    <div class="game-grid__inner">
      <div class="game-grid__region"></div>
    </div>
  `;

  return { element: section, region: section.querySelector<HTMLDivElement>('.game-grid__region')! };
}
