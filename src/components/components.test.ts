import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category, GameCard, GameComment, GameDetails } from '@/api/types';
import { createAuthDialog } from '@/components/auth-dialog/auth-dialog';
import { createProfile } from '@/components/profile/profile';
import { createHeader } from '@/components/header/header';
import { createMobileNav } from '@/components/mobile-nav/mobile-nav';
import { createFavoriteControl } from '@/components/game-details-dialog/favorite-control';
import { createCommentForm } from '@/components/game-details-dialog/comment-form';
import { createCommentItem } from '@/components/game-details-dialog/comment-item';
import { createCommentsSection } from '@/components/game-details-dialog/comments-section';
import { createGameDetailsDialog } from '@/components/game-details-dialog/game-details-dialog';
import {
  createErrorBanner,
  createEmptyState,
  createSkeleton,
} from '@/components/feedback/feedback';
import { createFilterBar } from '@/components/filter-bar/filter-bar';
import { createPagination, getVisiblePages } from '@/components/pagination/pagination';
import {
  createGameCards,
  createGameCardsSkeleton,
  createGameGrid,
} from '@/components/game-grid/game-grid';
import { createTopPlayers } from '@/components/top-players/top-players';
import { createNewGames } from '@/components/new-games/new-games';
import { createFooter } from '@/components/footer/footer';
import { createHero } from '@/components/hero/hero';
import { createLibraryHeader } from '@/components/library-header/library-header';
import { createDeveloperCta } from '@/components/developer-cta/developer-cta';
import { createNotFound } from '@/components/not-found/not-found';
import { createHomePage } from '@/pages/home.page';
import { createLibraryPage } from '@/pages/library.page';
import { createNotFoundPage } from '@/pages/not-found.page';
import { router } from '@/router/router';
import { showSnackbar } from '@/components/snackbar/snackbar';
import { AuthCancelledError } from '@/auth/auth-service';

const doubles = vi.hoisted(() => ({
  session: null as {
    displayName: string;
    email: string;
    authenticatedAt: number;
    avatarUrl?: string;
  } | null,
  sessionListeners: [] as Array<
    (
      session: {
        displayName: string;
        email: string;
        authenticatedAt: number;
        avatarUrl?: string;
      } | null
    ) => void
  >,
  toggleFavorite: vi.fn(),
  postComment: vi.fn(),
  toggleCommentLike: vi.fn(),
  fetchGameComments: vi.fn(),
  fetchGameDetails: vi.fn(),
  fetchCategories: vi.fn(),
  fetchGames: vi.fn(),
  loginWithEmail: vi.fn(),
  registerWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  startSession: vi.fn(),
  requireSession: vi.fn(),
  openAuth: vi.fn(),
}));

vi.mock('@/api/endpoints', () => ({
  toggleFavorite: doubles.toggleFavorite,
  postComment: doubles.postComment,
  toggleCommentLike: doubles.toggleCommentLike,
  fetchGameComments: doubles.fetchGameComments,
  fetchGameDetails: doubles.fetchGameDetails,
  fetchCategories: doubles.fetchCategories,
  fetchGames: doubles.fetchGames,
}));

vi.mock('@/api/http', () => ({
  getErrorMessage: (error: unknown) => (error instanceof Error ? error.message : 'Request failed.'),
  isOutcomeUnknownError: () => false,
  isUnknownResourceError: () => false,
  isAbortError: (error: unknown) => error instanceof Error && error.name === 'AbortError',
}));

vi.mock('@/auth/protected-action', () => ({
  requireSession: doubles.requireSession,
}));

vi.mock('@/auth/session-store', () => ({
  getSession: () => doubles.session,
  subscribeSession: (listener: (session: typeof doubles.session) => void) => {
    doubles.sessionListeners.push(listener);
    return () => {
      const index = doubles.sessionListeners.indexOf(listener);
      if (index >= 0) doubles.sessionListeners.splice(index, 1);
    };
  },
  startSession: doubles.startSession,
}));

vi.mock('@/auth/auth-service', () => ({
  AuthCancelledError: class AuthCancelledError extends Error {},
  getAuthErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : 'Authentication failed.',
  loginWithEmail: doubles.loginWithEmail,
  registerWithEmail: doubles.registerWithEmail,
  loginWithGoogle: doubles.loginWithGoogle,
}));

