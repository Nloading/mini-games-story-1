import './game-details-dialog.scss';
import starIcon from '../../assets/images/star.png';
import heartIcon from '../../assets/images/heart.png';
import tukoniImage from '../../assets/images/tukoni.jpg';
import closeIcon from '../../assets/images/closeicon.png';
import sendTrigger from '../../assets/images/sendTrigger.png';

interface Record {
  rank: number;
  name: string;
  score: string;
  time: string;
  medal: string;
}

interface Comment {
  initial: string;
  name: string;
  time: string;
  text: string;
  likes: number;
}

interface GameDetails {
  title: string;
  rating: number;
  likes: string;
  description: string;
  genre: string;
  players: string;
  duration: string;
  price: string;
  records: Record[];
  comments: Comment[];
}

const sampleGame: GameDetails = {
  title: 'Tukoni: Forest Keepers',
  rating: 4.9,
  likes: '31.2K',
  description:
    'Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.',
  genre: 'Puzzle',
  players: 'Solo',
  duration: '40-90 min',
  price: 'Free',
  records: [
    { rank: 1, name: 'ForestSpirit', score: '356,700 pts', time: '2 days ago', medal: '🥇' },
    { rank: 2, name: 'TeaBrewer', score: '332,400pts', time: '5 days ago', medal: '🥈' },
    { rank: 3, name: 'HerbalistPath', score: '308,900 pts', time: '1 week ago', medal: '🥉' },
  ],
  comments: [
    {
      initial: 'F',
      name: 'ForestDweller',
      time: '3 hours ago',
      text: "The hand-drawn art is absolutely magical. Every location feels like a page from a children's storybook. The mushroom village made me cry happy tears!",
      likes: 12,
    },
    {
      initial: 'H',
      name: 'HerbalTeaLover',
      time: '1 day ago',
      text: 'Perfect cozy evening game — brew a cup of chamomile, wrap in a blanket and help the little Tukoni prepare for winter. The puzzles are gentle but satisfying.',
      likes: 5,
    },
    {
      initial: 'C',
      name: 'CottageCoreMia',
      time: '3 days ago',
      text: 'I want to live inside this game forever. The NPCs are so charming, the tea recipes are real, and the atmosphere is pure warmth and calm.',
      likes: 8,
    },
  ],
};

function renderRecord(record: Record): string {
  return `
    <li class="record-row">
      <span class="record-row__rank">
        <span class="record-row__medal" aria-label="${record.rank} place">${record.medal}</span>
        ${record.name}
      </span>
      <span class="record-row__score">${record.score}</span>
      <span class="record-row__time">${record.time}</span>
    </li>
  `;
}

function renderComment(comment: Comment, index: number): string {
  const avatarVariant = (index % 5) + 1;
  return `
    <li class="comment">
      <span class="avatar avatar--${avatarVariant}">${comment.initial}</span>
      <div class="comment__body">
        <div class="comment__meta">
          <span class="comment__name">${comment.name}</span>
          <span class="comment__time">${comment.time}</span>
        </div>
        <p class="comment__text">${comment.text}</p>
        <button type="button" class="comment__like">
          <img src="${heartIcon}" alt="" width="14" height="14" />
          ${comment.likes}
        </button>
      </div>
    </li>
  `;
}

export function createGameDetailsDialog(game: GameDetails = sampleGame): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-dialog';
  dialog.innerHTML = `
    <div class="game-dialog__panel">
      <div class="game-dialog__hero">
        <img src="${tukoniImage}" alt="${game.title}" />
        <div class="game-dialog__hero-actions">
          <button type="button" class="hero-icon-btn game-dialog__close" aria-label="Close dialog">
            <img src="${closeIcon}" alt="Close dialog" width="16" height="16" />
          </button>
        </div>
      </div>

      <div class="game-dialog__content">
        <div class="game-dialog__title-row">
          <h2>${game.title}</h2>
          <span class="game-dialog__stat">
            <img src="${starIcon}" alt="" width="16" height="16" /> ${game.rating}
          </span>
          <span class="game-dialog__stat">
            <img src="${heartIcon}" alt="" width="16" height="16" /> ${game.likes}
          </span>
        </div>

        <p class="game-dialog__desc">${game.description}</p>

        <div class="detail-chips">
          <div class="detail-chip"><span>Genre</span><strong>${game.genre}</strong></div>
          <div class="detail-chip"><span>Players</span><strong>${game.players}</strong></div>
          <div class="detail-chip"><span>Duration</span><strong>${game.duration}</strong></div>
          <div class="detail-chip"><span>Price</span><strong>${game.price}</strong></div>
        </div>

        <div class="game-dialog__actions">
          <button type="button" class="btn btn--primary">Play Now</button>
          <button type="button" class="btn btn--outline-lg">
            <img src="${heartIcon}" alt="" width="24" height="24" />
            <span class="btn--outline-lg__label">Add to Favorites</span>
          </button>
        </div>

        <section class="records">
          <h3><span aria-hidden="true">🏆</span> Top Records</h3>
          <ul class="records__list">
            ${game.records.map(renderRecord).join('')}
          </ul>
        </section>

        <section class="comments">
          <h3>Comments (${game.comments.length})</h3>
          <form class="comment-composer">
            <span class="avatar avatar--1">U</span>
            <input type="text" placeholder="Write a comment..." aria-label="Write a comment" />
            <button type="submit" aria-label="Send comment" class="comment-send-btn">
              <img src="${sendTrigger}" alt="Send comment" />
            </button>
          </form>
          <ul class="comments__list">
            ${game.comments.map(renderComment).join('')}
          </ul>
        </section>
      </div>
    </div>
  `;

  dialog.querySelector('.game-dialog__close')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  const composer = dialog.querySelector<HTMLFormElement>('.comment-composer')!;
  composer.addEventListener('submit', (e) => {
    e.preventDefault();
    // TODO: wire up to real comment submission once an API/store exists
    composer.reset();
  });

  return dialog;
}
