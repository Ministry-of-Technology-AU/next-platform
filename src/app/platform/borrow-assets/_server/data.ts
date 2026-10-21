import 'server-only';

/**
 * Strapi access for Borrow Assets (`assets`, `borrow-requests`). The page calls these directly;
 * the API routes wrap them.
 *
 * Split per caching.md §2: the catalogue (items and whether each is on loan) is the same for
 * everyone, so it sits in L2 under one key. Bookmarks, the phone number and "you've already asked"
 * are per-user and fetched fresh on every load.
 *
 * Availability comes from the asset's `is_issued` flag, which a POC ticks in Strapi when they hand
 * the item over and unticks when it comes back. The issued, unreturned request (if any) only
 * supplies the "back by" date.
 *
 * A viewer's request shows as "Requested" until it is issued, returned, its return date passes,
 * or REQUEST_EXPIRY_DAYS go by with nobody acting on it. After that they can ask again.
 */

import { strapiGet, strapiPut } from '@/lib/apis/strapi';
import type { StrapiQueryParams } from '@/lib/apis/strapi';
import type { AuthenticatedUser } from '@/lib/auth';
import { sharedCache } from '@/lib/cache/shared';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { getCurrentDateISTString, isOverdueIST } from '@/lib/date-utils';
import { REQUEST_EXPIRY_DAYS } from '../data';
import type { Asset, AssetOwner, AssetStatus, BorrowAssetsData, CatalogueAsset } from '../types';

// --- Strapi v4 response shapes (only the fields we read) ---

interface StrapiRelation<T> {
  data: { id: number; attributes: T } | null;
}

interface StrapiRelationList<T> {
  data: Array<{ id: number; attributes: T }> | null;
}

interface StrapiRequestAttrs {
  to: string | null;
  issued_on: string | null;
  returned_on: string | null;
  issued_by?: StrapiRelation<unknown>;
  returned_to?: StrapiRelation<unknown>;
}

interface StrapiAssetAttrs {
  name: string | null;
  description: string | null;
  type: string | null;
  owner: string | null;
  image: string | null;
  is_issued: boolean | number | string | null;
  borrow_requests?: StrapiRelationList<StrapiRequestAttrs>;
}

interface StrapiAsset {
  id: number;
  attributes: StrapiAssetAttrs;
}

/** users-permissions returns users flat, not wrapped in data/attributes. */
interface StrapiUser {
  id: number;
  phone?: string | null;
  phone_number?: string | null;
  bookmarked_assets?: Array<{ id: number }>;
}

// A relation's id is all we need to know it's set; `username` is the smallest field to ask for.
const USER_STUB = { fields: ['username'] };
const REQUEST_FIELDS = ['to', 'issued_on', 'returned_on'];

const ASSET_QUERY: StrapiQueryParams = {
  fields: ['name', 'description', 'type', 'owner', 'image', 'is_issued'],
  populate: {
    // Only unreturned requests come back; the issued one gives the "back by" date.
    borrow_requests: {
      filters: { returned_on: { $null: true } },
      fields: REQUEST_FIELDS,
      populate: { issued_by: USER_STUB, returned_to: USER_STUB },
    },
  },
};

function isIssued(request: StrapiRequestAttrs): boolean {
  return !!request.issued_on || !!request.issued_by?.data;
}

function isReturned(request: StrapiRequestAttrs): boolean {
  return !!request.returned_on || !!request.returned_to?.data;
}

const OWNERS: Readonly<Record<string, AssetOwner>> = { techmin: 'Techmin', jazbaa: 'Jazbaa' };

/** Reads Strapi's `owner` enum (`techmin` / `jazbaa`). Missing or unknown is Techmin, the original lender. */
function toAssetOwner(value: string | null): AssetOwner {
  return (value && OWNERS[value.toLowerCase()]) || 'Techmin';
}

/** Cloudinary URLs arrive absolute. Old local uploads arrive relative and need Strapi's host. */
function absoluteImageUrl(url: string): string {
  if (!url.startsWith('/')) return url;
  return `${process.env.STRAPI_IMAGE_URL || 'http://localhost:1337'}${url}`;
}

function toCatalogueAsset(raw: StrapiAsset): CatalogueAsset {
  const a = raw.attributes ?? (raw as unknown as StrapiAssetAttrs);
  const name = a.name?.trim() || 'Unnamed item';
  const image = a.image?.trim();
  const onLoan = Boolean(a.is_issued === true || a.is_issued === 1 || a.is_issued === 'true');
  // Only for the "back by" date. Whether the item is out is the POC's is_issued tick alone.
  const loan = onLoan
    ? (a.borrow_requests?.data ?? [])
        .map((request) => request.attributes)
        .find((request) => isIssued(request) && !isReturned(request))
    : undefined;

  return {
    id: String(raw.id),
    name,
    description: a.description?.trim() ?? '',
    type: a.type ?? 'other',
    owner: toAssetOwner(a.owner),
    image: image ? { url: absoluteImageUrl(image), alt: name } : null,
    onLoan,
    dueBack: loan?.to ?? null,
  };
}