vi.mock('@/auth/auth-guard', () => ({
  openAuth: doubles.openAuth,
}));

vi.mock('@/router/router', () => ({
  router: {
    href: (path: string) => `/mini-games-story-1${path}`,
    getState: () => ({
      page: 'library',
      library: { category: null, sort: 'rating-desc', page: 1 },
    }),
    subscribe: () => () => undefined,
    setQuery: vi.fn(),
  },
}));

vi.mock('@/components/snackbar/snackbar', () => ({
  showSnackbar: vi.fn(),
}));

const session = {
  displayName: 'Avery Player',
  email: 'avery@example.com',
  authenticatedAt: 1000,
};

const category: Category = { slug: 'cozy', label: 'Cozy', isDefault: true };

const gameCard: GameCard = {
  slug: 'cozy-game',
  name: '<Cozy Game>',
  category: 'Cozy',
  price: 'Free',
  shortDescription: '<img src=x onerror=alert(1)>',
  rating: 4.7,
  likesCount: 1250,
  cardImage: '/cozy.jpg',
};

const gameComment: GameComment = {
  commentId: 'comment-1',
  authorName: 'Avery Player',
  text: 'A lovely game',
  likesCount: 4,
  isLikedByCurrentUser: false,
  createdAt: '2026-10-10T12:00:00.000Z',
};

const gameDetails: GameDetails = {
  slug: 'cozy-game',
  name: 'Cozy Game',
  heroImage: '/cozy-hero.jpg',
  rating: 4.7,
  likesCount: 18,
  isLikedByCurrentUser: false,
  fullDescription: 'A relaxing puzzle game.',
  specs: { genre: 'Puzzle', players: '1', duration: '10 min', price: 'Free' },
  topRecords: [
    { position: 1, playerName: 'Avery', score: 1200, achievedAt: '2026-10-10T12:00:00.000Z' },
  ],
};

function setSession(value: typeof doubles.session): void {
  doubles.session = value;
  doubles.sessionListeners.forEach((listener) => listener(value));
}

async function waitFor(assertion: () => void): Promise<void> {
  await vi.waitFor(assertion);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(
      () =>
        ({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        } as unknown as MediaQueryList)
    )
  );
  doubles.session = null;
  doubles.sessionListeners.length = 0;
  doubles.requireSession.mockImplementation(() => doubles.session);
  doubles.toggleFavorite.mockResolvedValue({ data: { isFavorited: true, likesCount: 19 } });
  doubles.postComment.mockResolvedValue({ data: { data: gameComment } });
  doubles.toggleCommentLike.mockResolvedValue({
    data: { isLikedByCurrentUser: true, likesCount: 5 },
  });
  doubles.fetchGameComments.mockResolvedValue({
    data: [],
    meta: { totalComments: 0, returnedCount: 0, sort: 'newest' },
  });
  doubles.fetchGameDetails.mockResolvedValue({ data: gameDetails });
  doubles.fetchCategories.mockResolvedValue({ data: [category] });
  doubles.fetchGames.mockResolvedValue({
    data: [gameCard],
    meta: {
      page: 1,
      limit: 12,
      totalItems: 1,
      totalPages: 1,
      appliedFilter: { category: 'cozy', sort: 'rating-desc' },
    },
  });
  doubles.loginWithEmail.mockResolvedValue({
    displayName: 'Avery Player',
    email: 'avery@example.com',
  });
  doubles.registerWithEmail.mockResolvedValue({
    displayName: 'Avery Player',
    email: 'avery@example.com',
  });
  doubles.loginWithGoogle.mockResolvedValue({
    displayName: 'Avery Player',
    email: 'avery@example.com',
  });
});

