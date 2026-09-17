import { createHomePage } from '../pages/home.page';

type RouteHandler = (container: HTMLElement) => void;

const routes: Record<string, RouteHandler> = {
  '/': (container) => {
    container.replaceChildren(createHomePage());
  },
};

export const router = {
  init(container: HTMLElement) {
    const render = () => {
      const path = window.location.pathname || '/';
      const handler = routes[path] || routes['/'];
      handler(container);
    };

    window.addEventListener('popstate', render);
    render();
  },
  navigate(path: string) {
    history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  },
};
