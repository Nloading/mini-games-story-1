export type SortValue = 'rating-desc' | 'rating-asc' | 'name-asc' | 'name-desc';

export interface FavoriteToggleResponse {
  data: {
    gameSlug: string;
    isFavorited: boolean;
    likesCount: number;
  };
}

export interface GameCard {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
}

export interface GamesListMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  appliedFilter: {
    category: string;
    sort: string;
  };
}

export interface GamesListResponse {
  data: GameCard[];
  meta: GamesListMeta;
}

export interface FeaturedGamesResponse {
  data: GameCard[];
}

export interface Category {
  slug: string;
  label: string;
  isDefault: boolean;
}

export interface CategoriesResponse {
  data: Category[];
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameSlug: string;
  favoriteGameName: string;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
}

export interface GameSpecs {
  genre: string;
  players: string;
  duration: string;
  price: string;
}

export interface TopRecord {
  position: number;
  playerName: string;
  score: number;
  achievedAt: string;
}

export interface GameDetails {
  slug: string;
  name: string;
  heroImage: string;
  rating: number;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  fullDescription: string;
  specs: GameSpecs;
  topRecords: TopRecord[];
}

export interface GameDetailsResponse {
  data: GameDetails;
}

export interface GamesQuery {
  category: string;
  sort: SortValue;
  page: number;
}

export interface GameComment {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

export interface GameCommentsMeta {
  totalComments: number;
  returnedCount: number;
  sort: string;
}

export interface GameCommentsResponse {
  data: GameComment[];
  meta: GameCommentsMeta;
}

export interface NewComment {
  userEmail: string;
  authorName: string;
  text: string;
}

export interface CommentCreatedResponse {
  data: GameComment;
}

export interface CommentLikeResponse {
  data: {
    isLikedByCurrentUser: boolean;
    likesCount: number;
  };
}

export interface FavoriteToggleResponse {
  data: {
    isFavorite?: boolean;
    isLikedByCurrentUser?: boolean;
    favoritesCount?: number;
    likesCount?: number;
  };
}
