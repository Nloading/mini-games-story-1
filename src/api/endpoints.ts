import { LIBRARY_PAGE_SIZE } from './config';
import { getJson } from './http';
import type {
  CategoriesResponse,
  FeaturedGamesResponse,
  GameDetailsResponse,
  GamesListResponse,
  GamesQuery,
  LeaderboardResponse,
} from './types';

export function fetchFeaturedGames(signal?: AbortSignal): Promise<FeaturedGamesResponse> {
  return getJson<FeaturedGamesResponse>('/games', { featured: true }, signal);
}

export function fetchGames(query: GamesQuery, signal?: AbortSignal): Promise<GamesListResponse> {
  return getJson<GamesListResponse>(
    '/games',
    {
      category: query.category,
      sort: query.sort,
      page: query.page,
      limit: LIBRARY_PAGE_SIZE,
    },
    signal
  );
}

export function fetchCategories(signal?: AbortSignal): Promise<CategoriesResponse> {
  return getJson<CategoriesResponse>('/categories', undefined, signal);
}

export function fetchLeaderboard(signal?: AbortSignal): Promise<LeaderboardResponse> {
  return getJson<LeaderboardResponse>('/leaderboard', undefined, signal);
}

export function fetchGameDetails(slug: string, signal?: AbortSignal): Promise<GameDetailsResponse> {
  return getJson<GameDetailsResponse>(`/games/${encodeURIComponent(slug)}`, undefined, signal);
}
