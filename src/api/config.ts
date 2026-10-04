export const API_ORIGIN = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com';
export const API_BASE_URL = `${API_ORIGIN}/api`;

export const LIBRARY_PAGE_SIZE = 6;
export const COMMENTS_LIMIT = 3;

export function resolveAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
