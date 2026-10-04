import './new-games.scss';
import starIcon from '../../assets/images/star.png';
import likeIcon from '../../assets/images/heart.png';
import arrowBack from '../../assets/images/arrow_back.png';
import arrowForward from '../../assets/images/arrow_forward.png';
import tailsideImage from '../../assets/images/tailside.jpg';
import islandersImage from '../../assets/images/islanders.jpg';
import vacationImage from '../../assets/images/vacation.jpg';
import winterImage from '../../assets/images/winter.jpg';
import shelveImage from '../../assets/images/shelve.jpg';

interface Game {
  title: string;
  rating?: number;
  likes?: string;
  featured?: boolean;
  badge?: string;
  image?: string;
}

const games: Game[] = [
  { title: 'Tailside Cafe', rating: 4.8, likes: '12.3K', image: tailsideImage },
  { title: 'ISLANDERS: New Shores', rating: 4.9, likes: '54.2K', image: islandersImage },
  { title: 'Vacation Cafe Simulator', rating: 4.8, featured: true, image: vacationImage },
  { title: 'Winter Burrow', rating: 4.9, likes: '32.4K', image: winterImage },
  { title: 'Shelve Potions', rating: 4.8, badge: '1.0', image: shelveImage },
];

function renderCard(game: Game): string {
  return `
    <li class="game-card${game.featured ? ' game-card--featured' : ''}">
      <img class="game-card__cover" src="${game.image ?? ''}" alt="${game.title}" loading="lazy" />
      ${game.badge ? `<span class="game-card__badge">${game.badge}</span>` : ''}
      <div class="game-card__overlay">
        <p class="game-card__title">${game.title}</p>
        <div class="game-card__meta">
          ${
            game.rating
              ? `<span class="game-card__stat"><img src="${starIcon}" alt="" width="14" height="14" />${game.rating}</span>`
              : ''
          }
          ${
            game.likes
              ? `<span class="game-card__stat"><img src="${likeIcon}" alt="" width="14" height="14" />${game.likes}</span>`
              : ''
          }
        </div>
      </div>
    </li>
  `;
}

export function createNewGames(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'new-games';
  section.innerHTML = `
    <div class="new-games__inner">
      <div class="section-heading">
        <h2><span class="section-heading__bar" aria-hidden="true"></span>New Games</h2>
        <div class="new-games__controls">
          <button type="button" class="icon-btn icon-btn--outline" data-dir="-1" aria-label="Scroll left">
            <img src="${arrowBack}" alt="" width="16" height="16" />
          </button>
          <button type="button" class="icon-btn icon-btn--primary" data-dir="1" aria-label="Scroll right">
            <img src="${arrowForward}" alt="" width="16" height="16" />
          </button>
        </div>
      </div>
      <ul class="game-list">
        ${games.map(renderCard).join('')}
      </ul>
    </div>
  `;

  const list = section.querySelector<HTMLUListElement>('.game-list');
  section.querySelectorAll<HTMLButtonElement>('[data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir);
      list?.scrollBy({ left: dir * list.clientWidth * 0.8, behavior: 'smooth' });
    });
  });

  return section;
}
