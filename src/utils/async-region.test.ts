import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/http';
import { loadIntoRegion } from './async-region';

function node(text: string): HTMLElement {
  const element = document.createElement('div');
  element.textContent = text;
  return element;
}

function options(target: HTMLElement, load: (signal: AbortSignal) => Promise<string[]>) {
  return {
    target,
    load,
    renderSkeleton: () => node('loading'),
    isEmpty: (items: string[]) => items.length === 0,
    renderEmpty: () => node('empty'),
    renderContent: (items: string[]) => node(items.join(',')),
  };
}

describe('loadIntoRegion', () => {
  it('renders a skeleton, then content or empty state, and clears busy state', async () => {
    const target = document.createElement('section');
    await loadIntoRegion(options(target, async () => ['one', 'two']));
    expect(target.textContent).toBe('one,two');
    expect(target.hasAttribute('aria-busy')).toBe(false);

    await loadIntoRegion(options(target, async () => []));
    expect(target.textContent).toBe('empty');
    expect(target.hasAttribute('aria-busy')).toBe(false);
  });

  it('aborts a superseded request and keeps only the newer result', async () => {
    const target = document.createElement('section');
    let finishFirst: ((items: string[]) => void) | undefined;
    let firstSignal: AbortSignal | undefined;
    const first = loadIntoRegion(
      options(target, (signal) => {
        firstSignal = signal;
        return new Promise<string[]>((resolve) => {
          finishFirst = resolve;
        });
      })
    );

    await loadIntoRegion(options(target, async () => ['new']));
    finishFirst?.(['stale']);
    await first;

    expect(firstSignal?.aborted).toBe(true);
    expect(target.textContent).toBe('new');
    expect(target.hasAttribute('aria-busy')).toBe(false);
  });

  it('renders an error banner, announces the failure, and retries on demand', async () => {
    const target = document.createElement('section');
    const load = vi
      .fn<() => Promise<string[]>>()
      .mockRejectedValueOnce(new ApiError('Could not load', 503))
      .mockResolvedValueOnce(['recovered']);

    await loadIntoRegion(options(target, load));
    expect(target.querySelector('[role="alert"]')?.textContent).toContain('Could not load');
    expect(document.querySelector('.snackbar--error')?.textContent).toContain('Could not load');
    expect(target.hasAttribute('aria-busy')).toBe(false);

    target.querySelector('button')?.click();
    await vi.waitFor(() => expect(target.textContent).toBe('recovered'));
    expect(load).toHaveBeenCalledTimes(2);
  });
});