describe('authentication dialogs and profiles', () => {
  it('locks a pending login, blocks dialog dismissal, and closes on successful authentication', async () => {
    let resolveLogin: ((value: { displayName: string; email: string }) => void) | undefined;
    doubles.loginWithEmail.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveLogin = resolve;
      })
    );
    const dialog = createAuthDialog();
    document.body.append(dialog);
    dialog.showModal();

    const form = dialog.querySelector<HTMLFormElement>('[data-panel="login"]')!;
    const email = form.querySelector<HTMLInputElement>('[name="email"]')!;
    const password = form.querySelector<HTMLInputElement>('[name="password"]')!;
    const submit = form.querySelector<HTMLButtonElement>('.auth-form__submit')!;

    expect(submit.disabled).toBe(true);
    email.value = 'bad-email';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    expect(form.querySelector('[data-error-for="email"]')?.textContent).toMatch(/valid email/i);

    email.value = 'avery@example.com';
    password.value = 'secret123';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    expect(submit.disabled).toBe(false);
    form.querySelector<HTMLButtonElement>('.auth-field__toggle')!.click();
    expect(password.type).toBe('text');
    form.querySelector<HTMLButtonElement>('.auth-field__toggle')!.click();
    expect(password.type).toBe('password');

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(dialog.getAttribute('aria-busy')).toBe('true');
    expect(submit.disabled).toBe(true);
    expect(dialog.querySelector<HTMLButtonElement>('.auth-dialog__close')?.disabled).toBe(true);

    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    dialog.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(true);
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dialog.open).toBe(true);

    resolveLogin?.({ displayName: 'Avery Player', email: 'avery@example.com' });
    await waitFor(() =>
      expect(doubles.loginWithEmail).toHaveBeenCalledWith('avery@example.com', 'secret123')
    );
    expect(doubles.startSession).toHaveBeenCalledWith({
      displayName: 'Avery Player',
      email: 'avery@example.com',
    });
    expect(dialog.open).toBe(false);
    expect(showSnackbar).toHaveBeenCalledWith('You are signed in.', 'success');
    expect(dialog.getAttribute('aria-busy')).toBe('false');
  });

  it('supports registration validation, service failure messaging, and tab switching', async () => {
    doubles.registerWithEmail.mockRejectedValue(new Error('Registration unavailable'));
    const dialog = createAuthDialog();
    document.body.append(dialog);
    dialog.querySelector<HTMLButtonElement>('[data-tab="register"]')!.click();

    const registerForm = dialog.querySelector<HTMLFormElement>('[data-panel="register"]')!;
    expect(registerForm.hidden).toBe(false);
    const username = registerForm.querySelector<HTMLInputElement>('[name="username"]')!;
    const email = registerForm.querySelector<HTMLInputElement>('[name="email"]')!;
    const password = registerForm.querySelector<HTMLInputElement>('[name="password"]')!;
    const confirmation = registerForm.querySelector<HTMLInputElement>('[name="confirmPassword"]')!;

    username.value = 'Avery';
    email.value = 'avery@example.com';
    password.value = 'Secret123!';
    confirmation.value = 'different';
    confirmation.dispatchEvent(new Event('input', { bubbles: true }));
    expect(registerForm.querySelector('[data-error-for="confirmPassword"]')?.textContent).toMatch(
      /match/i
    );

    confirmation.value = 'Secret123!';
    confirmation.dispatchEvent(new Event('input', { bubbles: true }));
    expect(registerForm.querySelector<HTMLButtonElement>('.auth-form__submit')?.disabled).toBe(
      false
    );
    password.value = 'Changed123!';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    expect(registerForm.querySelector('[data-error-for="confirmPassword"]')?.textContent).toMatch(
      /match/i
    );
    expect(registerForm.querySelector<HTMLButtonElement>('.auth-form__submit')?.disabled).toBe(
      true
    );
    password.value = 'Secret123!';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    expect(registerForm.querySelector<HTMLButtonElement>('.auth-form__submit')?.disabled).toBe(
      false
    );
    dialog.showModal();
    registerForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() =>
      expect(doubles.registerWithEmail).toHaveBeenCalledWith(
        'Avery',
        'avery@example.com',
        'Secret123!'
      )
    );
    expect(showSnackbar).toHaveBeenCalledWith('Registration unavailable', 'error');
    expect(dialog.open).toBe(true);

    dialog.querySelector<HTMLButtonElement>('[data-switch="login"]')!.click();
    expect(dialog.querySelector<HTMLFormElement>('[data-panel="login"]')?.hidden).toBe(false);
    expect(dialog.querySelector('[data-tab="login"]')?.getAttribute('aria-selected')).toBe('true');
  });

  it('keeps the dialog open after a cancelled Google sign-in and renders a safe profile fallback', async () => {
    const cancelled = new AuthCancelledError();
    doubles.loginWithGoogle.mockRejectedValue(cancelled);
    const dialog = createAuthDialog();
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('.btn--google')!.click();

    await waitFor(() => expect(doubles.loginWithGoogle).toHaveBeenCalledOnce());
    expect(dialog.open).toBe(true);
    expect(showSnackbar).toHaveBeenCalledWith('Sign-in was cancelled.', 'info');

    const profile = createProfile({ ...session, avatarUrl: 'javascript:alert(1)' }, 'header');
    expect(profile.textContent).toContain('Avery Player');
    expect(profile.querySelector('.profile__avatar')?.textContent).toBe('AP');
    expect(profile.querySelector('[data-action="logout"]')?.textContent).toBe('Logout');

    const photoProfile = createProfile(
      { ...session, avatarUrl: 'https://example.test/avatar.png' },
      'header'
    );
    photoProfile
      .querySelector<HTMLImageElement>('.profile__photo')
      ?.dispatchEvent(new Event('error'));
    expect(photoProfile.querySelector('.profile__avatar')?.textContent).toBe('AP');
    expect(photoProfile.querySelector('.profile__photo')).toBeNull();
  });
});

