import { createHero } from '@/components/hero/hero';

export function createHomePage(): HTMLElement {
  const page = document.createElement('main');
  page.className = 'home-page';
  page.setAttribute('aria-label', 'Home page');
  page.append(createHero());
  return page;
}
