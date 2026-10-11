import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from './relative-time';

describe('formatRelativeTime', () => {
  const now = Date.parse('2025-01-31T12:00:00Z');

  it('handles invalid, current, and future timestamps', () => {
    expect(formatRelativeTime('not a date', now)).toBe('');
    expect(formatRelativeTime('2025-01-31T11:59:30Z', now)).toBe('just now');
    expect(formatRelativeTime('2025-01-31T13:00:00Z', now)).toBe('just now');
  });

  it('formats elapsed minutes, hours, and days with singular and plural units', () => {
    expect(formatRelativeTime('2025-01-31T11:00:00Z', now)).toBe('1 hour ago');
    expect(formatRelativeTime('2025-01-31T10:00:00Z', now)).toBe('2 hours ago');
    expect(formatRelativeTime('2025-01-30T12:00:00Z', now)).toBe('1 day ago');
    expect(formatRelativeTime('2025-01-28T12:00:00Z', now)).toBe('3 days ago');
  });

  it('uses bounded weeks and months, then counts years', () => {
    expect(formatRelativeTime('2025-01-10T12:00:00Z', now)).toBe('3 weeks ago');
    expect(formatRelativeTime('2024-12-01T12:00:00Z', now)).toBe('2 months ago');
    expect(formatRelativeTime('2023-01-31T12:00:00Z', now)).toBe('2 years ago');
  });
});
