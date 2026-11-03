import type { Achievement } from './types';

export const achievements: Achievement[] = [
  {
    id: 'first-favorite',
    title: 'First Love',
    description: 'Add your first game to favorites',
    icon: '❤️',
    target: 1,
    progress: (stats) => stats.favoritedGames.length,
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Add 5 different games to favorites',
    icon: '🗂️',
    target: 5,
    progress: (stats) => stats.favoritedGames.length,
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Open the details of 5 different games',
    icon: '🧭',
    target: 5,
    progress: (stats) => stats.gamesOpened.length,
  },
  {
    id: 'critic',
    title: 'Critic',
    description: 'Post 3 comments',
    icon: '✍️',
    target: 3,
    progress: (stats) => stats.commentsPosted,
  },
  {
    id: 'appreciator',
    title: 'Appreciator',
    description: 'Like 5 different comments',
    icon: '👍',
    target: 5,
    progress: (stats) => stats.likedComments.length,
  },
  {
    id: 'regular',
    title: 'Regular',
    description: 'Log in 3 times',
    icon: '🔑',
    target: 3,
    progress: (stats) => stats.logins,
  },
];
