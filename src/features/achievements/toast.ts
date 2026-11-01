import './toast.scss';
import { bus } from './events';

const AUTO_HIDE_MS = 4000;
const FADE_MS = 300;

export function initAchievementToasts(): void {
  const region = document.createElement('div');
  region.className = 'achievement-toasts';
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  document.body.appendChild(region);

  bus.on('achievement:unlocked', ({ achievement }) => {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <span class="achievement-toast__icon" aria-hidden="true">${achievement.icon}</span>
      <div>
        <p class="achievement-toast__title">Achievement unlocked: ${achievement.title}</p>
        <p class="achievement-toast__text">${achievement.description}</p>
      </div>
    `;
    region.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('achievement-toast--visible'));

    setTimeout(() => {
      toast.classList.remove('achievement-toast--visible');
      setTimeout(() => toast.remove(), FADE_MS);
    }, AUTO_HIDE_MS);
  });
}
