import './pagination.scss';
import arrowBack from '../../assets/images/arrow_back.png';
import arrowForward from '../../assets/images/arrow_forward.png';

export function createPagination(totalPages: number, currentPage = 1): HTMLElement {
  const nav = document.createElement('nav');
  nav.className = 'pagination';
  nav.setAttribute('aria-label', 'Pagination');

  let pageCount = Math.max(1, totalPages);
  let activePage = Math.min(Math.max(1, currentPage), pageCount);

  const render = (): void => {
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
    nav.innerHTML = `
      <button type="button" class="pagination__arrow" data-dir="-1" aria-label="Previous page" ${
        activePage === 1 ? 'disabled' : ''
      }>
        <img src="${arrowBack}" alt="" width="14" height="14" />
      </button>
      ${pages
        .map(
          (page) => `
        <button type="button" class="pagination__page${
          page === activePage ? ' is-active' : ''
        }" data-page="${page}" aria-current="${page === activePage ? 'page' : 'false'}">
          ${page}
        </button>
      `
        )
        .join('')}
      <button type="button" class="pagination__arrow" data-dir="1" aria-label="Next page" ${
        activePage === pageCount ? 'disabled' : ''
      }>
        <img src="${arrowForward}" alt="" width="14" height="14" />
      </button>
    `;
  };

  nav.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '.pagination__page, .pagination__arrow'
    );
    if (!button || button.disabled) return;

    const requestedPage = button.dataset.page
      ? Number(button.dataset.page)
      : activePage + Number(button.dataset.dir);
    activePage = Math.min(Math.max(1, requestedPage), pageCount);
    render();
    document.dispatchEvent(new CustomEvent('library:page-change', { detail: activePage }));
  });

  document.addEventListener('library:pagination-update', (event) => {
    const detail = (event as CustomEvent<{ totalPages: number; currentPage: number }>).detail;
    pageCount = Math.max(1, detail.totalPages);
    activePage = Math.min(Math.max(1, detail.currentPage), pageCount);
    render();
  });

  render();
  return nav;
}