// Key cardinality: 1 (no arguments). The same list for every viewer. Strapi's webhook clears it
// when an asset or a request changes (STRAPI_MODEL_TAGS); the hour is only a backstop.
const getCatalogue = sharedCache(
  async (): Promise<CatalogueAsset[]> => {
    const response = (await strapiGet('/assets', {
      ...ASSET_QUERY,
      sort: ['name:asc'],
      // The catalogue is a few dozen physical items; one page covers it.
      pagination: { pageSize: 200 },
    })) as { data?: StrapiAsset[] } | null;
    // Throwing keeps a bad response out of the cache. An empty list would stick for an hour.
    if (!Array.isArray(response?.data)) throw new Error('Strapi returned no asset list');
    return response.data.map(toCatalogueAsset);
  },
  ['borrow-assets-catalogue-v2'],
  { tags: [CACHE_TAGS.borrowAssets], revalidate: 60 * 60 },
);

/**
 * One asset read fresh from Strapi, skipping the cache. The request route uses it so a loan
 * recorded seconds ago still blocks a new request. Null when the asset doesn't exist.
 */
export async function getAssetUncached(assetId: number): Promise<CatalogueAsset | null> {
  const response = (await strapiGet(`/assets/${assetId}`, ASSET_QUERY).catch(() => null)) as {
    data?: StrapiAsset | null;
  } | null;
  return response?.data ? toCatalogueAsset(response.data) : null;
}

/**
 * Ids of the assets the viewer has asked for that nobody has handed over yet. A request goes
 * stale, and stops counting, once its return date passes or after REQUEST_EXPIRY_DAYS untouched.
 */
export async function getOpenRequestAssetIds(uid: number): Promise<Set<string>> {
  const expiresBefore = new Date(Date.now() - REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const response = (await strapiGet('/borrow-requests', {
    filters: {
      user: { id: { $eq: uid } },
      issued_on: { $null: true },
      returned_on: { $null: true },
      to: { $gte: getCurrentDateISTString() },
      createdAt: { $gte: expiresBefore },
    },
    fields: REQUEST_FIELDS,
    populate: { asset: { fields: ['name'] }, issued_by: USER_STUB, returned_to: USER_STUB },
    pagination: { pageSize: 50 },
  })) as { data?: Array<{ id: number; attributes: StrapiRequestAttrs & { asset?: StrapiRelation<unknown> } }> } | null;

  const ids = new Set<string>();
  for (const { attributes } of response?.data ?? []) {
    const assetId = attributes.asset?.data?.id;
    if (assetId && !isIssued(attributes) && !isReturned(attributes)) ids.add(String(assetId));
  }
  return ids;
}

function statusOf({ onLoan, dueBack }: Pick<CatalogueAsset, 'onLoan' | 'dueBack'>): AssetStatus {
  if (!onLoan) return 'available';
  // Worked out on every read, not cached, because "overdue" changes with the date.
  return dueBack && isOverdueIST(dueBack) ? 'overdue' : 'borrowed';
}

async function getUser(uid: number): Promise<StrapiUser | null> {
  // No root `fields`: the phone attribute's name differs between environments, and asking
  // for one that doesn't exist makes Strapi reject the whole request.
  const user: StrapiUser | null = await strapiGet(`/users/${uid}`, {
    populate: { bookmarked_assets: { fields: ['name'] } },
  });
  return user;
}

/** The whole catalogue, shaped for the page, with the viewer's bookmarks, open requests and phone. */
export async function getBorrowAssets(user: AuthenticatedUser): Promise<BorrowAssetsData> {
  const [catalogue, strapiUser, pending] = await Promise.all([
    getCatalogue(),
    user.uid ? getUser(user.uid) : Promise.resolve(null),
    user.uid ? getOpenRequestAssetIds(user.uid) : Promise.resolve(new Set<string>()),
  ]);

  const bookmarked = new Set((strapiUser?.bookmarked_assets ?? []).map((asset) => String(asset.id)));
  const assets: Asset[] = catalogue.map(({ onLoan, ...item }) => ({
    ...item,
    status: statusOf({ onLoan, dueBack: item.dueBack }),
    // Once a POC issues the item, "Unavailable" wins over the viewer's own pending request.
    pendingForMe: !onLoan && pending.has(item.id),
    bookmarked: bookmarked.has(item.id),
  }));
  const phone = strapiUser?.phone_number ?? strapiUser?.phone ?? '';

  return { assets, phone: phone.replace(/\D/g, '').slice(-10) };
}

/** Sets whether `assetId` is in the user's saved list. Idempotent. */
export async function setBookmark(uid: number, assetId: number, bookmarked: boolean): Promise<void> {
  const user = await getUser(uid);
  const current = new Set((user?.bookmarked_assets ?? []).map((asset) => asset.id));
  if (current.has(assetId) === bookmarked) return;

  if (bookmarked) current.add(assetId);
  else current.delete(assetId);

  await strapiPut(`/users/${uid}`, { bookmarked_assets: [...current] });
}
