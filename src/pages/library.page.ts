import { createLibraryHeader } from '../components/library-header/library-header';
import { createFilterBar } from '../components/filter-bar/filter-bar';
import { createGameGrid } from '../components/game-grid/game-grid';
import { createPagination } from '../components/pagination/pagination';

export function createLibraryPage(): HTMLElement {
  const page = document.createElement('main');
  page.className = 'library-page';
  page.setAttribute('aria-label', 'Game library page');

  const filterBar = createFilterBar({
    onCategoryChange: () => undefined,
    onSortChange: () => undefined,
  });
  const pagination = createPagination(() => undefined);

  page.append(createLibraryHeader(), filterBar.element, createGameGrid(), pagination.element);

  return page;
}
