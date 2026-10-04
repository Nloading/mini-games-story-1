import { createLibraryHeader } from '../components/library-header/library-header';
import { createFilterBar } from '../components/filter-bar/filter-bar';
import { createGameGrid } from '../components/game-grid/game-grid';
import { createPagination } from '../components/pagination/pagination';

export function createLibraryPage(): HTMLElement {
  const page = document.createElement('main');
  page.className = 'library-page';
  page.setAttribute('aria-label', 'Game library page');
  page.append(createLibraryHeader(), createFilterBar(), createGameGrid(), createPagination(4, 1));
  return page;
}
