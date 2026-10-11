import { describe, expect, it } from 'vitest';
import {
  FALLBACK_NAME,
  getCommentAuthorName,
  getInitials,
  getProfileName,
  getSafeAvatarUrl,
} from './profile';

describe('getProfileName', () => {
  it('prefers a trimmed display name, then the trimmed email local part, then a fallback', () => {
    expect(getProfileName({ displayName: '  Player One ', email: 'p@example.com' })).toBe(
      'Player One'
    );
    expect(getProfileName({ displayName: ' ', email: ' player@example.com' })).toBe('player');
    expect(getProfileName({ displayName: '', email: '@example.com' })).toBe(FALLBACK_NAME);
  });
});

describe('getInitials', () => {
  it('uses the first alphanumeric character from at most the first two words', () => {
    expect(getInitials('  player one gamer  ')).toBe('PO');
    expect(getInitials('...alpha #beta')).toBe('AB');
    expect(getInitials('Élodie 二郎')).toBe('É二');
    expect(getInitials('single')).toBe('S');
  });

  it('returns null when there are no alphanumeric characters', () => {
    expect(getInitials(' ... !!! ')).toBeNull();
    expect(getInitials('   ')).toBeNull();
  });
});

describe('getSafeAvatarUrl', () => {
  it('allows only HTTP and HTTPS URL prefixes', () => {
    expect(getSafeAvatarUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
    expect(getSafeAvatarUrl('HTTP://example.com/a.png')).toBe('HTTP://example.com/a.png');
    expect(getSafeAvatarUrl(undefined)).toBeNull();
    expect(getSafeAvatarUrl('')).toBeNull();
    expect(getSafeAvatarUrl('//example.com/a.png')).toBeNull();
    expect(getSafeAvatarUrl('javascript:alert(1)')).toBeNull();
  });
});

describe('getCommentAuthorName', () => {
  it('prefers a normalized display name and caps it at 30 Unicode characters', () => {
    expect(getCommentAuthorName({ displayName: '  Player One  ', email: 'p@example.com' })).toBe(
      'Player One'
    );
    expect(getCommentAuthorName({ displayName: 'x'.repeat(35), email: 'p@example.com' })).toBe(
      'x'.repeat(30)
    );
    expect(getCommentAuthorName({ displayName: '界'.repeat(31), email: 'p@example.com' })).toBe(
      '界'.repeat(30)
    );
  });

  it('falls back to a valid email local part and then a generic name', () => {
    expect(getCommentAuthorName({ displayName: 'x', email: 'username@example.com' })).toBe(
      'username'
    );
    expect(getCommentAuthorName({ displayName: 'x', email: 'ab@example.com' })).toBe('ab');
    expect(getCommentAuthorName({ displayName: '', email: '@example.com' })).toBe(FALLBACK_NAME);
  });
});
