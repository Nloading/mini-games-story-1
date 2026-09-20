import './footer.scss';
import logoIcon from '../../assets/images/logo.png';
import shareIcon from '../../assets/images/share.png';
import comment from '../../assets/images/comment.png';
import wifi from '../../assets/images/wifi.png';
import rsLogo from '../../assets/images/rs-logo-container.png';
import githubIcon from '../../assets/images/github-icon.png';

const columns = [
  { title: 'Explore', links: ['Home', 'Library', 'Categories', 'Tournaments'] },
  { title: 'Company', links: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'] },
];

export function createFooter(): HTMLElement {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="site-footer__inner">
      <div class="site-footer__top">
        <div class="site-footer__about">
          <p class="site-footer__logo">
            <img class="site-footer__logo-icon" src="${logoIcon}" alt="MiniGames logo" />
            MiniGames
          </p>
          <p>
            Take a short break and have fun. Hundreds of curated casual
            mini-games right in your web browser. No download required.
          </p>
        </div>

        ${columns
          .map(
            (col) => `
          <nav aria-label="${col.title}">
            <h3>${col.title}</h3>
            <ul>
              ${col.links.map((link) => `<li><a href="#">${link}</a></li>`).join('')}
            </ul>
          </nav>
        `
          )
          .join('')}

        <div class="site-footer__community">
          <h3>Community</h3>
          <div class="site-footer__socials">
            <a href="#" class="social-btn" aria-label="Share"><img src="${shareIcon}" alt="" /></a>
            <a href="#" class="social-btn" aria-label="Message us"><img src="${comment}" alt="" /></a>
            <a href="#" class="social-btn" aria-label="RSS feed"><img src="${wifi}" alt="" /></a>
          </div>
        </div>
      </div>

      <div class="site-footer__bottom">
        <p>© 2026 MiniGames. All rights reserved.</p>
        <div class="site-footer__badges">
          <span class="badge"><img src="${rsLogo}" alt="RS School logo" class="badge__logo" /></span>
          <a href="https://github.com/Nloading" class="badge badge--github badge__username" aria-label="GitHub profile">
            <img src="${githubIcon}" alt="GitHub logo" class="badge__github" />
            @Nloading
          </a>
        </div>
        <p>Designed with love</p>
      </div>
    </div>
  `;
  return footer;
}
