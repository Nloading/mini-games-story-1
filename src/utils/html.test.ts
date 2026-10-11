import { describe, expect, it } from 'vitest';
import { escapeHtml } from './html';

describe('escapeHtml', () => {
  it('escapes markup and quote characters while preserving ordinary text', () => {
    expect(escapeHtml(`<tag attr="it's">&`)).toBe('&lt;tag attr=&quot;it&#39;s&quot;&gt;&amp;');
    expect(escapeHtml('plain text')).toBe('plain text');
  });
});
