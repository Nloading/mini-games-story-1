import { createProfileView } from '@/features/achievements/profile-view';
import type { AppSession } from '@/auth/session';

export function createProfilePage(session: AppSession): HTMLElement {
  const page = document.createElement('main');
  page.className = 'profile-page';
  page.setAttribute('aria-label', 'Profile page');
  page.append(createProfileView(session));

  return page;
}
