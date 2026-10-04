import './snackbar.scss';

export type SnackbarVariant = 'success' | 'error' | 'warning' | 'info';

const DEFAULT_DURATION_MS = 4000;
const CLOSE_LABEL = 'Close notification';

let region: HTMLElement | null = null;

function getRegion(): HTMLElement {
  if (region) {
    return region;
  }

  const element = document.createElement('div');
  element.className = 'snackbar-region';
  element.setAttribute('popover', 'manual');
  element.setAttribute('aria-live', 'polite');
  document.body.appendChild(element);
  region = element;

  return element;
}

function openRegion(element: HTMLElement): void {
  if (!element.matches(':popover-open')) {
    element.showPopover();
  }
}

function closeRegionIfEmpty(element: HTMLElement): void {
  if (element.childElementCount === 0 && element.matches(':popover-open')) {
    element.hidePopover();
  }
}

export function showSnackbar(
  message: string,
  variant: SnackbarVariant = 'info',
  durationMs = DEFAULT_DURATION_MS
): void {
  const container = getRegion();

  const item = document.createElement('div');
  item.className = `snackbar snackbar--${variant}`;
  item.setAttribute('role', variant === 'error' ? 'alert' : 'status');

  const text = document.createElement('span');
  text.className = 'snackbar__message';
  text.textContent = message;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'snackbar__close';
  closeButton.setAttribute('aria-label', CLOSE_LABEL);
  closeButton.textContent = 'x';

  let timerId = 0;

  const dismiss = (): void => {
    window.clearTimeout(timerId);
    item.remove();
    closeRegionIfEmpty(container);
  };

  closeButton.addEventListener('click', dismiss);
  item.append(text, closeButton);
  container.appendChild(item);
  openRegion(container);

  timerId = window.setTimeout(dismiss, durationMs);
}
