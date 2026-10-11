import { describe, expect, it, vi } from 'vitest';
import { showSnackbar } from './snackbar';

describe('snackbar notifications', () => {
  it('announces variants, dismisses manually, and expires automatically', () => {
    vi.useFakeTimers();
    showSnackbar('Saved successfully', 'success', 1000);
    const region = document.querySelector<HTMLElement>('.snackbar-region');
    const notice = region?.querySelector<HTMLElement>('.snackbar');

    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.dataset.popoverOpen).toBe('true');
    expect(notice?.getAttribute('role')).toBe('status');
    expect(notice?.classList.contains('snackbar--success')).toBe(true);
    expect(notice?.textContent).toContain('Saved successfully');

    notice?.querySelector<HTMLButtonElement>('.snackbar__close')?.click();
    expect(region?.childElementCount).toBe(0);
    expect(region?.dataset.popoverOpen).toBeUndefined();

    showSnackbar('Network request failed', 'error', 500);
    expect(document.querySelector('.snackbar--error')?.getAttribute('role')).toBe('alert');
    vi.advanceTimersByTime(500);
    expect(document.querySelector('.snackbar')).toBeNull();
    expect(
      document.querySelector<HTMLElement>('.snackbar-region')?.dataset.popoverOpen
    ).toBeUndefined();
  });
});
