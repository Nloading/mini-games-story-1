import './game-details-dialog.scss';
import starIcon from '../../assets/images/star.png';
import closeIcon from '../../assets/images/closeIcon.png';
import { fetchGameDetails } from '@/api/endpoints';
import { isUnknownResourceError } from '@/api/http';
import { resolveAssetUrl } from '@/api/config';
import type { GameDetails, TopRecord } from '@/api/types';
import { createEmptyState, createSkeleton } from '@/components/feedback/feedback';
import { loadIntoRegion } from '@/utils/async-region';
import { formatRelativeTime } from '@/utils/relative-time';
import { escapeHtml } from '@/utils/html';
import { getSession, subscribeSession } from '@/auth/session-store';
import { createFavoriteControl } from './favorite-control';
import { createCommentsSection } from './comments-section';

const MEDALS: readonly string[] = ['🥇', '🥈', '🥉'];
const SKELETON_COMMENTS = 3;
const SKELETON_RECORDS = 3;

export interface GameDetailsDialog {
  element: HTMLDialogElement;
  show: (slug: string) => void;
  hide: () => void;
  setSuspended: (value: boolean) => void;
}

function createElement(tag: string, className: string, html = ''): HTMLElement {
  const element = document.createElement(tag);
  element.className = className;
  element.innerHTML = html;

  return element;
}

function renderRecord(record: TopRecord): string {
  const medal = MEDALS[record.position - 1] ?? String(record.position);

  return `
    <li class="record-row">
      <span class="record-row__rank">
        <span class="record-row__medal" aria-label="Place ${record.position}">${medal}</span>
        ${escapeHtml(record.playerName)}
      </span>
      <span class="record-row__score">${record.score.toLocaleString('en-US')} pts</span>
      <span class="record-row__time">${escapeHtml(formatRelativeTime(record.achievedAt))}</span>
    </li>
  `;
}

function createDetailsSkeleton(): HTMLElement {
  const wrapper = createElement('div', 'game-dialog__skeleton');
  const content = createElement('div', 'game-dialog__content');
  const records = createElement('div', 'records__list');
  const comments = createElement('div', 'comments__list');

  records.append(...Array.from({ length: SKELETON_RECORDS }, () => createSkeleton('line')));
  comments.append(...Array.from({ length: SKELETON_COMMENTS }, () => createSkeleton('line')));
  content.append(
    createSkeleton('title'),
    createSkeleton('line'),
    createSkeleton('line'),
    createSkeleton('line'),
    records
  );
  wrapper.append(createSkeleton('image'), content);
  wrapper.setAttribute('aria-hidden', 'true');

  return wrapper;
}

function createNotFoundState(): HTMLElement {
  const wrapper = createElement('div', 'game-dialog__state');
  wrapper.append(
    createEmptyState('Game Not Found', 'We could not find this game. It may have been removed.')
  );

  return wrapper;
}

function renderDetails(game: GameDetails): HTMLElement {
  const wrapper = createElement(
    'div',
    'game-dialog__details',
    `
      <div class="game-dialog__hero">
        <img src="${escapeHtml(resolveAssetUrl(game.heroImage))}" alt="${escapeHtml(game.name)}" />
      </div>

      <div class="game-dialog__content">
        <div class="game-dialog__title-row">
          <h2>${escapeHtml(game.name)}</h2>
          <span class="game-dialog__stat">
            <img src="${starIcon}" alt="" width="16" height="16" /> ${game.rating.toFixed(1)}
          </span>
          <span data-favorite-slot></span>
        </div>

        <p class="game-dialog__desc">${escapeHtml(game.fullDescription)}</p>

        <div class="detail-chips">
          <div class="detail-chip"><span>Genre</span><strong>${escapeHtml(
            game.specs.genre
          )}</strong></div>
          <div class="detail-chip"><span>Players</span><strong>${escapeHtml(
            game.specs.players
          )}</strong></div>
          <div class="detail-chip"><span>Duration</span><strong>${escapeHtml(
            game.specs.duration
          )}</strong></div>
          <div class="detail-chip"><span>Price</span><strong>${escapeHtml(
            game.specs.price
          )}</strong></div>
        </div>

        <section class="records">
          <h3><span aria-hidden="true">🏆</span> Top Records</h3>
          <ul class="records__list">
            ${game.topRecords.map(renderRecord).join('')}
          </ul>
        </section>

        <div data-comments-slot></div>
      </div>
    `
  );

  wrapper.querySelector('[data-favorite-slot]')?.replaceWith(
    createFavoriteControl(game.slug, {
      isFavorited: game.isLikedByCurrentUser,
      likesCount: game.likesCount,
    })
  );

  wrapper.querySelector('[data-comments-slot]')?.replaceWith(createCommentsSection(game.slug));

  return wrapper;
}

async function loadGame(slug: string, signal: AbortSignal): Promise<GameDetails | null> {
  try {
    const response = await fetchGameDetails(slug, getSession()?.email, signal);

    return response.data;
  } catch (error) {
    if (isUnknownResourceError(error)) {
      return null;
    }

    throw error;
  }
}

export function createGameDetailsDialog(): GameDetailsDialog {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-dialog';
  dialog.setAttribute('aria-label', 'Game details');
  dialog.innerHTML = `
    <div class="game-dialog__panel">
      <div class="game-dialog__close-bar">
        <button type="button" class="hero-icon-btn game-dialog__close" aria-label="Close dialog">
          <img src="${closeIcon}" alt="" width="16" height="16" />
        </button>
      </div>
      <div class="game-dialog__body"></div>
    </div>
  `;

  const panel = dialog.querySelector<HTMLElement>('.game-dialog__panel')!;
  const body = dialog.querySelector<HTMLElement>('.game-dialog__body')!;
  let shownSlug: string | null = null;

  dialog.querySelector('.game-dialog__close')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  function load(slug: string): void {
    void loadIntoRegion<GameDetails | null>({
      target: body,
      load: (signal) => loadGame(slug, signal),
      renderSkeleton: createDetailsSkeleton,
      isEmpty: (game) => game === null,
      renderEmpty: createNotFoundState,
      renderContent: (game) => (game === null ? createNotFoundState() : renderDetails(game)),
    });
  }

  function show(slug: string): void {
    if (dialog.open && shownSlug === slug) {
      return;
    }

    shownSlug = slug;
    panel.scrollTop = 0;
    if (!dialog.open) dialog.showModal();

    load(slug);
  }

  // Login, logout and expiry refresh details in the matching mode while the dialog is hidden by Auth.
  subscribeSession(() => {
    if (shownSlug !== null && dialog.open) load(shownSlug);
  });

  function hide(): void {
    shownSlug = null;
    if (dialog.open) dialog.close();
  }

  function setSuspended(value: boolean): void {
    dialog.classList.toggle('is-suspended', value);
  }

  return { element: dialog, show, hide, setSuspended };
}
