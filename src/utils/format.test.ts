import { describe, expect, it } from 'vitest';
import { formatCount } from './format';

describe('formatCount', () => {
  it('leaves counts under one thousand unchanged', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(999)).toBe('999');
    expect(formatCount(-2)).toBe('-2');
  });

  it('formats thousands to one decimal place without a trailing zero', () => {
    expect(formatCount(1000)).toBe('1K');
    expect(formatCount(1250)).toBe('1.3K');
    expect(formatCount(10000)).toBe('10K');
  });
});
