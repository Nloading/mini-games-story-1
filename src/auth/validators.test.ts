import { describe, expect, it } from 'vitest';
import {
  FIELDS_BY_MODE,
  validateConfirmPassword,
  validateEmail,
  validateField,
  validateForm,
  validateLoginPassword,
  validateRegisterPassword,
  validateUsername,
} from './validators';
import type { AuthValues } from './validators';

const validValues: AuthValues = {
  username: 'Player1',
  email: 'player@example.com',
  password: 'Strong1!',
  confirmPassword: 'Strong1!',
};

describe('validateEmail', () => {
  it('requires an email and trims surrounding whitespace', () => {
    expect(validateEmail('  ')).toBe('Email is required.');
    expect(validateEmail(' player@example.com ')).toBeNull();
  });

  it.each([
    'missing-at.example.com',
    'player@',
    'player@example',
    'player@example.c',
    'player name@example.com',
    'player@example..com',
  ])('rejects invalid email %s', (email) => {
    expect(validateEmail(email)).toBe('Enter a valid email address.');
  });
});

describe('validateUsername', () => {
  it('requires a username within the inclusive length limits', () => {
    expect(validateUsername('')).toBe('Username is required.');
    expect(validateUsername('A')).toBe('Username must be 2-30 characters long.');
    expect(validateUsername('A'.repeat(31))).toBe('Username must be 2-30 characters long.');
    expect(validateUsername('Ab')).toBeNull();
    expect(validateUsername('A'.repeat(30))).toBeNull();
  });

  it('requires an uppercase English first letter and only English letters and digits', () => {
    expect(validateUsername('ab')).toBe('Username must start with an uppercase English letter.');
    expect(validateUsername('Éa')).toBe('Username must start with an uppercase English letter.');
    expect(validateUsername('Ab_')).toBe('Username may contain only English letters and digits.');
    expect(validateUsername('A二')).toBe('Username may contain only English letters and digits.');
    expect(validateUsername('A1b2')).toBeNull();
  });
});

describe('password validators', () => {
  it('validates login passwords by presence and minimum length only', () => {
    expect(validateLoginPassword('')).toBe('Password is required.');
    expect(validateLoginPassword('12345')).toBe('Password must be at least 6 characters long.');
    expect(validateLoginPassword('      ')).toBeNull();
    expect(validateLoginPassword('abcdef')).toBeNull();
  });

  it('validates registration password requirements in order', () => {
    expect(validateRegisterPassword('')).toBe('Password is required.');
    expect(validateRegisterPassword('a1!')).toBe('Password must be at least 6 characters long.');
    expect(validateRegisterPassword('abc def')).toBe(
      'Use only English letters, digits and special characters (no spaces).'
    );
    expect(validateRegisterPassword('abcdef1!')).toBe(
      'Password needs an uppercase English letter.'
    );
    expect(validateRegisterPassword('Abcdef!')).toBe('Password needs a digit.');
    expect(validateRegisterPassword('Abcdef1')).toBe('Password needs a special character.');
    expect(validateRegisterPassword('Abcdef1!')).toBeNull();
    expect(validateRegisterPassword('Äbcdef1!')).toBe(
      'Use only English letters, digits and special characters (no spaces).'
    );
  });

  it('requires a confirmation and matches it exactly', () => {
    expect(validateConfirmPassword('', 'secret')).toBe('Please confirm your password.');
    expect(validateConfirmPassword('Secret', 'secret')).toBe('Passwords do not match.');
    expect(validateConfirmPassword('secret', 'secret')).toBeNull();
  });
});

describe('form validation', () => {
  it('defines the fields checked for each mode', () => {
    expect(FIELDS_BY_MODE.login).toEqual(['email', 'password']);
    expect(FIELDS_BY_MODE.register).toEqual(['username', 'email', 'password', 'confirmPassword']);
  });

  it('validates a field using the selected mode', () => {
    expect(validateField('login', 'password', { ...validValues, password: 'short' })).toBe(
      'Password must be at least 6 characters long.'
    );
    expect(validateField('register', 'password', { ...validValues, password: 'abcdef' })).toBe(
      'Password needs an uppercase English letter.'
    );
    expect(
      validateField('register', 'confirmPassword', {
        ...validValues,
        confirmPassword: 'different',
      })
    ).toBe('Passwords do not match.');
  });

  it('returns no errors for valid forms and reports all applicable fields for invalid forms', () => {
    expect(validateForm('login', validValues)).toEqual({});
    expect(validateForm('register', validValues)).toEqual({});
    expect(validateForm('login', { ...validValues, email: 'bad', password: '' })).toEqual({
      email: 'Enter a valid email address.',
      password: 'Password is required.',
    });
    expect(
      validateForm('register', {
        username: 'a',
        email: '',
        password: 'invalid',
        confirmPassword: '',
      })
    ).toEqual({
      username: 'Username must be 2-30 characters long.',
      email: 'Email is required.',
      password: 'Password needs an uppercase English letter.',
      confirmPassword: 'Please confirm your password.',
    });
  });
});
