import { COMMENTS_LIMIT, LIBRARY_PAGE_SIZE } from './config';
import { getJson, postJson } from './http';
import type {
  CategoriesResponse,
  CommentCreatedResponse,
  CommentLikeResponse,
  FavoriteToggleResponse,
  FeaturedGamesResponse,
  GameCommentsResponse,
  GameDetailsResponse,
  GamesListResponse,
  GamesQuery,
  LeaderboardResponse,
  NewComment,
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

export function fetchGameDetails(
  slug: string,
  userEmail?: string,
  signal?: AbortSignal
): Promise<GameDetailsResponse> {
  return getJson<GameDetailsResponse>(`/games/${encodeURIComponent(slug)}`, { userEmail }, signal);
}

export function fetchGameComments(
  slug: string,
  userEmail?: string,
  signal?: AbortSignal
): Promise<GameCommentsResponse> {
  return getJson<GameCommentsResponse>(
    `/games/${encodeURIComponent(slug)}/comments`,
    { limit: COMMENTS_LIMIT, sort: 'newest', userEmail },
    signal
  );
}

export function toggleFavorite(slug: string, userEmail: string): Promise<FavoriteToggleResponse> {
  return postJson<FavoriteToggleResponse>(`/games/${encodeURIComponent(slug)}/favorite`, {
    userEmail,
  });
}

export function postComment(slug: string, comment: NewComment): Promise<CommentCreatedResponse> {
  return postJson<CommentCreatedResponse>(`/games/${encodeURIComponent(slug)}/comments`, comment);
}

export function toggleCommentLike(
  commentId: string,
  userEmail: string
): Promise<CommentLikeResponse> {
  return postJson<CommentLikeResponse>(`/comments/${encodeURIComponent(commentId)}/like`, {
    userEmail,
  });
}
