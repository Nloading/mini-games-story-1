import { describe, expect, it, vi } from 'vitest';
import { AVATAR_VARIANT_COUNT, createAvatarPicker, getAvatarInitial } from './avatar';

describe('avatar utilities', () => {
  it('assigns stable variants per commenter and chooses within the supported range', () => {
    const random = vi.fn<() => number>().mockReturnValueOnce(0).mockReturnValueOnce(0.999);
    const pick = createAvatarPicker(random);

    expect(pick('first')).toBe(1);
    expect(pick('first')).toBe(1);
    expect(pick('second')).toBe(AVATAR_VARIANT_COUNT);
    expect(random).toHaveBeenCalledTimes(2);
  });

  it('returns a trimmed uppercase initial, including Unicode characters', () => {
    expect(getAvatarInitial('  alice  ')).toBe('A');
    expect(getAvatarInitial(' ßeta')).toBe('SS');
    expect(getAvatarInitial('   ')).toBe('?');
  });
});
