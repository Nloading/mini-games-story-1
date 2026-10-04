import './game-details-dialog.scss';
import starIcon from '../../assets/images/star.png';
import heartIcon from '../../assets/images/heartnotactive.png';
import heartActiveIcon from '../../assets/images/heart.png';
import closeIcon from '../../assets/images/closeIcon.png';
import { fetchGameComments, fetchGameDetails } from '@/api/endpoints';
import { isUnknownResourceError } from '@/api/http';
import { resolveAssetUrl } from '@/api/config';
import type { GameComment, GameCommentsResponse, GameDetails, TopRecord } from '@/api/types';
import { createEmptyState, createSkeleton } from '@/components/feedback/feedback';
import { loadIntoRegion } from '@/utils/async-region';
import { formatCount } from '@/utils/format';
import { formatRelativeTime } from '@/utils/relative-time';
import { escapeHtml } from '@/utils/html';

const MEDALS: readonly string[] = ['🥇', '🥈', '🥉'];
const AVATAR_VARIANTS = 5;
const SKELETON_COMMENTS = 3;
const SKELETON_RECORDS = 3;

export interface GameDetailsDialog {
  element: HTMLDialogElement;
  show: (slug: string) => void;
  hide: () => void;
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

function renderComment(comment: GameComment, index: number): string {
  const initial = Array.from(comment.authorName)[0]?.toUpperCase() ?? '?';
  const avatarVariant = (index % AVATAR_VARIANTS) + 1;
  const icon = comment.isLikedByCurrentUser ? heartActiveIcon : heartIcon;

  return `
    <li class="comment">
      <span class="avatar avatar--${avatarVariant}" aria-hidden="true">${escapeHtml(initial)}</span>
      <div class="comment__body">
        <div class="comment__meta">
          <span class="comment__name">${escapeHtml(comment.authorName)}</span>
          <span class="comment__time">${escapeHtml(formatRelativeTime(comment.createdAt))}</span>
        </div>
        <p class="comment__text">${escapeHtml(comment.text)}</p>
        <span class="comment__like${comment.isLikedByCurrentUser ? ' is-liked' : ''}" aria-label="${
    comment.likesCount
  } likes">
          <img src="${icon}" alt="" width="14" height="14" />
          ${comment.likesCount}
        </span>
      </div>
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

function createCommentsSkeleton(): HTMLElement {
  const list = createElement('div', 'comments__list');
  list.setAttribute('aria-hidden', 'true');
  list.append(...Array.from({ length: SKELETON_COMMENTS }, () => createSkeleton('line')));

  return list;
}

function createNotFoundState(): HTMLElement {
  const wrapper = createElement('div', 'game-dialog__state');
  wrapper.append(
    createEmptyState('Game Not Found', 'We could not find this game. It may have been removed.')
  );

  return wrapper;
}

function loadComments(slug: string, region: HTMLElement, heading: HTMLElement): void {
  void loadIntoRegion<GameCommentsResponse>({
    target: region,
    load: (signal) => fetchGameComments(slug, signal),
    renderSkeleton: createCommentsSkeleton,
    isEmpty: (response) => response.data.length === 0,
    renderEmpty: (response) => {
      heading.textContent = `Comments (${response.meta.totalComments})`;

      return createEmptyState('No comments yet');
    },
    renderContent: (response) => {
      heading.textContent = `Comments (${response.meta.totalComments})`;
      const list = createElement('ul', 'comments__list', response.data.map(renderComment).join(''));

      return list;
    },
  });
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
          <span class="game-dialog__stat">
            <img src="${heartIcon}" alt="" width="16" height="16" /> ${formatCount(game.likesCount)}
          </span>
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

        <section class="comments">
          <h3 data-comments-heading>Comments</h3>
          <div data-comments-region></div>
        </section>
      </div>
    `
  );

  const heading = wrapper.querySelector<HTMLElement>('[data-comments-heading]');
  const region = wrapper.querySelector<HTMLElement>('[data-comments-region]');
  if (heading && region) {
    loadComments(game.slug, region, heading);
  }

  return wrapper;
}

async function loadGame(slug: string, signal: AbortSignal): Promise<GameDetails | null> {
  try {
    const response = await fetchGameDetails(slug, signal);

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

  function show(slug: string): void {
    if (dialog.open && shownSlug === slug) {
      return;
    }

    shownSlug = slug;
    panel.scrollTop = 0;
    if (!dialog.open) dialog.showModal();

    void loadIntoRegion<GameDetails | null>({
      target: body,
      load: (signal) => loadGame(slug, signal),
      renderSkeleton: createDetailsSkeleton,
      isEmpty: (game) => game === null,
      renderEmpty: createNotFoundState,
      renderContent: (game) => (game === null ? createNotFoundState() : renderDetails(game)),
    });
  }

  function hide(): void {
    shownSlug = null;
    if (dialog.open) dialog.close();
  }

  return { element: dialog, show, hide };
}
