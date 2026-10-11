import { describe, expect, it } from 'vitest';
import { COMMENT_MAX_LENGTH, validateCommentText } from './comment-validation';

describe('comment validation', () => {
  it('requires non-whitespace text and allows surrounding whitespace', () => {
    expect(validateCommentText(' \n\t ')).toBe('Write a comment before sending.');
    expect(validateCommentText('  hello  ')).toBeNull();
  });

  it('accepts exactly the maximum length and rejects longer trimmed text', () => {
    expect(validateCommentText('x'.repeat(COMMENT_MAX_LENGTH))).toBeNull();
    expect(validateCommentText('x'.repeat(COMMENT_MAX_LENGTH + 1))).toBe(
      `Comments can be at most ${COMMENT_MAX_LENGTH} characters.`
    );
    expect(validateCommentText(` ${'x'.repeat(COMMENT_MAX_LENGTH)} `)).toBeNull();
  });
});
