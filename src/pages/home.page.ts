import { createHero } from '@/components/hero/hero';
import { createNewGames } from '@/components/new-games/new-games';
import { createTopPlayers } from '@/components/top-players/top-players';
import { createDeveloperCta } from '@/components/developer-cta/developer-cta';

export function createHomePage(): HTMLElement {
  const page = document.createElement('main');
  page.className = 'home-page';
  page.setAttribute('aria-label', 'Home page');
  page.append(createHero(), createNewGames(), createTopPlayers(), createDeveloperCta());
  return page;
}