describe('favorite and comment controls', () => {
  it('commits favorite state only from the successful API response and restores controls after failure', async () => {
    setSession(session);
    const button = createFavoriteControl('cozy-game', { isFavorited: false, likesCount: 1200 });
    document.body.append(button);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toContain('1.2K');

    button.click();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    await waitFor(() => expect(button.getAttribute('aria-pressed')).toBe('true'));
    expect(doubles.toggleFavorite).toHaveBeenCalledWith('cozy-game', session.email);
    expect(button.getAttribute('aria-label')).toBe('Remove from favorites');
    expect(showSnackbar).toHaveBeenCalledWith('Added to favorites.', 'success');
    expect(button.disabled).toBe(false);

    doubles.toggleFavorite.mockRejectedValueOnce(new Error('Favorite failed'));
    button.click();
    await waitFor(() => expect(showSnackbar).toHaveBeenCalledWith('Favorite failed', 'error'));
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.disabled).toBe(false);
  });

  it('locks guest comments and posts a trimmed comment with recovery after a server error', async () => {
    const guestForm = createCommentForm('cozy-game', vi.fn());
    expect(guestForm.querySelector<HTMLTextAreaElement>('textarea')?.disabled).toBe(true);
    expect(guestForm.querySelector<HTMLTextAreaElement>('textarea')?.placeholder).toBe(
      'Log in to leave a comment'
    );
    const guestSubmit = guestForm.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(guestSubmit?.disabled).toBe(true);

    setSession(session);
    const onPosted = vi.fn();
    const form = createCommentForm('cozy-game', onPosted);
    const input = form.querySelector<HTMLTextAreaElement>('textarea')!;
    input.value = '  This game is great!  ';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await waitFor(() =>
      expect(doubles.postComment).toHaveBeenCalledWith('cozy-game', {
        userEmail: session.email,
        authorName: 'Avery Player',
        text: 'This game is great!',
      })
    );
    expect(input.value).toBe('');
    expect(onPosted).toHaveBeenCalledOnce();
    expect(showSnackbar).toHaveBeenCalledWith('Comment posted.', 'success');
    expect(form.getAttribute('aria-busy')).toBe('false');

    doubles.postComment.mockRejectedValueOnce(new Error('Comment could not be saved'));
    input.value = 'Keep this text';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() =>
      expect(form.querySelector('[role="alert"]')?.textContent).toBe('Comment could not be saved')
    );
    expect(input.value).toBe('Keep this text');
    expect(showSnackbar).toHaveBeenCalledWith('Comment could not be saved', 'error');
  });

  it('submits with Enter, preserves Shift+Enter, and rejects comments over 500 characters', async () => {
    setSession(session);
    const form = createCommentForm('cozy-game', vi.fn());
    const input = form.querySelector<HTMLTextAreaElement>('textarea')!;
    expect(form.querySelector('.avatar--user')?.textContent).toBe('A');

    input.value = 'Submitted with Enter';
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    input.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    await waitFor(() => expect(doubles.postComment).toHaveBeenCalledOnce());

    input.value = 'First line';
    const shiftEnter = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(shiftEnter);
    expect(shiftEnter.defaultPrevented).toBe(false);
    expect(doubles.postComment).toHaveBeenCalledOnce();

    input.value = 'x'.repeat(501);
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(form.querySelector('[role="alert"]')?.textContent).toMatch(/500 characters/i);
    expect(doubles.postComment).toHaveBeenCalledOnce();
  });

  it('validates comment length and updates comment likes on success without optimistic mutation', async () => {
    setSession(session);
    const form = createCommentForm('cozy-game', vi.fn());
    const input = form.querySelector<HTMLTextAreaElement>('textarea')!;
    input.value = '   ';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(form.querySelector('[role="alert"]')?.textContent).toMatch(/comment/i);
    expect(doubles.postComment).not.toHaveBeenCalled();

    const item = createCommentItem(gameComment, 2);
    document.body.append(item);
    const like = item.querySelector<HTMLButtonElement>('.comment__like')!;
    like.click();
    expect(like.disabled).toBe(true);
    expect(like.getAttribute('aria-pressed')).toBe('false');
    await waitFor(() => expect(like.getAttribute('aria-pressed')).toBe('true'));
    expect(doubles.toggleCommentLike).toHaveBeenCalledWith(gameComment.commentId, session.email);
    expect(like.textContent).toContain('5');
    expect(like.getAttribute('aria-label')).toBe('Unlike comment, 5 likes');

    doubles.toggleCommentLike.mockRejectedValueOnce(new Error('Like failed'));
    like.click();
    await waitFor(() => expect(showSnackbar).toHaveBeenCalledWith('Like failed', 'error'));
    expect(like.getAttribute('aria-pressed')).toBe('true');
    expect(like.disabled).toBe(false);
  });

  it('renders comment sections with empty states, loading data, and guest/session form states', async () => {
    doubles.fetchGameComments.mockResolvedValueOnce({
      data: [gameComment],
      meta: { totalComments: 1, returnedCount: 1, sort: 'newest' },
    });
    const section = createCommentsSection('cozy-game');
    document.body.append(section);
    await waitFor(() => expect(section.textContent).toContain('A lovely game'));
    expect(section.querySelector('h3')?.textContent).toBe('Comments (1)');
    expect(section.querySelector<HTMLTextAreaElement>('textarea')?.disabled).toBe(true);

    setSession(session);
    expect(section.querySelector<HTMLTextAreaElement>('textarea')?.disabled).toBe(false);
    expect(doubles.fetchGameComments).toHaveBeenCalledWith(
      'cozy-game',
      session.email,
      expect.any(AbortSignal)
    );
  });

  it('loads game details into its dialog and handles unknown and close interactions', async () => {
    const dialog = createGameDetailsDialog();
    document.body.append(dialog.element);
    dialog.show('cozy-game');
    expect(dialog.element.open).toBe(true);
    expect(dialog.element.querySelector('.game-dialog__skeleton')).not.toBeNull();

    await waitFor(() => expect(dialog.element.querySelector('h2')?.textContent).toBe('Cozy Game'));
    expect(dialog.element.textContent).toContain('A relaxing puzzle game.');
    expect(dialog.element.textContent).toContain('Avery');
    expect(dialog.element.querySelector('.game-dialog__favorite')).not.toBeNull();
    expect(doubles.fetchGameDetails).toHaveBeenCalledWith(
      'cozy-game',
      undefined,
      expect.any(AbortSignal)
    );

    dialog.setSuspended(true);
    expect(dialog.element.classList.contains('is-suspended')).toBe(true);
    dialog.element.querySelector<HTMLButtonElement>('.game-dialog__close')!.click();
    expect(dialog.element.open).toBe(false);

    doubles.fetchGameDetails.mockRejectedValueOnce(new Error('Missing'));
    dialog.show('missing');
    await waitFor(() => expect(dialog.element.textContent).toContain('Something went wrong'));
  });
});

