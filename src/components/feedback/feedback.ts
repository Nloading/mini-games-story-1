import './feedback.scss';

export type SkeletonVariant = 'title' | 'line' | 'image' | 'avatar' | 'chip';

export function createSkeleton(variant: SkeletonVariant): HTMLElement {
  const element = document.createElement('span');
  element.className = `skeleton skeleton--${variant}`;
  element.setAttribute('aria-hidden', 'true');

  return element;
}

export function createErrorBanner(message: string, onRetry: () => void): HTMLElement {
  const banner = document.createElement('div');
  banner.className = 'state-banner state-banner--error';
  banner.setAttribute('role', 'alert');

  const title = document.createElement('p');
  title.className = 'state-banner__title';
  title.textContent = 'Something went wrong';

  const text = document.createElement('p');
  text.className = 'state-banner__text';
  text.textContent = message;

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.className = 'btn btn--primary';
  retryButton.textContent = 'Try again';
  retryButton.addEventListener('click', onRetry);

  banner.append(title, text, retryButton);

  return banner;
}

export function createEmptyState(title: string, description?: string): HTMLElement {
  const box = document.createElement('div');
  box.className = 'state-banner state-banner--empty';
  box.setAttribute('role', 'status');

  const heading = document.createElement('p');
  heading.className = 'state-banner__title';
  heading.textContent = title;
  box.appendChild(heading);

  if (description) {
    const text = document.createElement('p');
    text.className = 'state-banner__text';
    text.textContent = description;
    box.appendChild(text);
  }

  return box;
}
