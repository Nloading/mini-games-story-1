import './styles/main.scss';
import logoIcon from './assets/images/logo.png';
import { createApp } from './app';

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = logoIcon;
document.head.appendChild(favicon);

const app = createApp();
document.getElementById('app')?.appendChild(app);
