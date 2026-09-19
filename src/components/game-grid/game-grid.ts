import './game-grid.scss';
import starIcon from '../../assets/images/star.png';
import likeIcon from '../../assets/images/heart.png';
import vacationImage from '../../assets/images/vacation.jpg';
import winterImage from '../../assets/images/winter.jpg';
import shelveImage from '../../assets/images/shelve.jpg';
import paliaImage from '../../assets/images/palia.jpg';
import heartopiaImage from '../../assets/images/heartopia.jpg';
import catMailImage from '../../assets/images/catmail.jpg';

interface LibraryGame {
  title: string;
  category: string;
  price: string;
  isFree: boolean;
  description: string;
  rating: number;
  likes: string;
  image?: string;
}

const games: LibraryGame[] = [
  {
    title: 'Vacation Cafe Simulator',
    category: 'Strategy',
    price: 'Free',
    isFree: true,
    description:
      'Cozy Italian Vacation Cafe — No timers, no stress, cook traditional dishes, upgrade and customize, just drink Prosecco, relax and grow your dream cafe.',
    rating: 4.8,
    likes: '28.7K',
    image: vacationImage,
  },
  {
    title: 'Winter Burrow',
    category: 'Farm',
    price: 'Free',
    isFree: true,
    description:
      'A cozy woodland survival game about a mouse restoring their childhood burrow. Explore, gather resources, craft, knit warm sweaters, bake pies and meet the locals.',
    rating: 4.9,
    likes: '32.4K',
    image: winterImage,
  },
  {
    title: 'Shelve the Potions!',
    category: 'Puzzle',
    price: 'Free',
    isFree: true,
    description:
      "Organize 2000+ potions on shelves after the witch's cats have knocked them over, using clues around an enchanted cellar. Learn strange symbols and decipher cryptic notes.",
    rating: 4.7,
    likes: '21.3K',
    image: shelveImage,
  },
  {
    title: 'Heartopia',
    category: 'Strategy',
    price: '$1.99',
    isFree: false,
    description:
      'A multiplayer life simulation game crafted for creativity, freedom, and peace. Build your dream home, explore hobbies, and forge warm connections with friends in a cozy town.',
    rating: 4.6,
    likes: '46.8K',
    image: heartopiaImage,
  },
  {
    title: 'Palia',
    category: 'Strategy',
    price: 'Free',
    isFree: true,
    description:
      'A free-to-play fantasy life sim adventure where you can craft, explore, and create the life and home of your dreams in a vib...',
    rating: 4.8,
    likes: '89.5K',
    image: paliaImage,
  },
  {
    title: 'Cat Mail Co.',
    category: 'Puzzle',
    price: 'Free',
    isFree: true,
    description:
      'Run a cozy cat post office. Sort and deliver parcels from the daily boat. At night, the moon reveals hidden truths about packages. Clear a strange backlog and unlock new destinati...',
    rating: 4.9,
    likes: '38.2K',
    image: catMailImage,
  },
];

function renderCard(game: LibraryGame): string {
  return `
    <li class="library-card">
      <img class="library-card__cover" src="${game.image ?? ''}" alt="${
    game.title
  }" loading="lazy" />
      <div class="library-card__body">
        <div class="library-card__top">
          <h3>${game.title}</h3>
          <span class="category-chip">${game.category}</span>
          <span class="price${game.isFree ? ' price--free' : ''}">${game.price}</span>
        </div>
        <p class="library-card__desc">${game.description}</p>
        <div class="library-card__meta">
          <span class="library-card__stat">
            <img src="${starIcon}" alt="" width="16" height="16" />
            ${game.rating}
          </span>
          <span class="library-card__stat">
            <img src="${likeIcon}" alt="" width="16" height="16" />
            ${game.likes}
          </span>
          <button type="button" class="btn btn--primary btn--sm library-card__details">Details</button>
        </div>
      </div>
    </li>
  `;
}

function sortGames(sortOption: string): LibraryGame[] {
  return [...games].sort((firstGame, secondGame) => {
    switch (sortOption) {
      case 'Rating ↑':
        return firstGame.rating - secondGame.rating;
      case 'Name A→Z':
        return firstGame.title.localeCompare(secondGame.title);
      case 'Name Z→A':
        return secondGame.title.localeCompare(firstGame.title);
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
        ${sortGames('Rating ↓').map(renderCard).join('')}
      </ul>
    </div>
  `;

  const list = section.querySelector<HTMLUListElement>('.game-grid__list');
  document.addEventListener('library:sort', (event) => {
    const sortOption = (event as CustomEvent<string>).detail;
    if (list && sortOption) {
      list.innerHTML = sortGames(sortOption).map(renderCard).join('');
    }
  });

  return section;
}
