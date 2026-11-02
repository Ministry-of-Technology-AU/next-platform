import 'server-only';

import { z } from 'zod';
import { strapiGet } from '@/lib/apis/strapi';
import { sharedCache } from '@/lib/cache/shared';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { DEFAULT_POC_EMAILS } from '../data';
import type { AssetOwner } from '../types';

/**
 * Who gets CC'd on a borrow request, per lender. Lives in the Strapi single type
 * `borrow-assets-poc`: one comma-separated string per lender (`techmin`, `jazbaa`).
 */

export type PocEmails = Record<AssetOwner, string[]>;

const email = z.string().trim().toLowerCase().email();

/** "a@x.in, b@x.in" -> ["a@x.in", "b@x.in"]. Anything that isn't an address is dropped. */
function parseEmails(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  const valid = value
    .split(',')
    .map((part) => email.safeParse(part))
    .flatMap((result) => (result.success ? [result.data] : []));
  return [...new Set(valid)];
}

// Key cardinality: 1 (no arguments). Same for every viewer, changes a few times a year.
// Strapi's webhook clears it on publish (STRAPI_MODEL_TAGS); the day is only a backstop.
const getCachedPocEmails = sharedCache(
  async (): Promise<PocEmails> => {
    const response = (await strapiGet('/borrow-assets-poc')) as {
      data?: { attributes?: { techmin?: unknown; jazbaa?: unknown } } | null;
    } | null;
    const attrs = response?.data?.attributes;
    // Throwing keeps a bad response out of the cache; the caller falls back to the defaults.
    if (!attrs) throw new Error('Strapi returned no Borrow Assets POC entry');
    return { Techmin: parseEmails(attrs.techmin), Jazbaa: parseEmails(attrs.jazbaa) };
  },
  ['borrow-assets-pocs-v1'],
  { tags: [CACHE_TAGS.borrowAssetsPocs], revalidate: 60 * 60 * 24 },
);

/**
 * POC addresses for the lender that owns an asset. Falls back to the lender's team inbox when
 * Strapi is unreachable or the field is empty, so a request is never sent to nobody.
 */
export async function getPocEmails(owner: AssetOwner): Promise<string[]> {
  try {
    const pocs = await getCachedPocEmails();
    if (pocs[owner].length > 0) return pocs[owner];
  } catch (error) {
    platform.error('Borrow Assets: reading POCs from Strapi failed, using defaults:', error);
  }
  return DEFAULT_POC_EMAILS[owner];
}
