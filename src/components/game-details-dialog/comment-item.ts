import heartIcon from '../../assets/images/heartnotactive.png';
import heartActiveIcon from '../../assets/images/heart.png';
import { toggleCommentLike } from '@/api/endpoints';
import type { GameComment } from '@/api/types';
import { getErrorMessage, isOutcomeUnknownError } from '@/api/http';
import { requireSession } from '@/auth/protected-action';
import { showSnackbar } from '@/components/snackbar/snackbar';
import { getAvatarInitial } from '@/utils/avatar';
import { formatRelativeTime } from '@/utils/relative-time';

const ICON_SIZE = 14;
const UNKNOWN_OUTCOME_MESSAGE =
  'We could not confirm whether your like was saved. Reload the comments to see the current state.';

function createSpan(className: string, text: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;

  return span;
}

export function createCommentItem(comment: GameComment, avatarVariant: number): HTMLLIElement {
  let state = { isLiked: comment.isLikedByCurrentUser, likesCount: comment.likesCount };
  let pending = false;

  const item = document.createElement('li');
  item.className = 'comment';

  const avatar = createSpan(
    `avatar avatar--${avatarVariant}`,
    getAvatarInitial(comment.authorName)
  );
  avatar.setAttribute('aria-hidden', 'true');

  const meta = document.createElement('div');
  meta.className = 'comment__meta';
  meta.append(
    createSpan('comment__name', comment.authorName),
    createSpan('comment__time', formatRelativeTime(comment.createdAt))
  );

  const text = document.createElement('p');
  text.className = 'comment__text';
  text.textContent = comment.text;

  const likeButton = document.createElement('button');
  likeButton.type = 'button';
  likeButton.className = 'comment__like';

  function render(): void {
    const icon = document.createElement('img');
    icon.src = state.isLiked ? heartActiveIcon : heartIcon;
    icon.alt = '';
    icon.width = ICON_SIZE;
    icon.height = ICON_SIZE;

    likeButton.classList.toggle('is-liked', state.isLiked);
    likeButton.classList.toggle('is-loading', pending);
    likeButton.disabled = pending;
    likeButton.setAttribute('aria-pressed', String(state.isLiked));
    likeButton.setAttribute('aria-busy', String(pending));
    likeButton.setAttribute(
      'aria-label',
      `${state.isLiked ? 'Unlike' : 'Like'} comment, ${state.likesCount} likes`
    );
    likeButton.replaceChildren(icon, document.createTextNode(String(state.likesCount)));
  }

  async function toggleLike(): Promise<void> {
    if (pending) return;

    const session = requireSession();
    if (session === null) return;

    pending = true;
    render();

    try {
      const { data } = await toggleCommentLike(comment.commentId, session.email);
      state = { isLiked: data.isLikedByCurrentUser, likesCount: data.likesCount };
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

  likeButton.addEventListener('click', () => {
    void toggleLike();
  });
  render();

  const body = document.createElement('div');
  body.className = 'comment__body';
  body.append(meta, text, likeButton);
  item.append(avatar, body);

  return item;
}
