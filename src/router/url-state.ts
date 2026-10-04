import type { SortValue } from '@/api/types';

export type PageName = 'home' | 'library' | 'not-found';
export type AuthMode = 'login' | 'register';

export const DEFAULT_SORT: SortValue = 'rating-desc';
export const DEFAULT_PAGE_NUMBER = 1;

export const QUERY_KEYS = {
  category: 'category',
  sort: 'sort',
  page: 'page',
  game: 'game',
  auth: 'auth',
} as const;

const SORT_VALUES: readonly SortValue[] = ['rating-desc', 'rating-asc', 'name-asc', 'name-desc'];
const AUTH_MODES: readonly AuthMode[] = ['login', 'register'];
const CATEGORY_PATTERN = /^[a-z0-9-]+$/;
const PAGE_NUMBER_PATTERN = /^\d+$/;

const PAGE_BY_PATH = new Map<string, PageName>([
  ['/', 'home'],
  ['/home', 'home'],
  ['/library', 'library'],
]);

export interface LibraryQuery {
  category: string | null;
  sort: SortValue;
  page: number;
}

export interface RouteState {
  page: PageName;
  path: string;
  library: LibraryQuery;
  gameSlug: string | null;
  authMode: AuthMode | null;
}

function isSortValue(value: string): value is SortValue {
  return (SORT_VALUES as readonly string[]).includes(value);
}

function isAuthMode(value: string): value is AuthMode {
  return (AUTH_MODES as readonly string[]).includes(value);
}

function parseCategory(raw: string | null): string | null {
  const value = raw?.toLowerCase() ?? null;
  return value !== null && CATEGORY_PATTERN.test(value) ? value : null;
}

function parseSort(raw: string | null): SortValue {
  return raw !== null && isSortValue(raw) ? raw : DEFAULT_SORT;
}

function parsePage(raw: string | null): number {
  if (raw === null || !PAGE_NUMBER_PATTERN.test(raw)) {
    return DEFAULT_PAGE_NUMBER;
  }

  const page = Number(raw);
  return Number.isSafeInteger(page) && page >= 1 ? page : DEFAULT_PAGE_NUMBER;
}

export function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export function parseRoute(pathname: string, search: string): RouteState {
  const path = normalizePath(pathname);
  const params = new URLSearchParams(search);
  const auth = params.get(QUERY_KEYS.auth);
  const gameSlug = params.get(QUERY_KEYS.game)?.trim() ?? '';

  return {
    page: PAGE_BY_PATH.get(path) ?? 'not-found',
    path,
    library: {
      category: parseCategory(params.get(QUERY_KEYS.category)),
      sort: parseSort(params.get(QUERY_KEYS.sort)),
      page: parsePage(params.get(QUERY_KEYS.page)),
    },
    gameSlug: gameSlug === '' ? null : gameSlug,
    authMode: auth !== null && isAuthMode(auth) ? auth : null,
  };
}

export function isSameRoute(first: RouteState, second: RouteState): boolean {
  return (
    first.page === second.page &&
    first.path === second.path &&
    first.library.category === second.library.category &&
    first.library.sort === second.library.sort &&
    first.library.page === second.library.page &&
    first.gameSlug === second.gameSlug &&
    first.authMode === second.authMode
  );
}
