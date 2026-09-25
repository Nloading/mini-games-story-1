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
  badge?: string;
  image?: string;
}

const games: Game[] = [
  { title: 'Tailside Cafe', rating: 4.8, likes: '12.3K', image: tailsideImage },
  { title: 'Vacation Cafe Simulator', rating: 4.8, image: vacationImage },
  { title: 'ISLANDERS: New Shores', rating: 4.9, likes: '54.2K', image: islandersImage },
  { title: 'Winter Burrow', rating: 4.9, likes: '32.4K', image: winterImage },
  { title: 'Shelve Potions', rating: 4.8, badge: '1.0', image: shelveImage },
];

function renderCard(game: Game): string {
  return `
    <li class="game-card">
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

  const list = section.querySelector<HTMLUListElement>('.game-list')!;
  const originalCards = Array.from(list.querySelectorAll<HTMLLIElement>('.game-card'));
  const cycleCount = 5;
  const middleCycle = Math.floor(cycleCount / 2);
  const middleCycleStart = middleCycle * originalCards.length;
  const repeatedCards = Array.from({ length: cycleCount }, (_, cycleIndex) =>
    originalCards.map((card) =>
      cycleIndex === middleCycle ? card : (card.cloneNode(true) as HTMLLIElement)
    )
  ).flat();
  list.replaceChildren(...repeatedCards);

  const cards = Array.from(list.querySelectorAll<HTMLLIElement>('.game-card'));
  const controls = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-dir]'));
  let activeIndex = middleCycleStart + 1;
  let settleTimer: number | undefined;
  let isProgrammaticNavigation = false;

  const setActive = (index: number): void => {
    cards.forEach((card, i) => {
      card.classList.toggle('game-card--featured', i === index);
    });
    activeIndex = index;
  };

  const centerActive = (smooth: boolean): void => {
    const card = cards[activeIndex]!;
    const listRect = list.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const left =
      list.scrollLeft + cardRect.left - listRect.left - (list.clientWidth - cardRect.width) / 2;

    if (smooth) {
      list.scrollTo({ left, behavior: 'smooth' });
      return;
    }

    const previousScrollBehavior = list.style.scrollBehavior;
    list.style.scrollBehavior = 'auto';
    list.scrollLeft = left;
    list.style.scrollBehavior = previousScrollBehavior;
  };

  const finishScroll = (): void => {
    if (!isProgrammaticNavigation) {
      const listCenter = list.getBoundingClientRect().left + list.clientWidth / 2;
      activeIndex = cards.reduce((closestIndex, card, index) => {
        const closestRect = cards[closestIndex]!.getBoundingClientRect();
        const closestDistance = Math.abs(closestRect.left + closestRect.width / 2 - listCenter);
        const cardRect = card.getBoundingClientRect();
        const distance = Math.abs(cardRect.left + cardRect.width / 2 - listCenter);
        return distance < closestDistance ? index : closestIndex;
      }, 0);
      setActive(activeIndex);
    }

    if (activeIndex < middleCycleStart || activeIndex >= middleCycleStart + originalCards.length) {
      const gameIndex = activeIndex % originalCards.length;
      list.classList.add('game-list--teleporting');
      void list.offsetWidth;
      setActive(middleCycleStart + gameIndex);
      centerActive(false);
      void list.offsetWidth;
      list.classList.remove('game-list--teleporting');
    }

    isProgrammaticNavigation = false;
    controls.forEach((control) => {
      control.disabled = false;
    });
  };

  const scheduleFinishScroll = (delay = 180): void => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(finishScroll, delay);
  };

  setActive(activeIndex);
  requestAnimationFrame(() => centerActive(false));
  list.addEventListener('scroll', () => scheduleFinishScroll(), { passive: true });
  list.addEventListener('transitionend', (event) => {
    if (event.target !== cards[activeIndex] || event.propertyName !== 'flex-basis') return;
    centerActive(true);
    scheduleFinishScroll(500);
  });

  controls.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const dir = Number(btn.dataset.dir);
      isProgrammaticNavigation = true;
      setActive(activeIndex + dir);
      controls.forEach((control) => {
        control.disabled = true;
      });
      scheduleFinishScroll(500);
    });
  });

  return section;
}