describe('navigation and library controls', () => {
  it('updates header and mobile navigation for menu, session, and auth interactions', () => {
    const header = createHeader();
    document.body.append(header);
    expect(header.querySelectorAll('.site-header__nav a')).toHaveLength(4);
    const menu = header.querySelector<HTMLButtonElement>('.site-header__menu')!;
    menu.click();
    expect(menu.getAttribute('aria-expanded')).toBe('true');
    expect(header.querySelector('.site-header__nav')?.classList.contains('is-open')).toBe(true);
    menu.click();
    expect(menu.getAttribute('aria-expanded')).toBe('false');

    const mobile = createMobileNav();
    document.body.append(mobile);
    expect(mobile.querySelectorAll('.mobile-nav__links a')).toHaveLength(4);
    setSession(session);
    expect(mobile.classList.contains('is-authenticated')).toBe(true);
    expect(mobile.querySelector('.profile__name')?.textContent).toBe('Avery Player');
    mobile.querySelector<HTMLButtonElement>('[data-auth-tab="register"]')!.click();
    expect(doubles.openAuth).toHaveBeenCalledWith('register');
    expect(mobile.open).toBe(false);

    setSession(null);
    expect(mobile.classList.contains('is-authenticated')).toBe(false);
    expect(mobile.querySelector('.profile')).toBeNull();
    mobile.showModal();
    mobile.querySelector<HTMLButtonElement>('.mobile-nav__close')!.click();
    expect(mobile.open).toBe(false);
  });

  it('filters categories, exposes sorting state, and closes the menu on outside clicks', () => {
    const onCategoryChange = vi.fn();
    const onSortChange = vi.fn();
    const filter = createFilterBar({ onCategoryChange, onSortChange });
    const categories = [category, { slug: 'puzzle', label: 'Puzzle', isDefault: false }];
    filter.chipsRegion.append(filter.createChips(categories, 'cozy'));
    const chips = filter.chipsRegion.querySelectorAll<HTMLButtonElement>('.filter-chip');
    expect(chips[0]?.getAttribute('aria-pressed')).toBe('true');
    chips[1]?.click();
    expect(onCategoryChange).toHaveBeenCalledWith('puzzle');
    filter.setActiveCategory('puzzle');
    expect(chips[1]?.classList.contains('is-selected')).toBe(true);

    const trigger = filter.element.querySelector<HTMLButtonElement>('.sort-control__trigger')!;
    const menu = filter.element.querySelector<HTMLElement>('.sort-control__menu')!;
    trigger.click();
    expect(menu.hidden).toBe(false);
    filter.element.querySelector<HTMLElement>('[data-sort="name-asc"]')!.click();
    expect(onSortChange).toHaveBeenCalledWith('name-asc');
    expect(menu.hidden).toBe(true);
    filter.setSort('name-asc');
    expect(filter.element.querySelector('[data-sort-label]')?.textContent).toContain('Name A→Z');

    trigger.click();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(menu.hidden).toBe(true);
    expect(filter.createChipsSkeleton().querySelectorAll('.skeleton--chip')).toHaveLength(7);
  });

  it('calculates and updates accessible pagination without invoking disabled arrows', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(
        () =>
          ({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          } as unknown as MediaQueryList)
      )
    );
    expect(getVisiblePages(7, 10, 4)).toEqual([6, 7, 8, 9]);
    const onPageChange = vi.fn();
    const pagination = createPagination(onPageChange);
    document.body.append(pagination.element);
    pagination.update({ page: 5, totalPages: 8 });
    expect(pagination.element.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe(
      '5'
    );
    expect(pagination.element.querySelectorAll('.pagination__page')).toHaveLength(4);
    pagination.element.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.click();
    expect(onPageChange).toHaveBeenCalledWith(6);

    pagination.update({ page: 1, totalPages: 0 });
    expect(
      pagination.element.querySelector<HTMLButtonElement>('[aria-label="Previous page"]')?.disabled
    ).toBe(true);
    pagination.element.querySelector<HTMLButtonElement>('[aria-label="Previous page"]')!.click();
    expect(onPageChange).toHaveBeenCalledOnce();
  });

  it('renders escaped game cards, skeletons, and grid regions', () => {
    const cards = createGameCards([gameCard]);
    expect(cards.querySelector('h3')?.textContent).toBe('<Cozy Game>');
    expect(cards.querySelector('h3')?.innerHTML).toBe('&lt;Cozy Game&gt;');
    expect(cards.querySelector('.library-card__desc')?.querySelector('img')).toBeNull();
    expect(cards.querySelector('.price')?.classList.contains('price--free')).toBe(true);
    expect(cards.querySelector('.library-card__details')?.getAttribute('data-slug')).toBe(
      'cozy-game'
    );
    expect(createGameCardsSkeleton(3).querySelectorAll('.library-card--skeleton')).toHaveLength(3);
    expect(createGameGrid().region).toBeInstanceOf(HTMLElement);
  });
});

