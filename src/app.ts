import { router } from './router/router';
import type { RouteState } from './router/url-state';
import { createHeader } from '@/components/header/header';
import { createFooter } from '@/components/footer/footer';
import { createAuthDialog } from '@/components/auth-dialog/auth-dialog';
import { createGameDetailsDialog } from '@/components/game-details-dialog/game-details-dialog';
import { createMobileNav } from '@/components/mobile-nav/mobile-nav';
import { createHomePage } from '@/pages/home.page';
import { createLibraryPage } from '@/pages/library.page';
import { createNotFoundPage } from '@/pages/not-found.page';
import { initSession, logout, subscribeSession, validateSession } from '@/auth/session-store';
import { showSnackbar } from '@/components/snackbar/snackbar';

function createPage(state: RouteState): HTMLElement {
  switch (state.page) {
    case 'home':
      return createHomePage();
    case 'library':
      return createLibraryPage();
    case 'not-found':
      return createNotFoundPage(state.path);
  }
}

function needsNewPage(state: RouteState, previous: RouteState | null): boolean {
  if (previous === null || previous.page !== state.page) {
    return true;
  }

  return state.page === 'not-found' && previous.path !== state.path;
}

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

  async function handleLogout(): Promise<void> {
    mobileNav.close();

    const signedOut = await logout();
    if (signedOut) {
      showSnackbar('You have been logged out.', 'success');
    } else {
      showSnackbar('Firebase sign-out failed. You are in Guest Mode.', 'error');
    }
  }

  document.body.append(authDialog, gameDialog.element, mobileNav);

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

  const syncAuthDialog = (state: RouteState): void => {
    if (state.authMode !== null) {
      authDialog.dispatchEvent(new CustomEvent('auth:switch', { detail: state.authMode }));
      if (!authDialog.open) authDialog.showModal();
    } else if (authDialog.open) {
      authDialog.close();
    }
  };

  authDialog.addEventListener('close', () => {
    // The event arrives after the dialog closed; ignore it if History already reopened it.
    if (!authDialog.open) router.closeDialog('auth');
  });

  gameDialog.element.addEventListener('close', () => {
    // Same guard as the auth dialog: History may already have reopened it.
    if (!gameDialog.element.open) router.closeDialog('game');
  });

  authDialog.addEventListener('auth:tab-change', (event) => {
    const mode = (event as CustomEvent<string>).detail;
    if (mode === 'login' || mode === 'register') router.openAuth(mode);
  });

  router.subscribe((state, previous) => {
    validateSession();
    if (needsNewPage(state, previous)) {
      view.replaceChildren(createPage(state));
      if (previous !== null) window.scrollTo(0, 0);
    }

    syncAuthDialog(state);

    if (state.gameSlug !== null) {
      gameDialog.show(state.gameSlug);
    } else {
      gameDialog.hide();
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-action="logout"]')) void handleLogout();
    if (target.closest('.site-header__actions .btn--outline')) router.openAuth('login');
    if (target.closest('.site-header__actions .btn--primary')) router.openAuth('register');

    const gameDetailsTrigger = target.closest<HTMLElement>(
      '.library-card__details, .game-card__button'
    );
    const slug = gameDetailsTrigger?.dataset.slug ?? gameDetailsTrigger?.dataset.gameSlug;
    if (slug) router.openGame(slug);
  });

  subscribeSession((_session, event) => {
    if (event === 'expired') {
      showSnackbar('Your session has expired. Please log in again.', 'warning');
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') validateSession();
  });

  initSession();

  router.start();

  return root;
}
