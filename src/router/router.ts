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

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function getRoutePath(): string {
  const pathname = window.location.pathname;
  const routePath = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
  return routePath || '/';
}

export const router = {
  init(container: HTMLElement) {
    const fallbackHandler = routes['/'];

    const render = () => {
      const path = getRoutePath();
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
    const normalizedPath = path === '/' ? '' : path;
    history.pushState({}, '', `${basePath}${normalizedPath}` || '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  },
};
