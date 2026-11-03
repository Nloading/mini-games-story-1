import './styles/main.scss';
import logoIcon from './assets/images/logo.png';
import { createApp } from './app';
import { initAchievements } from './features/achievements/engine';
import { initAchievementToasts } from './features/achievements/toast';

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = logoIcon;
document.head.appendChild(favicon);

initAchievements();
initAchievementToasts();

const app = createApp();
document.getElementById('app')?.appendChild(app);
