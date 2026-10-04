import { router } from './router/router';
import { createHeader } from '@/components/header/header';
import { createFooter } from '@/components/footer/footer';
import { createAuthDialog } from '@/components/auth-dialog/auth-dialog';
import { createGameDetailsDialog } from '@/components/game-details-dialog/game-details-dialog';
import { createMobileNav } from '@/components/mobile-nav/mobile-nav';

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
  const mobileNav = createMobileNav();
  document.body.append(authDialog, gameDialog, mobileNav);

  const burgerButton = root.querySelector<HTMLButtonElement>('.site-header__menu');
  if (burgerButton && burgerButton.dataset.mobileNavBound !== 'true') {
    burgerButton.dataset.mobileNavBound = 'true';
    burgerButton.addEventListener('click', () => {
      burgerButton.setAttribute('aria-expanded', 'true');
      mobileNav.showModal();
    });
  }

  mobileNav.addEventListener('close', () => {
    burgerButton?.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('mobile-nav:auth', (event) => {
    const tabName = (event as CustomEvent<string>).detail;
    authDialog.dispatchEvent(new CustomEvent('auth:switch', { detail: tabName }));
    authDialog.showModal();
  });

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('.site-header__actions .btn--outline')) authDialog.showModal();
    if (target.closest('.site-header__actions .btn--primary')) authDialog.showModal();
    if (target.closest('.library-card__details')) gameDialog.showModal();
  });

  router.init(view);

  return root;
}
