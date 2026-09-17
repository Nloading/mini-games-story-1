import { router } from './router/router';

export function createApp(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'app-root';
  const nav = document.createElement('nav');
  nav.textContent = 'Mini Games';
  root.appendChild(nav);
  const view = document.createElement('main');
  view.id = 'view';
  root.appendChild(view);
  router.init(view);
  return root;
}
