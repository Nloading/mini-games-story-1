import './header.scss';
import logoIcon from '../../assets/images/logo.png';

import { router } from '../../router/router';

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="site-header__inner">
      <a href="/" class="site-header__logo">
        <img class="site-header__logo-icon" src="${logoIcon}" alt="MiniGames logo" width="24" height="24" />
        MiniGames
      </a>

      <nav id="main-navigation" class="site-header__nav" aria-label="Main navigation">
        <a href="/" aria-current="page">Home</a>
        <a href="/library">Library</a>
        <a href="/tournaments">Tournaments</a>
        <a href="/community">Community</a>
      </nav>

      <div class="site-header__actions">
        <button type="button" class="btn btn--outline btn--sm">Log In</button>
        <button type="button" class="btn btn--primary btn--sm">Sign Up</button>
        <button type="button" class="site-header__menu" aria-label="Open menu" aria-expanded="false" aria-controls="main-navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  `;

  header.querySelectorAll('a[href^="/"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = event.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute('href');

      if (!href || href.startsWith('#')) {
        return;
      }

      event.preventDefault();
      router.navigate(href);
    });
  });

  return header;
}
