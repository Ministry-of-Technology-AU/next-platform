import { getOptimizedImageUrl } from '@/lib/apis/cloudinary-url';
import { formatISTDate, getISTCalendarDaysDiff } from '@/lib/date-utils';
import { CATEGORY_LABELS, TYPE_LABELS } from './data';
import type { Asset, AssetTab } from './types';

export const ALL_TYPES = 'all';

export function inTab(asset: Asset, tab: AssetTab): boolean {
  if (tab === 'All') return true;
  if (tab === 'Saved') return asset.bookmarked;
  return asset.owner === tab;
}

function matchesQuery(asset: Asset, query: string): boolean {
  if (!query) return true;
  return [asset.name, asset.description, asset.type, categoryLabel(asset.type), asset.owner]
    .some((text) => text.toLowerCase().includes(query));
}

export interface FilteredAssets {
  available: Asset[];
  out: Asset[];
}

/** Applies tab, type and search, then splits into what can be borrowed now and what's out. */
export function filterAssets(assets: Asset[], tab: AssetTab, type: string, query: string): FilteredAssets {
  const q = query.trim().toLowerCase();
  const matches = assets.filter(
    (asset) => inTab(asset, tab) && (type === ALL_TYPES || asset.type === type) && matchesQuery(asset, q),
  );
  return {
    available: matches.filter((asset) => asset.status === 'available'),
    out: matches.filter((asset) => asset.status !== 'available'),
  };
}

/** Types present in the tab, in a stable order, so the chips never offer an empty filter. */
export function typesInTab(assets: Asset[], tab: AssetTab): string[] {
  return [...new Set(assets.filter((asset) => inTab(asset, tab)).map((asset) => asset.type))].sort((a, b) =>
    typeLabel(a).localeCompare(typeLabel(b)),
  );
}

function titleCase(type: string): string {
  return type.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "mobile" → "Phones", for filters. Types added in Strapi later fall back to Title Case. */
export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? titleCase(type);
}

/** "mobile" → "Phone", for one item's card. */
export function categoryLabel(type: string): string {
  return CATEGORY_LABELS[type] ?? titleCase(type);
}

/** Cloudinary-transformed URL at 4:3. Non-Cloudinary URLs come back unchanged. */
export function assetImageUrl(url: string, width: number): string {
  return getOptimizedImageUrl(url, { width, height: Math.round((width * 3) / 4), crop: 'fill' });
}

export const CARD_IMAGE_WIDTHS = [320, 480, 640, 960] as const;

export function assetImageSrcSet(url: string): string {
  return CARD_IMAGE_WIDTHS.map((w) => `${assetImageUrl(url, w)} ${w}w`).join(', ');
}

/** "20 Oct" — short enough for a card. */
export function shortDate(date: string): string {
  return formatISTDate(date, { day: 'numeric', month: 'short' });
}

/** "Fri, 24 Oct" */
export function longDate(date: string): string {
  return formatISTDate(date, { weekday: 'short', day: 'numeric', month: 'short' });
}

/** "today", "tomorrow", "in 6 days" */
export function relativeDays(date: string): string {
  const days = getISTCalendarDaysDiff(date);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/** What a card says when the item can't be borrowed right now. */
export function unavailableLabel(_asset?: Asset): string {
  return 'Unavailable';
}
