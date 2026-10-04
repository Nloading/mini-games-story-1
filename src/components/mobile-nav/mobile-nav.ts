import './mobile-nav.scss';

import logoIcon from '../../assets/images/logo.png';
import { router } from '../../router/router';

export function createMobileNav(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.id = 'mobile-nav';
  dialog.className = 'mobile-nav';
  dialog.innerHTML = `
    <div class="mobile-nav__panel">
      <div class="mobile-nav__header">
        <a href="${router.href('/')}" class="mobile-nav__brand" aria-label="MiniGames home">
          <img src="${logoIcon}" alt="" width="32" height="32" />
          <span>MiniGames</span>
        </a>
        <button type="button" class="mobile-nav__close" aria-label="Close menu">&times;</button>
      </div>
      <nav class="mobile-nav__links" aria-label="Mobile navigation">
        <a href="${router.href('/')}">Home</a>
        <a href="${router.href('/library')}">Library</a>
        <a href="${router.href('/tournaments')}">Tournaments</a>
        <a href="${router.href('/community')}">Community</a>
      </nav>
      <div class="mobile-nav__actions">
        <button type="button" class="btn btn--outline-white" data-auth-tab="login">Log In</button>
        <button type="button" class="btn btn--primary" data-auth-tab="register">Sign Up</button>
      </div>
    </div>
  `;

  dialog.querySelector('.mobile-nav__close')?.addEventListener('click', () => dialog.close());

  dialog.querySelectorAll<HTMLButtonElement>('[data-auth-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      dialog.close();
      router.openAuth(button.dataset.authTab === 'register' ? 'register' : 'login');
    });
  });

  dialog.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    link.addEventListener('click', () => dialog.close());
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  return dialog;
}
