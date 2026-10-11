import { describe, expect, it } from 'vitest';
import {
  API_BASE_URL,
  API_ORIGIN,
  COMMENTS_LIMIT,
  LIBRARY_PAGE_SIZE,
  resolveAssetUrl,
} from './config';

describe('API configuration', () => {
  it('exposes the API origin and base URL', () => {
    expect(API_ORIGIN).toBe('https://faxb76kxra.execute-api.eu-central-1.amazonaws.com');
    expect(API_BASE_URL).toBe(`${API_ORIGIN}/api`);
  });

  it('uses the configured app base for relative asset paths', () => {
    expect(resolveAssetUrl('/images/game.png')).toBe('/mini-games-story-1/images/game.png');
    expect(resolveAssetUrl('images/game.png')).toBe('/mini-games-story-1/images/game.png');
    expect(resolveAssetUrl('https://cdn.example/game.png')).toBe('https://cdn.example/game.png');
    expect(resolveAssetUrl('http://cdn.example/game.png')).toBe('http://cdn.example/game.png');
  });

  it('exports the page-size limits used by the API', () => {
    expect(LIBRARY_PAGE_SIZE).toBe(6);
    expect(COMMENTS_LIMIT).toBe(3);
  });
});
