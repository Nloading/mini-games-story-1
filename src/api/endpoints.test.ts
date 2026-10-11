import { describe, expect, it, vi } from 'vitest';
import {
  fetchCategories,
  fetchFeaturedGames,
  fetchGameComments,
  fetchGameDetails,
  fetchGames,
  fetchLeaderboard,
  postComment,
  toggleCommentLike,
  toggleFavorite,
} from './endpoints';

describe('API endpoints', () => {
  function valueAt<T>(values: T[], index: number): T {
    const value = values[index];
    if (value === undefined) throw new Error(`Expected a value at index ${index}`);
    return value;
  }

  it('uses the expected endpoint paths and query parameters', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response('{"data":[]}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await fetchFeaturedGames(controller.signal);
    await fetchGames({ category: 'puzzle', sort: 'name-asc', page: 4 }, controller.signal);
    await fetchCategories(controller.signal);
    await fetchLeaderboard(controller.signal);
    await fetchGameDetails('space & time', 'player@example.test', controller.signal);
    await fetchGameComments('space & time', 'player@example.test', controller.signal);
    await fetchGameDetails('guest-game', undefined, controller.signal);

    const urls = fetchMock.mock.calls.map(([input]) => new URL(String(input)));
    expect(urls.map((url) => url.pathname)).toEqual([
      '/api/games',
      '/api/games',
      '/api/categories',
      '/api/leaderboard',
      '/api/games/space%20%26%20time',
      '/api/games/space%20%26%20time/comments',
      '/api/games/guest-game',
    ]);
    expect(valueAt(urls, 0).searchParams.get('featured')).toBe('true');
    expect([...valueAt(urls, 1).searchParams.entries()].sort()).toEqual([
      ['category', 'puzzle'],
      ['limit', '6'],
      ['page', '4'],
      ['sort', 'name-asc'],
    ]);
    expect(valueAt(urls, 2).search).toBe('');
    expect(valueAt(urls, 3).search).toBe('');
    expect(valueAt(urls, 4).searchParams.get('userEmail')).toBe('player@example.test');
    expect(valueAt(urls, 5).searchParams.get('limit')).toBe('3');
    expect(valueAt(urls, 5).searchParams.get('sort')).toBe('newest');
    expect(valueAt(urls, 5).searchParams.get('userEmail')).toBe('player@example.test');
    expect(valueAt(urls, 6).searchParams.has('userEmail')).toBe(false);
    expect(fetchMock.mock.calls.every(([, init]) => init?.signal === controller.signal)).toBe(true);
  });

  it('posts favorites, comments, and likes to encoded resource paths with their JSON bodies', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response('{"data":{}}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const comment = {
      userEmail: 'player@example.test',
      authorName: 'Player',
      text: 'Great game',
    };

    await toggleFavorite('a/b', 'player@example.test');
    await postComment('a/b', comment);
    await toggleCommentLike('comment #1', 'player@example.test');

    expect(fetchMock.mock.calls.map(([input]) => new URL(String(input)).pathname)).toEqual([
      '/api/games/a%2Fb/favorite',
      '/api/games/a%2Fb/comments',
      '/api/comments/comment%20%231/like',
    ]);
    expect(
      fetchMock.mock.calls.map(([, init]) => ({
        method: init?.method,
        contentType: new Headers(init?.headers).get('Content-Type'),
        body: JSON.parse(String(init?.body)) as unknown,
      }))
    ).toEqual([
      {
        method: 'POST',
        contentType: 'application/json',
        body: { userEmail: 'player@example.test' },
      },
      {
        method: 'POST',
        contentType: 'application/json',
        body: comment,
      },
      {
        method: 'POST',
        contentType: 'application/json',
        body: { userEmail: 'player@example.test' },
      },
    ]);
  });
});
