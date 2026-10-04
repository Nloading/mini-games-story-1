import { createNotFound } from '@/components/not-found/not-found';

export function createNotFoundPage(path: string): HTMLElement {
  const page = document.createElement('main');
  page.className = 'not-found-page';
  page.setAttribute('aria-label', 'Page not found');
  page.append(createNotFound(path));
  return page;
}
