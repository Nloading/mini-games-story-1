import { describe, expect, it } from 'vitest';
import { isSameRoute, normalizePath, parseRoute } from './url-state';

describe('route URL state', () => {
  it('normalizes trailing slashes and identifies known and unknown pages', () => {
    expect(normalizePath('///')).toBe('/');
    expect(normalizePath('/library///')).toBe('/library');
    expect(parseRoute('/', '').page).toBe('home');
    expect(parseRoute('/home/', '').page).toBe('home');
    expect(parseRoute('/library/', '').page).toBe('library');
    expect(parseRoute('/missing', '').page).toBe('not-found');
  });

  it('parses valid library filters, sort, page, and dialog parameters', () => {
    const state = parseRoute(
      '/library/',
      '?category=Board-Games&sort=name-desc&page=8&game=space%20quest&auth=register'
    );
    expect(state).toMatchObject({
      page: 'library',
      path: '/library',
      library: { category: 'board-games', sort: 'name-desc', page: 8 },
      gameSlug: 'space quest',
      authMode: 'register',
    });
  });

  it('falls back to defaults for malformed query values', () => {
    expect(parseRoute('/library', '?category=bad_value&sort=unknown&page=0').library).toEqual({
      category: null,
      sort: 'rating-desc',
      page: 1,
    });
    expect(parseRoute('/library', '?category=GOOD&page=1e2&auth=admin&game=%20%20')).toMatchObject({
      library: { category: 'good', sort: 'rating-desc', page: 1 },
      gameSlug: null,
      authMode: null,
    });
    expect(parseRoute('/library', '?page=9007199254740992').library.page).toBe(1);
  });

  it('compares route states by normalized, observable route values', () => {
    const first = parseRoute('/library/', '?category=arcade&page=2');
    const same = parseRoute('/library', '?page=2&category=arcade');
    const different = parseRoute('/library', '?category=arcade&page=3');
    expect(isSameRoute(first, same)).toBe(true);
    expect(isSameRoute(first, different)).toBe(false);
  });
});
