import 'server-only';

/**
 * Strapi reads for Borrow Assets. The page calls these directly; the API routes wrap them.
 * Per-user (bookmarks, "you've requested this"), so nothing here is cached.
 */

import { strapiGet, strapiPut } from '@/lib/apis/strapi';
import type { AuthenticatedUser } from '@/lib/auth';
import { isOverdueIST } from '@/lib/date-utils';
import type { Asset, AssetStatus, BorrowAssetsData } from '@/app/platform/borrow-assets/types';
import { toAssetOwner } from './policy';

// --- Strapi v4 response shapes (only the fields we read) ---

interface StrapiRelation<T> {
  data: { id: number; attributes: T } | null;
}

interface StrapiBorrowRequestAttrs {
  to: string | null;
  issued: number | null;
  returned: number | null;
  user?: StrapiRelation<Record<string, never>>;
}

interface StrapiAssetAttrs {
  name: string | null;
  model: string | null;
  description: string | null;
  type: string | null;
  owner?: string | null;
  Image?: StrapiRelation<{ url: string; alternativeText: string | null }>;
  last_borrow_request?: StrapiRelation<StrapiBorrowRequestAttrs>;
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

/** An issued, unreturned request means the item is out. */
export function isOut(request: Pick<StrapiBorrowRequestAttrs, 'issued' | 'returned'> | undefined | null): boolean {
  return request?.issued === 1 && request.returned !== 1;
}

/** A request nobody has acted on yet: not issued, not returned. */
function isPending(request: StrapiBorrowRequestAttrs): boolean {
  return request.issued !== 1 && request.returned !== 1;
}

function statusOf(request: StrapiBorrowRequestAttrs | undefined): AssetStatus {
  if (!request || !isOut(request)) return 'available';
  return request.to && isOverdueIST(request.to) ? 'overdue' : 'borrowed';
}

/** Cloudinary URLs arrive absolute. Old local uploads arrive relative and need Strapi's host. */
export function absoluteImageUrl(url: string): string {
  if (!url.startsWith('/')) return url;
  return `${process.env.STRAPI_IMAGE_URL || 'http://localhost:1337'}${url}`;
}

function toAsset(raw: StrapiAsset, viewerId: number | null, bookmarked: Set<number>): Asset {
  const a = raw.attributes;
  const lastRequest = a.last_borrow_request?.data;
  const request = lastRequest?.attributes;
  const image = a.Image?.data?.attributes;
  const name = a.name?.trim() || 'Unnamed item';

  return {
    id: String(raw.id),
    name,
    model: a.model?.trim() || null,
    description: a.description?.trim() ?? '',
    type: a.type ?? 'other',
    owner: toAssetOwner(a.owner),
    status: statusOf(request),
    image: image?.url ? { url: absoluteImageUrl(image.url), alt: image.alternativeText || name } : null,
    dueBack: request && isOut(request) ? request.to : null,
    pendingForMe:
      !!request && viewerId !== null && isPending(request) && request.user?.data?.id === viewerId,
    bookmarked: bookmarked.has(raw.id),
  };
}

async function getUser(uid: number): Promise<StrapiUser | null> {
  // No root `fields`: the phone attribute's name differs between environments, and asking
  // for one that doesn't exist makes Strapi reject the whole request.
  const user: StrapiUser | null = await strapiGet(`/users/${uid}`, {
    populate: { bookmarked_assets: { fields: ['name'] } },
  });
  return user;
}

/** The whole catalogue, shaped for the page, with the viewer's bookmarks and phone. */
export async function getBorrowAssets(user: AuthenticatedUser): Promise<BorrowAssetsData> {
  const [assetsResponse, strapiUser] = await Promise.all([
    // No root `fields` either: `owner` is new, and environments without it would 400.
    strapiGet('/assets', {
      populate: {
        Image: { fields: ['url', 'alternativeText'] },
        last_borrow_request: {
          fields: ['to', 'issued', 'returned'],
          populate: { user: { fields: ['username'] } },
        },
      },
      sort: ['name:asc'],
      // The catalogue is a few dozen physical items; one page covers it.
      pagination: { pageSize: 200 },
    }) as Promise<{ data?: StrapiAsset[] } | null>,
    user.uid ? getUser(user.uid) : Promise.resolve(null),
  ]);

  const bookmarked = new Set((strapiUser?.bookmarked_assets ?? []).map((asset) => asset.id));
  const assets = (assetsResponse?.data ?? []).map((raw) => toAsset(raw, user.uid, bookmarked));
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
