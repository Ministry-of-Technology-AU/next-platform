/**
 * Cache-Control presets for our own route handlers. See .agents/blueprints/caching.md (Browser tier).
 *
 * Nothing in /api sits behind a CDN, so these only steer the browser cache.
 * `shared` is only for bodies that are identical for every user: no email, no user id,
 * no "applied"/"tracked" flags. A body with any of those uses `private` or `privateShort`.
 */
export const CACHE_CONTROL = {
  /** Per-user data that must be fresh on every load. */
  private: 'private, no-store',
  /** Per-user data that can be a minute old, e.g. preferences. Browser only. */
  privateShort: 'private, max-age=60, stale-while-revalidate=300',
  /** Same body for every user, e.g. adverts, metrics, the org list without user fields. */
  shared: 'public, max-age=300, stale-while-revalidate=3600',
} as const;

export type CacheControlPreset = keyof typeof CACHE_CONTROL;

export function withCacheControl<T extends Response>(response: T, preset: CacheControlPreset): T {
  response.headers.set('Cache-Control', CACHE_CONTROL[preset]);
  return response;
}
