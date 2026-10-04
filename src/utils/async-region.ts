import { getErrorMessage, isAbortError } from '@/api/http';
import { createErrorBanner } from '@/components/feedback/feedback';
import { showSnackbar } from '@/components/snackbar/snackbar';

interface AsyncRegionOptions<T> {
  target: HTMLElement;
  load: (signal: AbortSignal) => Promise<T>;
  renderSkeleton: () => Node;
  isEmpty: (data: T) => boolean;
  renderEmpty: (data: T) => Node;
  renderContent: (data: T) => Node;
}

const controllers = new WeakMap<HTMLElement, AbortController>();

export async function loadIntoRegion<T>(options: AsyncRegionOptions<T>): Promise<void> {
  const { target, load, renderSkeleton, isEmpty, renderEmpty, renderContent } = options;

  controllers.get(target)?.abort();
  const controller = new AbortController();
  controllers.set(target, controller);

  target.setAttribute('aria-busy', 'true');
  target.replaceChildren(renderSkeleton());

  try {
    const data = await load(controller.signal);

    if (controller.signal.aborted) {
      return;
    }

    target.replaceChildren(isEmpty(data) ? renderEmpty(data) : renderContent(data));
  } catch (error) {
    if (isAbortError(error) || controller.signal.aborted) {
      return;
    }

    const message = getErrorMessage(error);
    target.replaceChildren(
      createErrorBanner(message, () => {
        void loadIntoRegion(options);
      })
    );
    showSnackbar(message, 'error');
  } finally {
    if (!controller.signal.aborted) {
      target.removeAttribute('aria-busy');
    }
  }
}