describe('static components and pages', () => {
  it('renders feedback states with accessible status and retry behavior', () => {
    expect(createSkeleton('title').getAttribute('aria-hidden')).toBe('true');
    expect(createEmptyState('Nothing here', 'Try again later').getAttribute('role')).toBe('status');
    const retry = vi.fn();
    const banner = createErrorBanner('Offline', retry);
    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.textContent).toContain('Offline');
    banner.querySelector('button')!.click();
    expect(retry).toHaveBeenCalledOnce();
  });

  it('renders top-player rows and the looping new-games carousel with working controls', () => {
    const players = createTopPlayers();
    expect(players.querySelectorAll('tbody tr')).toHaveLength(5);
    expect(players.querySelector('caption')?.textContent).toContain('Ranking');
    expect(players.textContent).toContain('94,250');

    vi.useFakeTimers();
    const newGames = createNewGames();
    expect(newGames.querySelectorAll('.game-card')).toHaveLength(25);
    expect(newGames.querySelector('.game-card--featured .game-card__title')?.textContent).toBe(
      'Vacation Cafe Simulator'
    );
    const forward = newGames.querySelector<HTMLButtonElement>('[aria-label="Scroll right"]')!;
    forward.click();
    expect(forward.disabled).toBe(true);
    vi.advanceTimersByTime(500);
    expect(forward.disabled).toBe(false);
    expect(newGames.querySelectorAll('.game-card--featured')).toHaveLength(1);
    vi.useRealTimers();
  });

  it('renders footer, hero, library header, developer CTA, and not-found pages', () => {
    const footer = createFooter();
    expect(footer.querySelectorAll('nav')).toHaveLength(2);
    expect(footer.querySelector('a[aria-label="GitHub profile"]')?.textContent).toContain(
      '@Nloading'
    );
    expect(createHero().querySelector('a')?.textContent).toBe('Browse Library');
    expect(createLibraryHeader().querySelector('h1')?.textContent).toBe('Game Library');
    expect(createDeveloperCta().querySelector('a[href^="mailto:"]')?.getAttribute('href')).toBe(
      'mailto:developers@minigames.com'
    );
    expect(createNotFound('/lost')?.textContent).toContain('The page "/lost" does not exist');
    expect(createNotFoundPage('/lost').getAttribute('aria-label')).toBe('Page not found');
    expect(createHomePage().querySelectorAll('main > section')).toHaveLength(4);
  });

  it('loads the library page from mocked API boundaries and reflects cards and query controls', async () => {
    const page = createLibraryPage();
    document.body.append(page);
    await waitFor(() =>
      expect(page.querySelector('.library-card h3')?.textContent).toBe('<Cozy Game>')
    );
    expect(doubles.fetchCategories).toHaveBeenCalledOnce();
    expect(doubles.fetchGames).toHaveBeenCalledWith(
      { category: 'cozy', sort: 'rating-desc', page: 1 },
      expect.any(AbortSignal)
    );
    expect(page.getAttribute('aria-label')).toBe('Game library page');
    page.querySelector<HTMLButtonElement>('.sort-control__trigger')!.click();
    page.querySelector<HTMLElement>('[data-sort="rating-asc"]')!.click();
    expect(router.setQuery).toHaveBeenCalled();
  });
});
