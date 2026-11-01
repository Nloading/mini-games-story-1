import { describe, expect, it, vi } from 'vitest';
import { bus } from './events';

describe('event bus', () => {
  it('delivers the payload to every listener of an event', () => {
    const first = vi.fn();
    const second = vi.fn();
    const offFirst = bus.on('game:opened', first);
    const offSecond = bus.on('game:opened', second);

    bus.emit('game:opened', { gameSlug: 'tetris' });

    expect(first).toHaveBeenCalledWith({ gameSlug: 'tetris' });
    expect(second).toHaveBeenCalledWith({ gameSlug: 'tetris' });
    offFirst();
    offSecond();
  });

  it('does not call listeners of other events', () => {
    const listener = vi.fn();
    const off = bus.on('comment:posted', listener);

    bus.emit('game:opened', { gameSlug: 'tetris' });

    expect(listener).not.toHaveBeenCalled();
    off();
  });

  it('stops delivering after unsubscribe', () => {
    const listener = vi.fn();
    const off = bus.on('favorite:added', listener);

    off();
    bus.emit('favorite:added', { gameSlug: 'tetris' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('ignores events nobody listens to', () => {
    expect(() => bus.emit('comment:liked', { commentId: 'c1' })).not.toThrow();
  });
});
