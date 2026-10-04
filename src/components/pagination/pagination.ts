import './pagination.scss';
import arrowBack from '../../assets/images/arrow_back.png';
import arrowForward from '../../assets/images/arrow_forward.png';

export function createPagination(totalPages: number, currentPage = 1): HTMLElement {
  const nav = document.createElement('nav');
  nav.className = 'pagination';
  nav.setAttribute('aria-label', 'Pagination');

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  nav.innerHTML = `
    <button type="button" class="pagination__arrow" data-dir="-1" aria-label="Previous page" ${
      currentPage === 1 ? 'disabled' : ''
    }>
      <img src="${arrowBack}" alt="" width="14" height="14" />
    </button>
    ${pages
      .map(
        (page) => `
      <button type="button" class="pagination__page${
        page === currentPage ? ' is-active' : ''
      }" data-page="${page}" aria-current="${page === currentPage ? 'page' : 'false'}">
        ${page}
      </button>
    `
      )
      .join('')}
    <button type="button" class="pagination__arrow" data-dir="1" aria-label="Next page" ${
      currentPage === totalPages ? 'disabled' : ''
    }>
      <img src="${arrowForward}" alt="" width="14" height="14" />
    </button>
  `;

  nav.querySelectorAll<HTMLButtonElement>('.pagination__page').forEach((btn) => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.pagination__page').forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-current', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-current', 'page');
      // TODO: hook into game-grid pagination once data fetching is wired up
    });
  });

  return nav;
}
