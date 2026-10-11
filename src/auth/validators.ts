import type { AuthMode } from '@/router/url-state';

export type AuthField = 'username' | 'email' | 'password' | 'confirmPassword';
export type AuthValues = Record<AuthField, string>;
export type AuthErrors = Partial<Record<AuthField, string>>;

export const FIELDS_BY_MODE: Record<AuthMode, readonly AuthField[]> = {
  login: ['email', 'password'],
  register: ['username', 'email', 'password', 'confirmPassword'],
};

const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 30;
const PASSWORD_MIN_LENGTH = 6;

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const USERNAME_START_PATTERN = /^[A-Z]/;
const USERNAME_CHARS_PATTERN = /^[A-Za-z0-9]+$/;
const PASSWORD_ALLOWED_PATTERN = /^[\x21-\x7E]+$/;
const UPPERCASE_PATTERN = /[A-Z]/;
const DIGIT_PATTERN = /[0-9]/;
const SPECIAL_PATTERN = /[^A-Za-z0-9]/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (email === '') return 'Email is required.';

  return EMAIL_PATTERN.test(email) ? null : 'Enter a valid email address.';
}

export function validateUsername(value: string): string | null {
  if (value === '') return 'Username is required.';
  if (value.length < USERNAME_MIN_LENGTH || value.length > USERNAME_MAX_LENGTH) {
    return `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters long.`;
  }
  if (!USERNAME_START_PATTERN.test(value)) {
    return 'Username must start with an uppercase English letter.';
  }
  if (!USERNAME_CHARS_PATTERN.test(value)) {
    return 'Username may contain only English letters and digits.';
  }

  return null;
}

export function validateLoginPassword(value: string): string | null {
  if (value === '') return 'Password is required.';

  return value.length < PASSWORD_MIN_LENGTH
    ? `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`
    : null;
}

export function validateRegisterPassword(value: string): string | null {
  const lengthError = validateLoginPassword(value);
  if (lengthError !== null) return lengthError;

  if (!PASSWORD_ALLOWED_PATTERN.test(value)) {
    return 'Use only English letters, digits and special characters (no spaces).';
  }
  if (!UPPERCASE_PATTERN.test(value)) return 'Password needs an uppercase English letter.';
  if (!DIGIT_PATTERN.test(value)) return 'Password needs a digit.';
  if (!SPECIAL_PATTERN.test(value)) return 'Password needs a special character.';

  return null;
}

export function validateConfirmPassword(value: string, password: string): string | null {
  if (value === '') return 'Please confirm your password.';

  return value === password ? null : 'Passwords do not match.';
}

export function validateField(mode: AuthMode, field: AuthField, values: AuthValues): string | null {
  switch (field) {
    case 'username':
      return validateUsername(values.username);
    case 'email':
      return validateEmail(values.email);
    case 'password':
      return mode === 'login'
        ? validateLoginPassword(values.password)
        : validateRegisterPassword(values.password);
    case 'confirmPassword':
      return validateConfirmPassword(values.confirmPassword, values.password);
  }
}

export function validateForm(mode: AuthMode, values: AuthValues): AuthErrors {
  const errors: AuthErrors = {};

  FIELDS_BY_MODE[mode].forEach((field) => {
    const message = validateField(mode, field, values);
    if (message !== null) errors[field] = message;
  });

  return errors;
}
