import { FIELDS_BY_MODE, validateForm } from '@/auth/validators';
import type { AuthField, AuthValues } from '@/auth/validators';
import type { AuthMode } from '@/router/url-state';

export interface AuthFormController {
  reset: () => void;
  setDisabled: (disabled: boolean) => void;
  getValues: () => AuthValues;
  isValid: () => boolean;
}

export function bindAuthForm(form: HTMLFormElement, mode: AuthMode): AuthFormController {
  const fields = FIELDS_BY_MODE[mode];
  const submit = form.querySelector<HTMLButtonElement>('.auth-form__submit')!;
  const touched = new Set<AuthField>();
  let locked = false;

  function getInput(field: AuthField): HTMLInputElement | null {
    return form.querySelector<HTMLInputElement>(`input[name="${field}"]`);
  }

  function getValues(): AuthValues {
    return {
      username: getInput('username')?.value ?? '',
      email: getInput('email')?.value ?? '',
      password: getInput('password')?.value ?? '',
      confirmPassword: getInput('confirmPassword')?.value ?? '',
    };
  }

  function showError(field: AuthField, message: string): void {
    const output = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
    if (output) {
      output.textContent = message;
      output.hidden = message === '';
    }
    getInput(field)?.setAttribute('aria-invalid', String(message !== ''));
  }

  function render(): void {
    const errors = validateForm(mode, getValues());

    fields.forEach((field) => showError(field, touched.has(field) ? errors[field] ?? '' : ''));
    submit.disabled = locked || Object.keys(errors).length > 0;
  }

  function onFieldEvent(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    const field = fields.find((name) => name === target.name);
    if (field === undefined) return;

    touched.add(field);
    // Confirm must be rechecked whenever the password changes.
    if (field === 'password' && getValues().confirmPassword !== '') {
      touched.add('confirmPassword');
    }
    render();
  }

  form.addEventListener('input', onFieldEvent);
  form.addEventListener('change', onFieldEvent);
  form.addEventListener('focusout', onFieldEvent);

  render();

  return {
    getValues,
    isValid: () => Object.keys(validateForm(mode, getValues())).length === 0,
    reset: () => {
      form.reset();
      touched.clear();
      form.querySelectorAll<HTMLInputElement>('input[name$="assword"]').forEach((input) => {
        input.type = 'password';
      });
      render();
    },
    setDisabled: (disabled) => {
      locked = disabled;
      form
        .querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button')
        .forEach((element) => {
          element.disabled = disabled;
        });
      render();
    },
  };
}
