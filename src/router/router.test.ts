import { beforeEach, describe, expect, it, vi } from 'vitest';
import { router } from './router';

describe('router navigation', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/mini-games-story-1/library?keep=yes#section');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  function startRouter() {
    const received: Array<{ path: string; previousPath: string | null }> = [];
    const unsubscribe = router.subscribe((state, previous) => {
      received.push({ path: state.path, previousPath: previous?.path ?? null });
    });
    router.start();
    return { router, received, unsubscribe };
  }

  it('starts from the base-prefixed location and navigates with push or replace history', () => {
    const { router, received } = startRouter();
    expect(router.href('/home')).toBe('/mini-games-story-1/home');
    expect(router.getState().path).toBe('/library');
    expect(received[0]).toEqual({ path: '/library', previousPath: null });

    router.navigate('/home');
    expect(window.location.pathname).toBe('/mini-games-story-1/home');
    expect(router.getState().page).toBe('home');

    router.navigate('/library?category=arcade', { replace: true });
    expect(window.location.pathname).toBe('/mini-games-story-1/library');
    expect(window.location.search).toBe('?category=arcade');
    expect(received.at(-1)).toEqual({ path: '/library', previousPath: '/home' });
  });

  it('updates query parameters while preserving unrelated parameters and the hash', () => {
    const { router } = startRouter();
    router.setQuery({ page: 3, category: 'strategy' });
    const params = new URLSearchParams(window.location.search);

    expect(params.get('keep')).toBe('yes');
    expect(params.get('page')).toBe('3');
    expect(params.get('category')).toBe('strategy');
    expect(window.location.hash).toBe('#section');

    router.setQuery({ category: null }, { replace: true });
    expect(new URLSearchParams(window.location.search).has('category')).toBe(false);
    expect(new URLSearchParams(window.location.search).get('page')).toBe('3');
    expect(window.location.hash).toBe('#section');
  });

  it('opens dialogs as navigable entries and closes them by returning through history', async () => {
    const { router } = startRouter();
    router.openGame('space game');
    expect(new URLSearchParams(window.location.search).get('game')).toBe('space game');
    expect(router.getState().gameSlug).toBe('space game');

    const returned = new Promise<void>((resolve) => {
      window.addEventListener('popstate', () => resolve(), { once: true });
    });
    router.closeDialog('game');
    await returned;

    expect(new URLSearchParams(window.location.search).has('game')).toBe(false);
    expect(router.getState().gameSlug).toBeNull();
  });

  it('handles popstate and same-origin in-app links but ignores modified or external links', async () => {
    const { router, received, unsubscribe } = startRouter();
    router.navigate('/home');
    window.history.back();
    await vi.waitFor(() => expect(router.getState().path).toBe('/library'));
    expect(
      received.some((entry) => entry.path === '/library' && entry.previousPath === '/home')
    ).toBe(true);

    const link = document.createElement('a');
    link.href = '/mini-games-story-1/home';
    document.body.append(link);
    const internalClick = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(internalClick);
    expect(internalClick.defaultPrevented).toBe(true);
    expect(router.getState().path).toBe('/home');

    const modifiedClick = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    link.dispatchEvent(modifiedClick);
    expect(modifiedClick.defaultPrevented).toBe(false);

    const external = document.createElement('a');
    external.href = 'https://example.test/outside';
    external.target = '_blank';
    document.body.append(external);
    const externalClick = new MouseEvent('click', { bubbles: true, cancelable: true });
    external.dispatchEvent(externalClick);
    expect(externalClick.defaultPrevented).toBe(false);
    unsubscribe();
  });
});
