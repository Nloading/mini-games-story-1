import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  logout: vi.fn<() => Promise<boolean>>(),
  showSnackbar: vi.fn(),
  sessionListener: null as ((session: null, event: string) => void) | null,
}));

vi.mock('./router/router', () => ({
  router: {
    subscribe: vi.fn(),
    start: vi.fn(),
    closeDialog: vi.fn(),
    openGame: vi.fn(),
  },
}));
vi.mock('@/components/header/header', () => ({
  createHeader: () => {
    const header = document.createElement('header');
    header.innerHTML = `
      <button class="site-header__menu"></button>
      <div class="site-header__actions">
        <button class="btn--outline"></button>
        <button class="btn--primary"></button>
      </div>
      <button data-action="logout"></button>
    `;
    return header;
  },
}));
vi.mock('@/components/footer/footer', () => ({
  createFooter: () => document.createElement('footer'),
}));
vi.mock('@/components/auth-dialog/auth-dialog', () => ({
  createAuthDialog: () => document.createElement('dialog'),
}));
vi.mock('@/components/game-details-dialog/game-details-dialog', () => ({
  createGameDetailsDialog: () => ({
    element: document.createElement('dialog'),
    show: vi.fn(),
    hide: vi.fn(),
    setSuspended: vi.fn(),
  }),
}));
vi.mock('@/components/mobile-nav/mobile-nav', () => ({
  createMobileNav: () => document.createElement('dialog'),
}));
vi.mock('@/pages/home.page', () => ({
  createHomePage: () => document.createElement('section'),
}));
vi.mock('@/pages/library.page', () => ({
  createLibraryPage: () => document.createElement('section'),
}));
vi.mock('@/pages/not-found.page', () => ({
  createNotFoundPage: () => document.createElement('section'),
}));
vi.mock('@/auth/session-store', () => ({
  initSession: vi.fn(),
  logout: mocks.logout,
  subscribeSession: (listener: (session: null, event: string) => void) => {
    mocks.sessionListener = listener;
    return vi.fn();
  },
  validateSession: vi.fn(),
}));
vi.mock('@/components/snackbar/snackbar', () => ({
  showSnackbar: mocks.showSnackbar,
}));
vi.mock('@/auth/auth-guard', () => ({
  guardAuthRoute: vi.fn(() => true),
  openAuth: vi.fn(),
}));

import { createApp } from './app';

describe('createApp', () => {
  beforeEach(() => {
    mocks.logout.mockReset();
    mocks.showSnackbar.mockReset();
    mocks.sessionListener = null;
    window.history.replaceState({}, '', '/mini-games-story-1/');
  });

  it('logs out and reports successful sign-out', async () => {
    mocks.logout.mockResolvedValue(true);
    const app = createApp();
    document.body.append(app);

    app.querySelector<HTMLButtonElement>('[data-action="logout"]')?.click();
    await vi.waitFor(() =>
      expect(mocks.showSnackbar).toHaveBeenCalledWith('You have been logged out.', 'success')
    );
    expect(mocks.logout).toHaveBeenCalledOnce();
  });

  it('reports Firebase sign-out failure while keeping guest-mode feedback explicit', async () => {
    mocks.logout.mockResolvedValue(false);
    const app = createApp();
    document.body.append(app);

    app.querySelector<HTMLButtonElement>('[data-action="logout"]')?.click();
    await vi.waitFor(() =>
      expect(mocks.showSnackbar).toHaveBeenCalledWith(
        'Firebase sign-out failed. You are in Guest Mode.',
        'error'
      )
    );
  });

  it('shows a warning when the session expires', () => {
    createApp();

    mocks.sessionListener?.(null, 'expired');

    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      'Your session has expired. Please log in again.',
      'warning'
    );
  });

  it('mounts app chrome and starts session and routing initialization', async () => {
    const { router } = await import('./router/router');
    const { initSession } = await import('@/auth/session-store');

    const app = createApp();

    expect(app.querySelector('header')).not.toBeNull();
    expect(app.querySelector('main#view')).not.toBeNull();
    expect(app.querySelector('footer')).not.toBeNull();
    expect(router.start).toHaveBeenCalledOnce();
    expect(initSession).toHaveBeenCalledOnce();
  });
});
