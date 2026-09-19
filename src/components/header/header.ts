import './header.scss';
import logoIcon from '../../assets/images/logo.png';

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="site-header__inner">
      <a href="/" class="site-header__logo">
        <img class="site-header__logo-icon" src="${logoIcon}" alt="MiniGames logo" width="24" height="24" />
        MiniGames
      </a>

      <nav class="site-header__nav" aria-label="Main navigation">
        <a href="/" aria-current="page">Home</a>
        <a href="/library">Library</a>
        <a href="/tournaments">Tournaments</a>
        <a href="/community">Community</a>
      </nav>

      <div class="site-header__actions">
        <button type="button" class="btn btn--outline btn--sm">Log In</button>
        <button type="button" class="btn btn--primary btn--sm">Sign Up</button>
      </div>
    </div>
  `;
  return header;
}
