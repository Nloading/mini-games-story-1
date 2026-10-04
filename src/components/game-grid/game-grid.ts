import './game-grid.scss';
import starIcon from '../../assets/images/star.png';
import likeIcon from '../../assets/images/heart.png';
import catMailImage from '../../assets/images/catmail.jpg';
import heartopiaImage from '../../assets/images/heartopia.jpg';
import paliaImage from '../../assets/images/palia.jpg';
import shelveImage from '../../assets/images/shelve.jpg';
import vacationImage from '../../assets/images/vacation.jpg';
import winterImage from '../../assets/images/winter.jpg';
import { ApiGame, fallbackGames, getGames } from '../../data/mock-api';

const localImages: Record<string, string> = {
  'vacation-cafe-simulator': vacationImage,
  'winter-burrow': winterImage,
  'shelve-the-potions': shelveImage,
  heartopia: heartopiaImage,
  palia: paliaImage,
  'cat-mail-co': catMailImage,
};

type LibraryGame = ApiGame;
const PAGE_SIZE = 6;

function renderCard(game: LibraryGame): string {
  const image = localImages[game.slug] ?? vacationImage;
  const likes = (game.likesCount / 1000).toFixed(1).replace('.0', '') + 'K';
  return `
    <li class="library-card">
      <img class="library-card__cover" src="${image}" alt="${game.name}" loading="lazy" />
      <div class="library-card__body">
        <div class="library-card__top">
          <h3>${game.name}</h3>
          <span class="category-chip">${game.category}</span>
          <span class="price${game.price === 'Free' ? ' price--free' : ''}">${game.price}</span>
        </div>
        <p class="library-card__desc">${game.shortDescription}</p>
        <div class="library-card__meta">
          <span class="library-card__stat">
            <img src="${starIcon}" alt="" width="16" height="16" />
            ${game.rating}
          </span>
          <span class="library-card__stat">
            <img src="${likeIcon}" alt="" width="16" height="16" />
            ${likes}
          </span>
          <button type="button" class="btn btn--primary btn--sm library-card__details">Details</button>
        </div>
      </div>
    </li>
  `;
}

function sortGames(games: LibraryGame[], sortOption: string): LibraryGame[] {
  return [...games].sort((firstGame, secondGame) => {
    switch (sortOption) {
      case 'Rating ↑':
        return firstGame.rating - secondGame.rating;
      case 'Name A→Z':
        return firstGame.name.localeCompare(secondGame.name);
      case 'Name Z→A':
        return secondGame.name.localeCompare(firstGame.name);
      case 'Rating ↓':
      default:
        return secondGame.rating - firstGame.rating;
    }
  });
}

export function createGameGrid(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'game-grid';
  section.innerHTML = `
    <div class="game-grid__inner">
      <ul class="game-grid__list">
        ${sortGames(fallbackGames, 'Rating ↓').map(renderCard).join('')}
      </ul>
    </div>
  `;

  const list = section.querySelector<HTMLUListElement>('.game-grid__list');
  let games = fallbackGames;
  let category = 'all';
  let sortOption = 'Rating ↓';
  let currentPage = 1;

  const renderGames = (): void => {
    const filteredGames =
      category === 'all' ? games : games.filter((game) => game.category === category);
    const sortedGames = sortGames(filteredGames, sortOption);
    const totalPages = Math.max(1, Math.ceil(sortedGames.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const firstGame = (currentPage - 1) * PAGE_SIZE;

    if (list) {
      list.innerHTML = sortedGames
        .slice(firstGame, firstGame + PAGE_SIZE)
        .map(renderCard)
        .join('');
    }
    document.dispatchEvent(
      new CustomEvent('library:pagination-update', { detail: { totalPages, currentPage } })
    );
  };

  void getGames().then((loadedGames) => {
    games = loadedGames;
    currentPage = 1;
    renderGames();
  });

  document.addEventListener('library:filter', (event) => {
    category = (event as CustomEvent<string>).detail ?? 'all';
    currentPage = 1;
    renderGames();
  });

  document.addEventListener('library:sort', (event) => {
    const nextSortOption = (event as CustomEvent<string>).detail;
    if (nextSortOption) {
      sortOption = nextSortOption;
      currentPage = 1;
      renderGames();
    }
  });

  document.addEventListener('library:page-change', (event) => {
    const nextPage = Number((event as CustomEvent<number>).detail);
    if (Number.isInteger(nextPage) && nextPage > 0) {
      currentPage = nextPage;
      renderGames();
    }
  });

  renderGames();

  return section;
}
