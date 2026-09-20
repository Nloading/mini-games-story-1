import './developer-cta.scss';
import exportIcon from '../../assets/images/exportIcon.png';
import side from '../../assets/images/side.png';

export function createDeveloperCta(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'developer-cta';
  section.innerHTML = `
    <div class="developer-cta__inner">
      <img class="developer-cta__illustration" src="${side}" alt="Illustration of a game developer's desk setup" loading="lazy" />
      <div class="developer-cta__card">
        <h2>Are You a Game Developer?</h2>
        <p>
          Want to see your game on MiniGames? We're always looking for fun,
          engaging mini games to add to our platform. Submit your game and
          reach thousands of players!
        </p>
        <button type="button" class="btn btn--primary">
          <img src="${exportIcon}" alt="submit" />
          Submit Form
        </button>
        <p class="developer-cta__contact">
          or contact us at <a href="mailto:developers@minigames.com">developers@minigames.com</a>
        </p>
      </div>
    </div>
  `;
  return section;
}
