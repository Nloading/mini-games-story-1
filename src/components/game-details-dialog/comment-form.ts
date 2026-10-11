import sendIcon from '../../assets/images/sendTrigger.png';
import { postComment } from '@/api/endpoints';
import { getErrorMessage, isOutcomeUnknownError } from '@/api/http';
import { getCommentAuthorName, getProfileName } from '@/auth/profile';
import { requireSession } from '@/auth/protected-action';
import { getSession } from '@/auth/session-store';
import { showSnackbar } from '@/components/snackbar/snackbar';
import { getAvatarInitial } from '@/utils/avatar';
import { validateCommentText } from '@/utils/comment-validation';

const GUEST_PLACEHOLDER = 'Log in to leave a comment';
const MEMBER_PLACEHOLDER = 'Share your thoughts about this game';
const UNKNOWN_OUTCOME_MESSAGE =
  'We could not confirm that your comment was posted. Your text is kept. Check the comments before sending it again.';

export function createCommentForm(slug: string, onPosted: () => void): HTMLFormElement {
  const session = getSession();

  const form = document.createElement('form');
  form.className = 'comment-form';
  form.noValidate = true;
  form.innerHTML = `
    ${
      session === null
        ? ''
        : '<span class="avatar avatar--user" data-avatar aria-hidden="true"></span>'
    }
    <div class="comment-form__main">
      <div class="comment-form__field">
        <textarea class="comment-form__input" rows="1" aria-label="Add a comment"></textarea>
        <button type="submit" class="comment-form__send" aria-label="Send comment">
          <img src="${sendIcon}" alt="" width="16" height="16" />
        </button>
      </div>
      <p class="comment-form__message" role="alert" hidden></p>
    </div>
  `;

  const input = form.querySelector<HTMLTextAreaElement>('.comment-form__input')!;
  const sendButton = form.querySelector<HTMLButtonElement>('.comment-form__send')!;
  const message = form.querySelector<HTMLElement>('.comment-form__message')!;
  let pending = false;

  // Guests get a locked form; a protected action is never available to them.
  if (session === null) {
    input.placeholder = GUEST_PLACEHOLDER;
    input.disabled = true;
    sendButton.disabled = true;

    return form;
  }

  input.placeholder = MEMBER_PLACEHOLDER;
  const avatar = form.querySelector<HTMLElement>('[data-avatar]');
  if (avatar) avatar.textContent = getAvatarInitial(getProfileName(session));

  function resize(): void {
    input.style.height = 'auto';
    // CSS max-height clamps this; past it the textarea scrolls internally.
    input.style.height = `${input.scrollHeight}px`;
  }

  function showMessage(text: string): void {
    message.textContent = text;
    message.hidden = text === '';
  }

  function setPending(value: boolean): void {
    pending = value;
    input.disabled = value;
    sendButton.disabled = value;
    sendButton.classList.toggle('is-loading', value);
    form.setAttribute('aria-busy', String(value));
  }

  async function submit(): Promise<void> {
    if (pending) return;

    const active = requireSession();
    if (active === null) return;

    const text = input.value.trim();
    const validationError = validateCommentText(text);
    showMessage(validationError ?? '');
    if (validationError !== null) return;

    setPending(true);

    try {
      await postComment(slug, {
        userEmail: active.email,
        authorName: getCommentAuthorName(active),
        text,
      });
      input.value = '';
      resize();
      showMessage('');
      showSnackbar('Comment posted.', 'success');
      onPosted();
    } catch (error) {
      if (isOutcomeUnknownError(error)) {
        showMessage(UNKNOWN_OUTCOME_MESSAGE);
        showSnackbar(UNKNOWN_OUTCOME_MESSAGE, 'warning');
        // Read-only refresh so the user can see whether it landed. The POST is never replayed.
        onPosted();
      } else {
        const failure = getErrorMessage(error);
        showMessage(failure);
        showSnackbar(failure, 'error');
      }
    } finally {
      setPending(false);
      input.focus();
    }
  }

  input.addEventListener('input', () => {
    resize();
    if (!message.hidden) showMessage('');
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void submit();
  });

  return form;
}
