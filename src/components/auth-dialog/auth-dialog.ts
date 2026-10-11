import './auth-dialog.scss';
import mailIcon from '../../assets/images/mail.png';
import passwordIcon from '../../assets/images/password.png';
import eyeIcon from '../../assets/images/eye.png';
import personIcon from '../../assets/images/person.png';
import googleIcon from '../../assets/images/google.png';
import { bindAuthForm } from './auth-form';
import type { AuthFormController } from './auth-form';
import type { AuthMode } from '@/router/url-state';
import closeIcon from '../../assets/images/closeIcon.png';
import {
  AuthCancelledError,
  getAuthErrorMessage,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
} from '@/auth/auth-service';
import type { AuthProfile } from '@/auth/auth-service';
import { startSession } from '@/auth/session-store';
import { showSnackbar } from '@/components/snackbar/snackbar';

export function createAuthDialog(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'auth-dialog';
  dialog.innerHTML = `
    <div class="auth-dialog__panel">
      <button type="button" class="auth-dialog__close" aria-label="Close dialog">
        <img src="${closeIcon}" alt="" width="16" height="16" />
      </button>

      <div class="auth-tabs" role="tablist">
        <button type="button" role="tab" class="auth-tabs__btn is-active" data-tab="login" aria-selected="true">Login</button>
        <button type="button" role="tab" class="auth-tabs__btn" data-tab="register" aria-selected="false">Register</button>
      </div>

      <form class="auth-form" data-panel="login" novalidate>
        <h2>Welcome Back!</h2>
        <p class="auth-form__lead">Sign in to resume your games and progress.</p>

        <label class="auth-field">
          <span>Email Address</span>
          <span class="auth-field__control">
            <img src="${mailIcon}" alt="Email" width="16" height="16" />
            <input type="email" name="email" placeholder="e.g. alex@minigames.com" autocomplete="email" aria-describedby="login-email-error" required />
          </span>
          <span class="auth-field__error" id="login-email-error" data-error-for="email" role="alert" hidden></span>
        </label>

        <label class="auth-field">
          <span>Password</span>
          <span class="auth-field__control">
            <img src="${passwordIcon}" alt="Password" width="16" height="16" />
            <input type="password" name="password" placeholder="••••••••" autocomplete="current-password" aria-describedby="login-password-error" required />
            <button type="button" class="auth-field__toggle" aria-label="Show password">
              <img src="${eyeIcon}" alt="Show password" width="16" height="16" />
            </button>
          </span>
          <span class="auth-field__error" id="login-password-error" data-error-for="password" role="alert" hidden></span>
        </label>

        <a href="#" class="auth-form__forgot">Forgot Password?</a>

        <button type="submit" class="btn btn--primary auth-form__submit">Login</button>

        <div class="auth-divider"><span>OR</span></div>

        <button type="button" class="btn btn--google">
          <img src="${googleIcon}" alt="Google" width="16" height="16" />
          Continue with Google
        </button>

        <p class="auth-form__switch">
          Don't have an account? <button type="button" data-switch="register">Register</button>
        </p>
      </form>

      <form class="auth-form" data-panel="register" novalidate hidden>
        <h2>Create Account</h2>
        <p class="auth-form__lead">Join MiniGames to track your score &amp; streak.</p>

        <label class="auth-field">
          <span>Username</span>
          <span class="auth-field__control">
            <img src="${personIcon}" alt="Username" width="16" height="16" />
            <input type="text" name="username" placeholder="e.g. CozyGamer_99" autocomplete="username" aria-describedby="register-username-error" required />
          </span>
          <span class="auth-field__error" id="register-username-error" data-error-for="username" role="alert" hidden></span>
        </label>

        <label class="auth-field">
          <span>Email Address</span>
          <span class="auth-field__control">
            <img src="${mailIcon}" alt="Email" width="16" height="16" />
            <input type="email" name="email" placeholder="your.email@domain.com" autocomplete="email" aria-describedby="register-email-error" required />
          </span>
          <span class="auth-field__error" id="register-email-error" data-error-for="email" role="alert" hidden></span>
        </label>

        <label class="auth-field">
          <span>Password</span>
          <span class="auth-field__control">
            <img src="${passwordIcon}" alt="Password" width="16" height="16" />
            <input type="password" name="password" placeholder="Min. 6 characters" autocomplete="new-password" aria-describedby="register-password-error" required />
          </span>
          <span class="auth-field__error" id="register-password-error" data-error-for="password" role="alert" hidden></span>
        </label>

        <label class="auth-field">
          <span>Confirm Password</span>
          <span class="auth-field__control">
            <img src="${passwordIcon}" alt="Confirm password" width="16" height="16" />
            <input type="password" name="confirmPassword" placeholder="Min. 6 characters" autocomplete="new-password" aria-describedby="register-confirm-error" required />
          </span>
          <span class="auth-field__error" id="register-confirm-error" data-error-for="confirmPassword" role="alert" hidden></span>
        </label>

        <button type="submit" class="btn btn--primary auth-form__submit">Create Account</button>

        <div class="auth-divider"><span>OR</span></div>

        <button type="button" class="btn btn--google">
          <img src="${googleIcon}" alt="Google" width="16" height="16" />
          Sign up with Google
        </button>

        <p class="auth-form__switch">
          Already have an account? <button type="button" data-switch="login">Login</button>
        </p>
      </form>
    </div>
  `;

  const tabs = dialog.querySelectorAll<HTMLButtonElement>('.auth-tabs__btn');
  const panels = dialog.querySelectorAll<HTMLFormElement>('.auth-form');
  const controllers = new Map<AuthMode, AuthFormController>();
  panels.forEach((panel) => {
    const mode: AuthMode = panel.dataset.panel === 'register' ? 'register' : 'login';
    controllers.set(mode, bindAuthForm(panel, mode));
  });
  let activeMode: AuthMode | null = null;

  function activate(tabName: string): void {
    const mode: AuthMode = tabName === 'register' ? 'register' : 'login';
    if (mode !== activeMode) {
      controllers.forEach((controller) => controller.reset());
      activeMode = mode;
    }

    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === tabName;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === tabName;
      panel.hidden = !isActive;
      panel.setAttribute('aria-hidden', String(!isActive));
    });
  }

  function selectTab(tabName: string): void {
    activate(tabName);
    dialog.dispatchEvent(new CustomEvent('auth:tab-change', { detail: tabName }));
  }

  activate('login');

  dialog.addEventListener('auth:switch', (event) => {
    const tabName = (event as CustomEvent<string>).detail;
    if (tabName === 'login' || tabName === 'register') activate(tabName);
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => selectTab(tab.dataset.tab!));
  });

  dialog.querySelectorAll<HTMLButtonElement>('[data-switch]').forEach((btn) => {
    btn.addEventListener('click', () => selectTab(btn.dataset.switch!));
  });

  dialog.querySelectorAll<HTMLButtonElement>('.auth-field__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling as HTMLInputElement;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  const closeButton = dialog.querySelector<HTMLButtonElement>('.auth-dialog__close')!;
  let pending = false;

  function setPending(value: boolean): void {
    pending = value;
    dialog.setAttribute('aria-busy', String(value));
    controllers.forEach((controller) => controller.setDisabled(value));
    tabs.forEach((tab) => {
      tab.disabled = value;
    });
    closeButton.disabled = value;
  }

  async function runAuth(
    trigger: HTMLButtonElement,
    action: () => Promise<AuthProfile>
  ): Promise<void> {
    if (pending) return;

    setPending(true);
    trigger.classList.add('is-loading');

    try {
      startSession(await action());
      controllers.forEach((controller) => controller.reset());
      showSnackbar('You are signed in.', 'success');
      dialog.close();
    } catch (error) {
      if (error instanceof AuthCancelledError) {
        showSnackbar('Sign-in was cancelled.', 'info');
      } else {
        showSnackbar(getAuthErrorMessage(error), 'error');
      }
    } finally {
      trigger.classList.remove('is-loading');
      setPending(false);
    }
  }

  panels.forEach((panel) => {
    const mode: AuthMode = panel.dataset.panel === 'register' ? 'register' : 'login';

    panel.addEventListener('submit', (event) => {
      event.preventDefault();

      const controller = controllers.get(mode);
      const submit = panel.querySelector<HTMLButtonElement>('.auth-form__submit');
      if (!controller || !submit || !controller.isValid()) return;

      const values = controller.getValues();
      const email = values.email.trim();

      void runAuth(submit, () =>
        mode === 'login'
          ? loginWithEmail(email, values.password)
          : registerWithEmail(values.username, email, values.password)
      );
    });
  });

  dialog.querySelectorAll<HTMLButtonElement>('.btn--google').forEach((button) => {
    button.addEventListener('click', () => {
      void runAuth(button, loginWithGoogle);
    });
  });

  closeButton.addEventListener('click', () => {
    if (!pending) dialog.close();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog && !pending) dialog.close();
  });

  // Escape: block both the keydown and the cancel event. Chrome can close a dialog on a repeated
  // Escape if only `cancel` is prevented.
  dialog.addEventListener('keydown', (event) => {
    if (pending && event.key === 'Escape') event.preventDefault();
  });
  dialog.addEventListener('cancel', (event) => {
    if (pending) event.preventDefault();
  });

  return dialog;
}
