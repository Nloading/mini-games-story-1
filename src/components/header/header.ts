import './header.scss';
import logoIcon from '../../assets/images/logo.png';
import { createProfile } from '../profile/profile';
import { getSession, subscribeSession } from '@/auth/session-store';
import type { AppSession } from '@/auth/session';
import { router } from '../../router/router';
import type { PageName } from '../../router/url-state';

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="site-header__inner">
      <a href="${router.href('/')}" class="site-header__logo">
        <img class="site-header__logo-icon" src="${logoIcon}" alt="MiniGames logo" width="24" height="24" />
        MiniGames
      </a>

      <nav id="main-navigation" class="site-header__nav" aria-label="Main navigation">
        <a href="${router.href('/')}" data-page="home">Home</a>
        <a href="${router.href('/library')}" data-page="library">Library</a>
        <a href="${router.href('/tournaments')}">Tournaments</a>
        <a href="${router.href('/community')}">Community</a>
      </nav>

      <div class="site-header__actions">
        <button type="button" class="btn btn--outline btn--sm" data-guest-only>Log In</button>
        <button type="button" class="btn btn--primary btn--sm" data-guest-only>Sign Up</button>
        <div class="site-header__profile"></div>
        <button type="button" class="site-header__menu" aria-label="Open menu" aria-expanded="false" aria-controls="main-navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  `;

  const nav = header.querySelector<HTMLDivElement>('.site-header__nav');
  const menuButton = header.querySelector<HTMLButtonElement>('.site-header__menu');

  function setActiveNavLink(page: PageName): void {
    header.querySelectorAll<HTMLAnchorElement>('.site-header__nav a').forEach((item) => {
      const isActive = item.dataset.page === page;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  router.subscribe((state) => setActiveNavLink(state.page));

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    nav?.classList.toggle('is-open', isOpen);
  });

  const profileSlot = header.querySelector<HTMLElement>('.site-header__profile')!;

  function renderAuthState(session: AppSession | null): void {
    header.classList.toggle('is-authenticated', session !== null);
    profileSlot.replaceChildren(...(session === null ? [] : [createProfile(session, 'header')]));
  }

  renderAuthState(getSession());
  subscribeSession((session) => renderAuthState(session));

  return header;
}
