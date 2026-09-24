import 'server-only';

/**
 * L1: bounded in-process LRU with a TTL. Lives on the Node heap, never touches disk,
 * and is cleared on every redeploy. See .agents/blueprints/caching.md (L1).
 *
 * `max` is required on purpose. An uncapped map is how a cache eats the box.
 * Keep entries small (ids, flags, short strings). Whole API payloads do not belong here.
 */

type Entry<T> = { value: T; expires: number };

export interface Lru<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
  readonly size: number;
}

export function createLru<T>(max: number, ttlMs: number): Lru<T> {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error(`createLru: max must be a positive integer, got ${max}`);
  }
  if (ttlMs <= 0) {
    throw new Error(`createLru: ttlMs must be positive, got ${ttlMs}`);
  }

  const map = new Map<string, Entry<T>>();

  return {
    get(key) {
      const hit = map.get(key);
      if (!hit) return undefined;
      if (Date.now() > hit.expires) {
        map.delete(key);
        return undefined;
      }
      // Re-insert so Map order stays least-recently-used first.
      map.delete(key);
      map.set(key, hit);
      return hit.value;
    },
    set(key, value) {
      if (map.has(key)) {
        map.delete(key);
      } else if (map.size >= max) {
        const oldest = map.keys().next().value;
        if (oldest !== undefined) map.delete(oldest);
      }
      map.set(key, { value, expires: Date.now() + ttlMs });
    },
    delete(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
    get size() {
      return map.size;
    },
  };
}
