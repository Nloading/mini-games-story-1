import './top-players.scss';

interface Player {
  rank: number;
  initials: string;
  name: string;
  played: number;
  score: number;
  streak: number;
  favorite: string;
}

const players: Player[] = [
  {
    rank: 1,
    initials: 'AP',
    name: 'Alex_Pro99',
    played: 142,
    score: 94250,
    streak: 12,
    favorite: 'Heartopia',
  },
  {
    rank: 2,
    initials: 'CG',
    name: 'CozyGamer_x',
    played: 118,
    score: 81400,
    streak: 8,
    favorite: 'Cat Mail Co.',
  },
  {
    rank: 3,
    initials: 'MM',
    name: 'MatchMaster',
    played: 98,
    score: 72110,
    streak: 5,
    favorite: 'Tiny Glade',
  },
  {
    rank: 4,
    initials: 'BP',
    name: 'BubblePop',
    played: 87,
    score: 65900,
    streak: 3,
    favorite: 'Whisper of the House',
  },
  {
    rank: 5,
    initials: 'SG',
    name: 'SudokuGod',
    played: 74,
    score: 59320,
    streak: 2,
    favorite: 'Cat Chess',
  },
];

const avatarColors = ['1', '2', '3', '4', '5'];

function renderRow(player: Player, index: number): string {
  return `
    <tr>
      <td class="rank-cell${player.rank === 1 ? ' rank-cell--top' : ''}">#${player.rank}</td>
      <td>
        <div class="player-cell">
          <span class="avatar avatar--${avatarColors[index % avatarColors.length]}">${
    player.initials
  }</span>
          <span>${player.name}</span>
        </div>
      </td>
      <td>${player.played}</td>
      <td>${player.score.toLocaleString()}</td>
      <td>
        <span class="streak">
          <img src="" alt="" width="14" height="14" />
          ${player.streak} days
        </span>
      </td>
      <td><span class="chip">${player.favorite}</span></td>
    </tr>
  `;
}

export function createTopPlayers(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'top-players';
  section.innerHTML = `
    <div class="top-players__inner">
      <div class="section-heading">
        <h2><span class="section-heading__bar" aria-hidden="true"></span>Top Players This Week</h2>
      </div>
      <div class="top-players__table-wrap">
        <table class="top-players__table">
          <caption class="visually-hidden">Ranking of top players this week</caption>
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Player</th>
              <th scope="col">Games Played</th>
              <th scope="col">Total Score</th>
              <th scope="col">Streak</th>
              <th scope="col">Favorite Game</th>
            </tr>
          </thead>
          <tbody>
            ${players.map(renderRow).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  return section;
}
