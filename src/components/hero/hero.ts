export function createHero(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'hero';
  section.innerHTML = `
    <div class="hero__inner">
      <div class="hero__content">
        <h1>Take a Short Break &amp; Have Fun</h1>
        <p>
          Discover hundreds of curated casual mini-games. Play instantly in
          your browser — puzzle, match-3, farm, and board classics.
        </p>
        <a href="/library" class="btn btn--primary">Browse Library</a>
      </div>
    </div>
  `;
  return section;
}
