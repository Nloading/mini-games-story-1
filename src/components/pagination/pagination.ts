import './pagination.scss';
import arrowBack from '../../assets/images/arrow_back.png';
import arrowForward from '../../assets/images/arrow_forward.png';

const DESKTOP_VISIBLE_PAGES = 4;
const MOBILE_VISIBLE_PAGES = 3;
const MOBILE_QUERY = '(max-width: 767px)';

export interface PaginationState {
  page: number;
  totalPages: number;
}

export interface Pagination {
  element: HTMLElement;
  update: (state: PaginationState) => void;
}

export function getVisiblePages(page: number, totalPages: number, limit: number): number[] {
  const count = Math.min(limit, totalPages);
  const firstPage = Math.min(Math.max(1, page - 1), totalPages - count + 1);

  return Array.from({ length: count }, (_, index) => firstPage + index);
}

export function createPagination(onPageChange: (page: number) => void): Pagination {
  const nav = document.createElement('nav');
  nav.className = 'pagination';
  nav.setAttribute('aria-label', 'Pagination');

  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  let state: PaginationState = { page: 1, totalPages: 1 };

  const render = (): void => {
    const limit = mobileQuery.matches ? MOBILE_VISIBLE_PAGES : DESKTOP_VISIBLE_PAGES;
    const pages = getVisiblePages(state.page, state.totalPages, limit);

    nav.innerHTML = `
      <button type="button" class="pagination__arrow" data-dir="-1" aria-label="Previous page" ${
        state.page <= 1 ? 'disabled' : ''
      }>
        <img src="${arrowBack}" alt="" width="14" height="14" />
      </button>
      ${pages
        .map(
          (page) => `
        <button type="button" class="pagination__page${
          page === state.page ? ' is-active' : ''
        }" data-page="${page}" aria-label="Page ${page}" aria-current="${
            page === state.page ? 'page' : 'false'
          }">
          ${page}
        </button>
      `
        )
        .join('')}
      <button type="button" class="pagination__arrow" data-dir="1" aria-label="Next page" ${
        state.page >= state.totalPages ? 'disabled' : ''
      }>
        <img src="${arrowForward}" alt="" width="14" height="14" />
      </button>
    `;
  };

  nav.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest<HTMLButtonElement>('.pagination__page, .pagination__arrow');
    if (!button || button.disabled) return;

    const requestedPage = button.dataset.page
      ? Number(button.dataset.page)
      : state.page + Number(button.dataset.dir);
    const nextPage = Math.min(Math.max(1, requestedPage), state.totalPages);

    if (nextPage !== state.page) onPageChange(nextPage);
  });

  const onBreakpointChange = (): void => {
    if (nav.isConnected) {
      render();
    } else {
      mobileQuery.removeEventListener('change', onBreakpointChange);
    }
  };
  mobileQuery.addEventListener('change', onBreakpointChange);

  render();

  return {
    element: nav,
    update: (next) => {
      const totalPages = Math.max(1, next.totalPages);
      state = { totalPages, page: Math.min(Math.max(1, next.page), totalPages) };
      render();
    },
  };
}
