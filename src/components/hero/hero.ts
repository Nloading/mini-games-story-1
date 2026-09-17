export function createHero(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'hero';

  const inner = document.createElement('div');
  inner.className = 'hero__inner';

  const content = document.createElement('div');
  content.className = 'hero__content';

  const title = document.createElement('h1');
  title.textContent = 'Take a Short Break & Have Fun';

  const description = document.createElement('p');
  description.textContent =
    'Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match-3, farm, and board classics.';

  const link = document.createElement('a');
  link.href = '/library';
  link.className = 'btn btn--primary';
  link.textContent = 'Browse Library';

  content.append(title, description, link);
  inner.appendChild(content);
  section.appendChild(inner);

  return section;
}
