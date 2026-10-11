export const COMMENT_MAX_LENGTH = 500;

export function validateCommentText(text: string): string | null {
  const trimmed = text.trim();

  if (trimmed === '') return 'Write a comment before sending.';
  if (trimmed.length > COMMENT_MAX_LENGTH) {
    return `Comments can be at most ${COMMENT_MAX_LENGTH} characters.`;
  }

  return null;
}
