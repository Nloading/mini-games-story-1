export interface Stats {
  favoritedGames: string[];
  commentsPosted: number;
  likedComments: string[];
  gamesOpened: string[];
  logins: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: (stats: Stats) => number;
}

export interface ProfileData {
  stats: Stats;
  unlocked: Record<string, number>;
}
