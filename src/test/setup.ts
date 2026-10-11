import { afterEach, vi } from 'vitest';

if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function showModal(): void {
    this.setAttribute('open', '');
  };

  HTMLDialogElement.prototype.close = function close(): void {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.showPopover = function showPopover(): void {
    this.dataset.popoverOpen = 'true';
  };

  HTMLElement.prototype.hidePopover = function hidePopover(): void {
    delete this.dataset.popoverOpen;
  };

  const nativeMatches = HTMLElement.prototype.matches;
  HTMLElement.prototype.matches = function matches(selector: string): boolean {
    if (selector === ':popover-open') return this.dataset.popoverOpen === 'true';
    return nativeMatches.call(this, selector);
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  localStorage.clear();
  document.body.replaceChildren();
});
