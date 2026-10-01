/**
 * Registry of L2 (Data Cache) tags for data shared by every user.
 * See .agents/blueprints/caching.md (L2).
 *
 * Adding a tag here is a statement that the data is global and has a small, fixed
 * number of cache keys. Per-user data never gets a tag, because it never goes in L2.
 *
 * Per-entity tags (one form, one induction cycle) stay next to their data module,
 * e.g. formTag() in src/lib/forms/strapi-forms.ts.
 */

export const CACHE_TAGS = {
  adverts: 'adverts',
  metrics: 'metrics',
  organisations: 'organisations',
  courses: 'courses',
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Strapi webhook `model` (the collection type's singular name) → tags to invalidate.
 * Used by /api/revalidate. Check the model name against the webhook payload in
 * Strapi before relying on a new entry.
 */
export const STRAPI_MODEL_TAGS: Readonly<Record<string, readonly CacheTag[]>> = {
  advertisement: [CACHE_TAGS.adverts],
  organisation: [CACHE_TAGS.organisations],
  course: [CACHE_TAGS.courses],
  review: [CACHE_TAGS.metrics, CACHE_TAGS.courses],
  pool: [CACHE_TAGS.metrics],
  service: [CACHE_TAGS.metrics],
  user: [CACHE_TAGS.metrics],
};
