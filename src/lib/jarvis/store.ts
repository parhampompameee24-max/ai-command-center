export type Listener = () => void;

export interface Store<T> {
  get(): T;
  set(updater: T | ((prev: T) => T)): void;
  subscribe(fn: Listener): () => void;
  hydrate(): void;
}

/**
 * Tiny observable store with optional localStorage persistence.
 * Persistence is applied only after an explicit hydrate() call so that
 * server render and first client render stay identical.
 */
export function createStore<T extends object>(key: string | null, initial: T): Store<T> {
  let state = initial;
  let hydrated = false;
  const subs = new Set<Listener>();

  const emit = () => subs.forEach((fn) => fn());

  const persist = () => {
    if (!key || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* storage full or blocked - ignore */
    }
  };

  return {
    get: () => state,
    set(updater) {
      const next = typeof updater === "function" ? (updater as (prev: T) => T)(state) : updater;
      if (next === state) return;
      state = next;
      persist();
      emit();
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    hydrate() {
      if (hydrated || !key || typeof window === "undefined") return;
      hydrated = true;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          state = { ...state, ...(JSON.parse(raw) as Partial<T>) };
          emit();
        }
      } catch {
        /* corrupted payload - keep defaults */
      }
    },
  };
}

export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
