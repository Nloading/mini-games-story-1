import './library-header.scss';

export function createLibraryHeader(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'library-header';
  section.innerHTML = `
    <div class="library-header__inner">
      <h1>Game Library</h1>
      <p>Browse our collection of casual mini-games</p>
    </div>
  `;
  return section;
}
