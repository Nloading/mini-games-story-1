import './profile.scss';
import personIcon from '../../assets/images/person.png';
import { getInitials, getProfileName, getSafeAvatarUrl } from '@/auth/profile';
import type { AppSession } from '@/auth/session';

export type ProfileVariant = 'header' | 'mobile';

const ICON_SIZE = 16;

function createFallback(name: string): HTMLElement {
  const initials = getInitials(name);

  if (initials !== null) {
    const letters = document.createElement('span');
    letters.textContent = initials;

    return letters;
  }

  const icon = document.createElement('img');
  icon.className = 'profile__icon';
  icon.src = personIcon;
  icon.alt = '';
  icon.width = ICON_SIZE;
  icon.height = ICON_SIZE;

  return icon;
}

function createAvatar(session: AppSession, name: string): HTMLElement {
  const avatar = document.createElement('span');
  avatar.className = 'profile__avatar';
  avatar.setAttribute('aria-hidden', 'true');

  const url = getSafeAvatarUrl(session.avatarUrl);
  if (url === null) {
    avatar.append(createFallback(name));

    return avatar;
  }

  const photo = document.createElement('img');
  photo.className = 'profile__photo';
  photo.alt = '';
  photo.referrerPolicy = 'no-referrer';
  photo.addEventListener('error', () => avatar.replaceChildren(createFallback(name)));
  photo.src = url;
  avatar.append(photo);

  return avatar;
}

export function createProfile(session: AppSession, variant: ProfileVariant): HTMLElement {
  const name = getProfileName(session);

  const root = document.createElement('div');
  root.className = `profile profile--${variant}`;

  const label = document.createElement('span');
  label.className = 'profile__name';
  label.textContent = name;

  const logoutButton = document.createElement('button');
  logoutButton.type = 'button';
  logoutButton.className = 'profile__logout';
  logoutButton.dataset.action = 'logout';
  logoutButton.textContent = 'Logout';

  root.append(createAvatar(session, name), label, logoutButton);

  return root;
}
