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
        <a href="/" class="mobile-nav__brand" aria-label="MiniGames home">
          <img src="${logoIcon}" alt="" width="32" height="32" />
          <span>MiniGames</span>
        </a>
        <button type="button" class="mobile-nav__close" aria-label="Close menu">&times;</button>
      </div>
      <nav class="mobile-nav__links" aria-label="Mobile navigation">
        <a href="/" aria-current="page">Home</a>
        <a href="/library">Library</a>
        <a href="/tournaments">Tournaments</a>
        <a href="/community">Community</a>
      </nav>
      <div class="mobile-nav__actions">
        <a href="/login" class="btn btn--outline-white">Log In</a>
        <a href="/register" class="btn btn--primary">Sign Up</a>
      </div>
    </div>
  `;

  dialog.querySelector('.mobile-nav__close')?.addEventListener('click', () => dialog.close());

  dialog.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '/login' || href === '/register') {
        event.preventDefault();
        dialog.close();
        return;
      }

      event.preventDefault();
      dialog.close();
      router.navigate(href);
    });
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  return dialog;
}
