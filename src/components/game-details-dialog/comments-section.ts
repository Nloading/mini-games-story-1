import { fetchGameComments } from '@/api/endpoints';
import type { GameCommentsResponse } from '@/api/types';
import { getSession } from '@/auth/session-store';
import { createEmptyState, createSkeleton } from '@/components/feedback/feedback';
import { loadIntoRegion } from '@/utils/async-region';
import { createAvatarPicker } from '@/utils/avatar';
import { createCommentForm } from './comment-form';
import { createCommentItem } from './comment-item';

const SKELETON_COMMENTS = 3;

function createCommentsSkeleton(): HTMLElement {
  const list = document.createElement('div');
  list.className = 'comments__list';
  list.setAttribute('aria-hidden', 'true');
  list.append(...Array.from({ length: SKELETON_COMMENTS }, () => createSkeleton('line')));

  return list;
}

export function createCommentsSection(slug: string): HTMLElement {
  const section = document.createElement('section');
  section.className = 'comments';

  const heading = document.createElement('h3');
  heading.textContent = 'Comments';

  const region = document.createElement('div');
  // One picker per mounted section keeps each commenter's color stable across refreshes.
  const pickAvatarVariant = createAvatarPicker();

  function setCount(total: number): void {
    heading.textContent = `Comments (${total})`;
  }

  function reload(): void {
    void loadIntoRegion<GameCommentsResponse>({
      target: region,
      load: (signal) => fetchGameComments(slug, getSession()?.email, signal),
      renderSkeleton: createCommentsSkeleton,
      isEmpty: (response) => response.data.length === 0,
      renderEmpty: (response) => {
        setCount(response.meta.totalComments);

        return createEmptyState('No comments yet');
      },
      renderContent: (response) => {
        setCount(response.meta.totalComments);

        const list = document.createElement('ul');
        list.className = 'comments__list';
        list.append(
          ...response.data.map((comment) =>
            createCommentItem(comment, pickAvatarVariant(comment.authorName))
          )
        );

        return list;
      },
    });
  }

  section.append(heading, createCommentForm(slug, reload), region);
  reload();

  return section;
}
