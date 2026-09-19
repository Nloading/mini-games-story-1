import { router } from './router/router';
import { createHeader } from '@/components/header/header';
import { createFooter } from '@/components/footer/footer';

export function createApp(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'app-root';

  root.appendChild(createHeader());

  const view = document.createElement('main');
  view.id = 'view';
  root.appendChild(view);

  root.appendChild(createFooter());

  router.init(view);

  return root;
}
