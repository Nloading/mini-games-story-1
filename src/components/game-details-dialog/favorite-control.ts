import heartIcon from '../../assets/images/heartnotactive.png';
import heartActiveIcon from '../../assets/images/heart.png';
import { toggleFavorite } from '@/api/endpoints';
import { getErrorMessage, isOutcomeUnknownError } from '@/api/http';
import { requireSession } from '@/auth/protected-action';
import { showSnackbar } from '@/components/snackbar/snackbar';
import { formatCount } from '@/utils/format';

export interface FavoriteState {
  isFavorited: boolean;
  likesCount: number;
}

const UNKNOWN_OUTCOME_MESSAGE =
  'We could not confirm whether the favorite was saved. Reopen the game to see its current state.';

export function createFavoriteControl(slug: string, initial: FavoriteState): HTMLButtonElement {
  let state = initial;
  let pending = false;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'game-dialog__stat game-dialog__favorite';

  function render(): void {
    const icon = state.isFavorited ? heartActiveIcon : heartIcon;

    button.classList.toggle('is-active', state.isFavorited);
    button.classList.toggle('is-loading', pending);
    button.disabled = pending;
    button.setAttribute('aria-pressed', String(state.isFavorited));
    button.setAttribute('aria-busy', String(pending));
    button.setAttribute(
      'aria-label',
      state.isFavorited ? 'Remove from favorites' : 'Add to favorites'
    );
    button.innerHTML = `<img src="${icon}" alt="" width="16" height="16" />${formatCount(
      state.likesCount
    )}`;
  }

  async function toggle(): Promise<void> {
    if (pending) return;

    const session = requireSession();
    if (session === null) return;

    pending = true;
    render();

    try {
      const { data } = await toggleFavorite(slug, session.email);
      // State comes only from the server response, never from a local guess.
      state = { isFavorited: data.isFavorited, likesCount: data.likesCount };
      showSnackbar(
        state.isFavorited ? 'Added to favorites.' : 'Removed from favorites.',
        'success'
      );
    } catch (error) {
      if (isOutcomeUnknownError(error)) {
        showSnackbar(UNKNOWN_OUTCOME_MESSAGE, 'warning');
      } else {
        showSnackbar(getErrorMessage(error), 'error');
      }
    } finally {
      pending = false;
      render();
    }
  }

  button.addEventListener('click', () => {
    void toggle();
  });
  render();

  return button;
}
