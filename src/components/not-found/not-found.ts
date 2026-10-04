import './not-found.scss';

export function createNotFound(path: string): HTMLElement {
  const section = document.createElement('section');
  section.className = 'not-found';

  const inner = document.createElement('div');
  inner.className = 'not-found__inner';

  const code = document.createElement('p');
  code.className = 'not-found__code';
  code.textContent = '404';

  const title = document.createElement('h1');
  title.className = 'not-found__title';
  title.textContent = 'Page Not Found';

  const message = document.createElement('p');
  message.className = 'not-found__text';
  message.textContent = `The page "${path}" does not exist. It may have been moved, or the address may be mistyped.`;

  const homeLink = document.createElement('a');
  homeLink.className = 'btn btn--primary';
  homeLink.href = import.meta.env.BASE_URL;
  homeLink.textContent = 'Return to Home Page';

  inner.append(code, title, message, homeLink);
  section.append(inner);

  return section;
}
