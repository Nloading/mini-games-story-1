import './auth-dialog.scss';
import logoImage from '../../assets/images/logo.png';

export function createAuthDialog(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'auth-dialog';
  dialog.innerHTML = `
    <div class="auth-dialog__panel">
      <img class="auth-dialog__logo" src="${logoImage}" alt="MiniGames" />
      <button type="button" class="auth-dialog__close" aria-label="Close dialog">
        <img src="" alt="" width="16" height="16" />
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
            <img src="" alt="" width="16" height="16" />
            <input type="email" name="email" placeholder="e.g. alex@minigames.com" autocomplete="email" required />
          </span>
        </label>

        <label class="auth-field">
          <span>Password</span>
          <span class="auth-field__control">
            <img src="" alt="" width="16" height="16" />
            <input type="password" name="password" placeholder="••••••••" autocomplete="current-password" required />
            <button type="button" class="auth-field__toggle" aria-label="Show password">
              <img src="" alt="" width="16" height="16" />
            </button>
          </span>
        </label>

        <a href="#" class="auth-form__forgot">Forgot Password?</a>

        <button type="submit" class="btn btn--primary auth-form__submit">Login</button>

        <div class="auth-divider"><span>OR</span></div>

        <button type="button" class="btn btn--google">
          <img src="" alt="" width="16" height="16" />
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
            <img src="" alt="" width="16" height="16" />
            <input type="text" name="username" placeholder="e.g. CozyGamer_99" autocomplete="username" required />
          </span>
        </label>

        <label class="auth-field">
          <span>Email Address</span>
          <span class="auth-field__control">
            <img src="" alt="" width="16" height="16" />
            <input type="email" name="email" placeholder="your.email@domain.com" autocomplete="email" required />
          </span>
        </label>

        <label class="auth-field">
          <span>Password</span>
          <span class="auth-field__control">
            <img src="" alt="" width="16" height="16" />
            <input type="password" name="password" placeholder="Min. 8 characters" autocomplete="new-password" minlength="8" required />
            <button type="button" class="auth-field__toggle" aria-label="Show password">
              <img src="" alt="" width="16" height="16" />
            </button>
          </span>
        </label>

        <label class="auth-field">
          <span>Confirm Password</span>
          <span class="auth-field__control">
            <img src="" alt="" width="16" height="16" />
            <input type="password" name="confirmPassword" placeholder="Repeat your password" autocomplete="new-password" minlength="8" required />
          </span>
        </label>

        <button type="submit" class="btn btn--primary auth-form__submit">Create Account</button>

        <div class="auth-divider"><span>OR</span></div>

        <button type="button" class="btn btn--google">
          <img src="" alt="" width="16" height="16" />
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

  function activate(tabName: string): void {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === tabName;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== tabName;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab.dataset.tab!));
  });

  dialog.querySelectorAll<HTMLButtonElement>('[data-switch]').forEach((btn) => {
    btn.addEventListener('click', () => activate(btn.dataset.switch!));
  });

  dialog.querySelectorAll<HTMLButtonElement>('.auth-field__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling as HTMLInputElement;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  dialog.querySelector('.auth-dialog__close')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  return dialog;
}
