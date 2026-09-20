import { router } from './router/router';
import { createHeader } from '@/components/header/header';
import { createFooter } from '@/components/footer/footer';
import { createAuthDialog } from '@/components/auth-dialog/auth-dialog';
import { createGameDetailsDialog } from '@/components/game-details-dialog/game-details-dialog';

export function createApp(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'app-root';

  root.appendChild(createHeader());

  const view = document.createElement('main');
  view.id = 'view';
  root.appendChild(view);

  root.appendChild(createFooter());

  const authDialog = createAuthDialog();
  const gameDialog = createGameDetailsDialog();
  document.body.append(authDialog, gameDialog);

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('.site-header__actions .btn--outline')) authDialog.showModal();
    if (target.closest('.site-header__actions .btn--primary')) authDialog.showModal();
    if (target.closest('.library-card__details')) gameDialog.showModal();
  });

  router.init(view);

  return root;
}
