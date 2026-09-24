import 'server-only';

import { unstable_cache } from 'next/cache';
import type { CacheTag } from './tags';

/**
 * L2: Next Data Cache (on disk, .next/cache/fetch-cache) for data shared by every user.
 * See .agents/blueprints/caching.md (L2).
 *
 * The cache key is `keyParts` plus the call's arguments. Every distinct argument value
 * writes its own file, so arguments must come from a small fixed set (a Strapi id at most).
 * Never pass an email, a user id, a search string or a date.
 *
 * The return value must be JSON-serialisable.
 */
export interface SharedCacheOptions {
  /** At least one tag, so a Strapi webhook or a write can invalidate the entry. */
  tags: readonly [CacheTag, ...CacheTag[]];
  /** Backstop in seconds. Tags do the real invalidation, so this can be long. */
  revalidate: number;
}

export function sharedCache<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  keyParts: readonly string[],
  { tags, revalidate }: SharedCacheOptions,
): (...args: Args) => Promise<R> {
  return unstable_cache(fn, [...keyParts], { tags: [...tags], revalidate });
}
