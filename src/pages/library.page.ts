import { LIBRARY_PAGE_SIZE } from '@/api/config';
import { fetchCategories, fetchGames } from '@/api/endpoints';
import type { Category, GamesListResponse } from '@/api/types';
import { createFilterBar } from '@/components/filter-bar/filter-bar';
import { createEmptyState } from '@/components/feedback/feedback';
import {
  createGameCards,
  createGameCardsSkeleton,
  createGameGrid,
} from '@/components/game-grid/game-grid';
import { createLibraryHeader } from '@/components/library-header/library-header';
import { createPagination } from '@/components/pagination/pagination';
import { router } from '@/router/router';
import { DEFAULT_SORT } from '@/router/url-state';
import type { LibraryQuery } from '@/router/url-state';
import { loadIntoRegion } from '@/utils/async-region';

const FALLBACK_CATEGORY = 'all';
const FIRST_PAGE = 1;

function superseded(): DOMException {
  return new DOMException('Request replaced by a newer URL state', 'AbortError');
}

function isSameQuery(first: LibraryQuery, second: LibraryQuery): boolean {
  return (
    first.category === second.category && first.sort === second.sort && first.page === second.page
  );
}

export function createLibraryPage(): HTMLElement {
  const page = document.createElement('main');
  page.className = 'library-page';
  page.setAttribute('aria-label', 'Game library page');

  let categories: Category[] | null = null;
  let defaultCategory = FALLBACK_CATEGORY;
  let activeCategory = FALLBACK_CATEGORY;
  let activeSort = DEFAULT_SORT;

  const filterBar = createFilterBar({
    onCategoryChange: (slug) => {
      if (slug !== activeCategory) router.setQuery({ category: slug, page: null });
    },
    onSortChange: (sort) => {
      if (sort !== activeSort) router.setQuery({ sort, page: null });
    },
  });
  const grid = createGameGrid();
  const pagination = createPagination((nextPage) =>
    router.setQuery({ page: nextPage === FIRST_PAGE ? null : nextPage })
  );

  page.append(createLibraryHeader(), filterBar.element, grid.element, pagination.element);

  const resolveCategory = (requested: string | null): string | null => {
    if (requested === null) return defaultCategory;
    if (categories === null) return requested;

    return categories.some((category) => category.slug === requested) ? requested : null;
  };

  const showPagination = (response: GamesListResponse): void => {
    pagination.update({ page: response.meta.page, totalPages: response.meta.totalPages });
  };

  const categoriesReady = new Promise<void>((resolve) => {
    void loadIntoRegion({
      target: filterBar.chipsRegion,
      load: async (signal) => {
        const response = await fetchCategories(signal);
        categories = response.data;
        defaultCategory =
          response.data.find((category) => category.isDefault)?.slug ?? FALLBACK_CATEGORY;

        return response;
      },
      renderSkeleton: filterBar.createChipsSkeleton,
      isEmpty: (response) => response.data.length === 0,
      renderEmpty: () => createEmptyState('No categories available'),
      renderContent: (response) => filterBar.createChips(response.data, activeCategory),
    }).then(resolve);
  });

  const loadGames = (query: LibraryQuery): void => {
    void loadIntoRegion({
      target: grid.region,
      load: async (signal) => {
        await categoriesReady;
        if (signal.aborted) throw superseded();

        const category = resolveCategory(query.category);
        if (category === null) {
          router.setQuery({ category: null, page: null }, { replace: true });
          throw superseded();
        }

        activeCategory = category;
        filterBar.setActiveCategory(category);

        const response = await fetchGames({ category, sort: query.sort, page: query.page }, signal);
        const { totalPages } = response.meta;

        if (totalPages > 0 && query.page > totalPages) {
          router.setQuery(
            { page: totalPages === FIRST_PAGE ? null : totalPages },
            { replace: true }
          );
          throw superseded();
        }

        return response;
      },
      renderSkeleton: () => createGameCardsSkeleton(LIBRARY_PAGE_SIZE),
      isEmpty: (response) => response.data.length === 0,
      renderEmpty: (response) => {
        showPagination(response);
        return createEmptyState(
          'Data Not Found',
          'No games match the selected filters. Try another category.'
        );
      },
      renderContent: (response) => {
        showPagination(response);
        return createGameCards(response.data);
      },
    });
  };

  const apply = (query: LibraryQuery): void => {
    activeSort = query.sort;
    filterBar.setSort(query.sort);
    loadGames(query);
  };

  const unsubscribe = router.subscribe((state, previous) => {
    if (!page.isConnected) {
      unsubscribe();
      return;
    }

    if (previous !== null && isSameQuery(state.library, previous.library)) return;

    apply(state.library);
  });

  apply(router.getState().library);

  return page;
}
