import './filter-bar.scss';

const categories = ['All Games', 'Puzzle', 'Card', 'Match', 'Farm', 'Strategy', 'Arcade'];
const sortOptions = ['Rating ↑', 'Rating ↓', 'Name A→Z', 'Name Z→A'];

export function createFilterBar(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'filter-bar';
  section.innerHTML = `
    <div class="filter-bar__inner">
      <div class="filter-bar__chips" role="group" aria-label="Filter by category">
        ${categories
          .map(
            (cat, i) => `
          <button type="button" class="filter-chip${
            i === 0 ? ' is-selected' : ''
          }" data-category="${cat}">
            ${cat}
          </button>
        `
          )
          .join('')}
      </div>

      <div class="sort-control">
        <button type="button" class="sort-control__trigger" aria-haspopup="listbox" aria-expanded="false">
          <span data-sort-label>Sort by: Rating ↓</span>
          <img src="" alt="" width="14" height="14" />
        </button>
        <ul class="sort-control__menu" role="listbox" hidden>
          ${sortOptions
            .map(
              (opt) => `
            <li role="option" class="sort-control__option${
              opt === 'Rating ↓' ? ' is-selected' : ''
            }" data-sort="${opt}">
              <span class="sort-control__check"><img src="" alt="" width="12" height="12" /></span>
              ${opt}
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    </div>
  `;

  const chips = section.querySelectorAll<HTMLButtonElement>('.filter-chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      const category =
        chip.dataset.category?.toLowerCase() === 'all games'
          ? 'all'
          : chip.dataset.category?.toLowerCase();
      document.dispatchEvent(new CustomEvent('library:filter', { detail: category ?? 'all' }));
    });
  });

  const trigger = section.querySelector<HTMLButtonElement>('.sort-control__trigger')!;
  const menu = section.querySelector<HTMLUListElement>('.sort-control__menu')!;
  const label = section.querySelector<HTMLSpanElement>('[data-sort-label]')!;
  const options = section.querySelectorAll<HTMLLIElement>('.sort-control__option');

  function closeMenu(): void {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onOutsideClick);
  }

  function onOutsideClick(e: MouseEvent): void {
    if (!section.contains(e.target as Node)) closeMenu();
  }

  trigger.addEventListener('click', () => {
    const isOpen = !menu.hidden;
    if (isOpen) {
      closeMenu();
    } else {
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', onOutsideClick);
    }
  });

  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      options.forEach((o) => o.classList.remove('is-selected'));
      opt.classList.add('is-selected');
      label.textContent = `Sort by: ${opt.dataset.sort}`;
      document.dispatchEvent(new CustomEvent('library:sort', { detail: opt.dataset.sort }));
      closeMenu();
    });
  });

  return section;
}
