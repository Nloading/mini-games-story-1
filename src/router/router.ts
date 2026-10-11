import { isSameRoute, parseRoute, QUERY_KEYS } from './url-state';
import type { AuthMode, RouteState } from './url-state';

export type DialogKind = 'game' | 'auth';

type RouteListener = (state: RouteState, previous: RouteState | null) => void;
type QueryPatch = Record<string, string | number | null>;

interface NavigateOptions {
  replace?: boolean;
}

interface HistoryMarker {
  dialog?: boolean;
}

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const listeners = new Set<RouteListener>();

let current: RouteState | null = null;
let started = false;

function isInsideBase(pathname: string): boolean {
  return basePath === '' || pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function stripBase(pathname: string): string {
  if (basePath !== '' && isInsideBase(pathname)) {
    return pathname.slice(basePath.length) || '/';
  }

  return pathname;
}

function href(path: string): string {
  return `${basePath}${path}`;
}

function readLocation(): RouteState {
  return parseRoute(stripBase(window.location.pathname), window.location.search);
}

function currentUrl(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function isDialogEntry(): boolean {
  const state: unknown = window.history.state;
  return typeof state === 'object' && state !== null && (state as HistoryMarker).dialog === true;
}

function isDialogOpen(state: RouteState | null): boolean {
  return state !== null && (state.gameSlug !== null || state.authMode !== null);
}

function notify(next: RouteState): void {
  const previous = current;
  current = next;
  [...listeners].forEach((listener) => listener(next, previous));
}

function sync(): void {
  const next = readLocation();

  if (current !== null && isSameRoute(current, next)) {
    return;
  }

  notify(next);
}

function writeUrl(url: string, replace: boolean, dialog: boolean): void {
  if (url === currentUrl()) {
    return;
  }

  const marker: HistoryMarker = dialog ? { dialog: true } : {};

  if (replace) {
    window.history.replaceState(marker, '', url);
  } else {
    window.history.pushState(marker, '', url);
  }

  sync();
}

function applyQuery(patch: QueryPatch, replace: boolean, dialog: boolean): void {
  const params = new URLSearchParams(window.location.search);

  Object.entries(patch).forEach(([key, value]) => {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  const search = params.toString();
  writeUrl(
    `${window.location.pathname}${search === '' ? '' : `?${search}`}${window.location.hash}`,
    replace,
    dialog
  );
}

function navigate(path: string, options: NavigateOptions = {}): void {
  const target = new URL(href(path), window.location.origin);
  writeUrl(`${target.pathname}${target.search}`, options.replace === true, false);
}

function setQuery(patch: QueryPatch, options: NavigateOptions = {}): void {
  const replace = options.replace === true;
  applyQuery(patch, replace, replace && isDialogEntry());
}

function openDialog(kind: DialogKind, value: string): void {
  const alreadyOpen = isDialogOpen(current);
  applyQuery({ [QUERY_KEYS[kind]]: value }, alreadyOpen, alreadyOpen ? isDialogEntry() : true);
}

function closeDialog(kind: DialogKind): void {
  if (current === null) {
    return;
  }

  const thisOpen = kind === 'game' ? current.gameSlug !== null : current.authMode !== null;
  if (!thisOpen) {
    return;
  }

  const otherOpen = kind === 'game' ? current.authMode !== null : current.gameSlug !== null;

  // The dialog was opened from this app, so its URL is its own history entry: go back.
  if (!otherOpen && isDialogEntry()) {
    window.history.back();
    return;
  }

  // The dialog came from a deep link: there is no earlier entry, so just clean the URL.
  applyQuery({ [QUERY_KEYS[kind]]: null }, true, isDialogEntry());
}

function onDocumentClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0) {
    return;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  if (!(event.target instanceof Element)) {
    return;
  }

  const link = event.target.closest('a');
  if (link === null || link.target === '_blank' || link.hasAttribute('download')) {
    return;
  }

  const rawHref = link.getAttribute('href');
  if (rawHref === null || rawHref.startsWith('#')) {
    return;
  }

  if (link.origin !== window.location.origin || link.hash !== '') {
    return;
  }

  if (!isInsideBase(link.pathname)) {
    return;
  }

  event.preventDefault();
  writeUrl(`${link.pathname}${link.search}`, false, false);
}

function start(): void {
  if (started) {
    return;
  }

  started = true;
  window.addEventListener('popstate', sync);
  document.addEventListener('click', onDocumentClick);
  notify(readLocation());
}

function subscribe(listener: RouteListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getState(): RouteState {
  return current ?? readLocation();
}

export const router = {
  start,
  subscribe,
  getState,
  href,
  navigate,
  setQuery,
  openGame: (slug: string): void => openDialog('game', slug),
  openAuth: (mode: AuthMode): void => openDialog('auth', mode),
  closeDialog,
};
