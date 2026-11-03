import './toast.scss';
import { bus } from './events';

const AUTO_HIDE_MS = 4000;
const FADE_MS = 300;

export function initAchievementToasts(): void {
  // A manual popover lives in the top layer, so toasts stay visible above modal dialogs.
  const region = document.createElement('div');
  region.className = 'achievement-toasts';
  region.setAttribute('popover', 'manual');
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  document.body.appendChild(region);

  function openRegion(): void {
    if (!region.matches(':popover-open')) region.showPopover();
  }

  function closeRegionIfEmpty(): void {
    if (region.childElementCount === 0 && region.matches(':popover-open')) region.hidePopover();
  }

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
    openRegion();

    requestAnimationFrame(() => toast.classList.add('achievement-toast--visible'));

    setTimeout(() => {
      toast.classList.remove('achievement-toast--visible');
      setTimeout(() => {
        toast.remove();
        closeRegionIfEmpty();
      }, FADE_MS);
    }, AUTO_HIDE_MS);
  });
}
