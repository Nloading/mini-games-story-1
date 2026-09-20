export interface ApiGame {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
  featured: boolean;
}

interface ApiEnvelope<T> {
  data: T;
}

const mockDataBase =
  'https://raw.githubusercontent.com/rolling-scopes-school/qualifying-stage/main/tasks/minigames/tasks/mock-data';

export const fallbackGames: ApiGame[] = [
  {
    slug: 'vacation-cafe-simulator',
    name: 'Vacation Cafe Simulator',
    category: 'strategy',
    price: 'Free',
    shortDescription:
      'Cozy Italian Vacation Cafe. No timers, no stress: cook, upgrade, customize, relax and grow your dream cafe.',
    rating: 4.8,
    likesCount: 28700,
    cardImage: '',
    featured: true,
  },
  {
    slug: 'winter-burrow',
    name: 'Winter Burrow',
    category: 'farm',
    price: 'Free',
    shortDescription:
      'A cozy woodland survival game about restoring a childhood burrow, gathering resources, crafting and meeting locals.',
    rating: 4.9,
    likesCount: 32400,
    cardImage: '',
    featured: true,
  },
  {
    slug: 'shelve-the-potions',
    name: 'Shelve the Potions!',
    category: 'puzzle',
    price: 'Free',
    shortDescription:
      'Organize potions on enchanted shelves using clues around a mysterious cellar.',
    rating: 4.7,
    likesCount: 21300,
    cardImage: '',
    featured: true,
  },
  {
    slug: 'heartopia',
    name: 'Heartopia',
    category: 'strategy',
    price: '$1.99',
    shortDescription:
      'A peaceful multiplayer life simulation about creativity, hobbies, homes and warm connections.',
    rating: 4.6,
    likesCount: 46800,
    cardImage: '',
    featured: true,
  },
  {
    slug: 'palia',
    name: 'Palia',
    category: 'strategy',
    price: 'Free',
    shortDescription:
      'A fantasy life sim where you can craft, explore and create the home and life of your dreams.',
    rating: 4.8,
    likesCount: 89500,
    cardImage: '',
    featured: true,
  },
  {
    slug: 'cat-mail-co',
    name: 'Cat Mail Co.',
    category: 'puzzle',
    price: 'Free',
    shortDescription:
      'Run a cozy cat post office, sort parcels and uncover hidden truths from the daily boat.',
    rating: 4.9,
    likesCount: 38200,
    cardImage: '',
    featured: true,
  },
];

async function fetchMockData<T>(fileName: string): Promise<T> {
  const response = await fetch(`${mockDataBase}/${fileName}`);
  if (!response.ok) {
    throw new Error(`Mock data request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

export async function getGames(): Promise<ApiGame[]> {
  try {
    return await fetchMockData<ApiGame[]>('all-games-seed.json');
  } catch {
    return fallbackGames;
  }
}
