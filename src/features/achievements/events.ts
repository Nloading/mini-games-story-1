import type { Achievement } from './types';

export interface AppEvents {
  'favorite:added': { gameSlug: string };
  'comment:posted': { gameSlug: string };
  'comment:liked': { commentId: string };
  'game:opened': { gameSlug: string };
  'achievement:unlocked': { achievement: Achievement };
}

type Listener<T> = (payload: T) => void;

class EventBus<Events extends object> {
  private listeners = new Map<keyof Events, Set<Listener<never>>>();

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const set = this.listeners.get(event) ?? new Set<Listener<never>>();
    set.add(listener);
    this.listeners.set(event, set);

    return () => {
      set.delete(listener);
    };
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners.get(event)?.forEach((listener) => {
      (listener as Listener<Events[K]>)(payload);
    });
  }
}

export const bus = new EventBus<AppEvents>();
