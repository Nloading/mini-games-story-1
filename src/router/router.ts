import { createHomePage } from '../pages/home.page';
import { createLibraryPage } from '../pages/library.page';

type RouteHandler = (container: HTMLElement) => void;

const routes: Record<string, RouteHandler> = {
  '/': (container) => {
    container.replaceChildren(createHomePage());
  },
  '/library': (container) => {
    container.replaceChildren(createLibraryPage());
  },
};

export const router = {
  init(container: HTMLElement) {
    const fallbackHandler = routes['/'];

    const render = () => {
      const path = window.location.pathname || '/';
      const handler = routes[path] ?? fallbackHandler;

      if (!handler) {
        return;
      }

      handler(container);
    };

    document.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || !href.startsWith('/') || link.target === '_blank') return;

      e.preventDefault();
      router.navigate(href);
    });

    window.addEventListener('popstate', render);
    render();
  },
  navigate(path: string) {
    history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  },
};
